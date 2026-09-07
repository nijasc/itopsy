import { error, type Handle, type RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { lucia, SESSION_COOKIE_PATH } from '$lib/server/auth';
import { requireRole } from '$lib/server/authz';
import { rateLimit } from '$lib/server/rate-limit';

/** Validates the session cookie and populates `event.locals.user` / `.session`. */
async function attachSession(event: RequestEvent) {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return;
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: SESSION_COOKIE_PATH,
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: SESSION_COOKIE_PATH,
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;
}

function clientAddress(event: RequestEvent): string {
	try {
		return event.getClientAddress();
	} catch {
		return 'unknown';
	}
}

/**
 * Coarse abuse brakes: per client IP for anonymous traffic, per user for
 * writes. The limiter is in-memory (see $lib/server/rate-limit), so on
 * multi-instance deployments these are per-instance ceilings.
 */
function enforceRateLimits(event: RequestEvent) {
	const { pathname } = event.url;
	const method = event.request.method;
	const ip = clientAddress(event);
	const actor = event.locals.user?.id ?? `ip:${ip}`;

	let verdict = null;
	if (method === 'POST' && (pathname === '/login' || pathname === '/signup')) {
		verdict = rateLimit(`auth:${ip}`, 10, 15 * 60_000);
	} else if (method === 'POST' && pathname === '/profile') {
		verdict = rateLimit(`profile:${actor}`, 10, 15 * 60_000);
	} else if (method === 'POST' && pathname.startsWith('/study/')) {
		verdict = rateLimit(`write:${actor}`, 20, 60_000);
	} else if (method === 'POST' && pathname.startsWith('/admin')) {
		verdict = rateLimit(`admin:${actor}`, 60, 60_000);
	} else if (method === 'GET' && pathname === '/api/studies') {
		verdict = rateLimit(`api:${ip}`, 60, 60_000);
	}

	if (verdict && !verdict.ok) {
		error(429, `Too many requests. The registry needs ${verdict.retryAfterSec}s to recover.`);
	}
}

function applySecurityHeaders(response: Response) {
	const headers = response.headers;
	// Clickjacking: only this origin may frame app pages. 'self' rather than
	// 'none' because sandboxed srcdoc iframes inherit the parent document's
	// CSP, and the case-study frames are embedded by this very origin.
	headers.set('X-Frame-Options', 'SAMEORIGIN');
	headers.set('Content-Security-Policy', "frame-ancestors 'self'");
	headers.set('X-Content-Type-Options', 'nosniff');
	headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
	if (!dev) headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

export const handle: Handle = async ({ event, resolve }) => {
	await attachSession(event);

	// Everything under /admin — pages, form actions, and client-side data
	// requests — must come from an admin. The admin layout's load guard alone
	// doesn't rerun on client-side navigation between admin routes, so this
	// is the authoritative check.
	if (event.url.pathname.startsWith('/admin')) requireRole(event.locals.user, 'admin');

	enforceRateLimits(event);

	const response = await resolve(event);
	applySecurityHeaders(response);
	return response;
};
