/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Good enough to blunt credential stuffing and comment spam on a single
 * instance. On multi-instance or serverless deployments every instance keeps
 * its own counters, so treat this as a brake rather than a wall and put a
 * platform-level limiter (WAF, edge rules, Upstash, ...) in front for real
 * production traffic.
 */

const buckets = new Map<string, number[]>();
const SWEEP_INTERVAL_MS = 60_000;
const BUCKET_TTL_MS = 15 * 60_000;
let lastSweep = Date.now();

export interface RateLimitVerdict {
	ok: boolean;
	/** Seconds until the oldest hit in the window expires (0 when ok). */
	retryAfterSec: number;
}

/** Records a hit for `key` and reports whether it exceeds `limit` hits per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitVerdict {
	const now = Date.now();
	sweep(now);

	const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
	if (hits.length >= limit) {
		buckets.set(key, hits);
		return { ok: false, retryAfterSec: Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000)) };
	}

	hits.push(now);
	buckets.set(key, hits);
	return { ok: true, retryAfterSec: 0 };
}

/** Drops buckets that have been idle long enough to be irrelevant, at most once a minute. */
function sweep(now: number) {
	if (now - lastSweep < SWEEP_INTERVAL_MS) return;
	lastSweep = now;
	for (const [key, hits] of buckets) {
		if (hits.length === 0 || now - hits[hits.length - 1] > BUCKET_TTL_MS) buckets.delete(key);
	}
}
