/**
 * Process details array from Gemini API response
 * Gemini returns a flat array of details with the structure:
 * [{ type, advanced, strengths, weaknesses, learnerTimestamp, coachTimestamp }, ...]
 */
export function buildDetailsArrayFromComparison(details: any) {
  // If details is not an array or is empty, return empty array
  if (!Array.isArray(details) || details.length === 0) {
    return [];
  }

  // Gemini already returns the details in the correct format
  // Just validate and return them
  return details.filter((detail: any) => {
    // Ensure each detail has the required fields
    return (
      detail &&
      typeof detail === 'object' &&
      detail.type &&
      detail.advanced !== undefined &&
      detail.strengths &&
      detail.weaknesses &&
      detail.learnerTimestamp &&
      detail.coachTimestamp
    );
  });
}
