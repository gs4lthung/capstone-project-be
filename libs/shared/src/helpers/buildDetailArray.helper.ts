export function buildDetailsArrayFromComparison(comparison: any) {
  if (!comparison) return [];
  const mapKey = {
    preparation: 'PREPARATION',
    swingAndContact: 'SWING_AND_CONTACT',
    followThrough: 'FOLLOW_THROUGH',
  };
  return Object.keys(comparison).map((key) => {
    const value = comparison[key];
    return {
      type: mapKey[key] || key,
      advanced: value.advantage || '',
      // Player 1 (coach)
      player1: {
        analysis: value.player1?.analysis,
        strengths: value.player1?.strengths,
        weaknesses: value.player1?.weaknesses,
        timestamp: value.player1?.timestamp,
      },
      // Player 2 (learner)
      player2: {
        analysis: value.player2?.analysis,
        strengths: value.player2?.strengths,
        weaknesses: value.player2?.weaknesses,
        timestamp: value.player2?.timestamp,
      },
    };
  });
}
