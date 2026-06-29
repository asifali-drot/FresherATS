/**
 * STUB: Student Verification
 * 
 * TODO: Implement a student verification flow (e.g., via SheerID, UNiDAYS, or a manual .edu email flow).
 * For now, this returns false so unverified users cannot bypass standard pricing.
 * Once implemented, update this to read from a students.verified_at flag in the DB.
 */
export async function isStudentVerified(userId: string): Promise<boolean> {
  // Returns false so we don't accidentally give away unverified discounts.
  return false;
}

/**
 * Checks if a given email belongs to an academic domain (.edu, .ac, etc.)
 */
export function isAcademicEmail(email?: string | null): boolean {
  if (!email) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;

  // Catches .edu, .edu.pk, .edu.au, .edu.sg, .edu.my, etc.
  const hasEduSegment = domain.includes('.edu.') || domain.endsWith('.edu');

  // Catches .ac.uk, .ac.in, .ac.za, etc. (Commonwealth-style academic TLDs)
  const hasAcSegment = domain.includes('.ac.') || domain.endsWith('.ac');

  return hasEduSegment || hasAcSegment;
}
