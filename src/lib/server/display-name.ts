/**
 * The name shown next to a user's public activity (comments, replies).
 *
 * Email addresses must never reach the client for anyone but the signed-in
 * user themself, so when no display name has been chosen we fall back to a
 * stable pseudonym derived from the user id rather than any part of the email.
 */
export function publicName(user: { id: string; displayName: string | null } | null): string {
	if (!user) return 'Former witness';
	const chosen = user.displayName?.trim();
	if (chosen) return chosen;
	return `Witness ${user.id.slice(-4).toUpperCase()}`;
}
