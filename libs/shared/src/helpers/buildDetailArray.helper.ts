export function buildDetailsArrayFromComparison(comparison: any) {
  if (!comparison) return [];
  const mapKey = {
    preparation: 'PREPARATION',
    swingAndContact: 'SWING_AND_CONTACT',
    followThrough: 'FOLLOW_THROUGH',
  };
  const details: any[] = [];

  Object.keys(comparison).forEach((key) => {
    const value = comparison[key];
    const type = mapKey[key] || key;
    const advanced = value.advantage || '';

    // Create record for COACH (player1)
    if (value.player1) {
      const coachDetail: any = {
        type,
        advanced,
        userRole: 'COACH',
      };
      if (value.player1?.strengths?.length > 0) {
        coachDetail.strengths = value.player1.strengths;
      }
      if (value.player1?.weaknesses?.length > 0) {
        coachDetail.weaknesses = value.player1.weaknesses;
      }
      if (
        value.player1?.timestamp !== undefined &&
        value.player1?.timestamp !== null
      ) {
        coachDetail.timestamp = value.player1.timestamp;
      }
      details.push(coachDetail);
    }

    // Create record for LEARNER (player2)
    if (value.player2) {
      const learnerDetail: any = {
        type,
        advanced,
        userRole: 'LEARNER',
      };
      if (value.player2?.strengths?.length > 0) {
        learnerDetail.strengths = value.player2.strengths;
      }
      if (value.player2?.weaknesses?.length > 0) {
        learnerDetail.weaknesses = value.player2.weaknesses;
      }
      if (
        value.player2?.timestamp !== undefined &&
        value.player2?.timestamp !== null
      ) {
        learnerDetail.timestamp = value.player2.timestamp;
      }
      details.push(learnerDetail);
    }
  });

  return details;
}
