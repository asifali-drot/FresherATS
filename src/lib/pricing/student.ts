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
