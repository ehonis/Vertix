import { CompletionType, MixerCompletion } from "@prisma/client";

export const filterCompletionsByType = (completions: MixerCompletion[]) => {
    const boulderCompletions = completions.filter(
        completion => completion.type === CompletionType.BOULDER
      );
  
      const ropeCompletions = completions.filter(
        completion => completion.type === CompletionType.ROPE
      );

      return {boulderCompletions, ropeCompletions}
};
export const groupByCompletionsClimberId = (completions: MixerCompletion[]) => {
    return completions.reduce((acc, completion) => {
        acc[completion.climberId] = [...(acc[completion.climberId] || []), completion];
        return acc;
    }, {} as Record<string, MixerCompletion[]>);
}

export const findTwoHighestRopeScores = (ropeCompletions: MixerCompletion[]) => {
    // Sort completions by points in descending order
    const sortedRopeCompletions = ropeCompletions.sort((a, b) => b.points - a.points);
    // Take up to 2 highest scores - will return all available completions if fewer than 2
    return sortedRopeCompletions.slice(0, 2);
}
export const findThreeHighestBoulderScores = (boulderCompletions: MixerCompletion[]) => {
    // Sort completions by points in descending order
    const sortedBoulderCompletions = boulderCompletions.sort((a, b) => b.points - a.points);
    // Take up to 3 highest scores - will return all available completions if fewer than 3
    return sortedBoulderCompletions.slice(0, 3);
}
export const findTwoHighestRopeScoresPerClimber = (groupedByClimberId: Record<string, MixerCompletion[]>) => {
    return Object.keys(groupedByClimberId).map(climberId => {
        const ropeCompletions = groupedByClimberId[climberId].filter(completion => completion.type === CompletionType.ROPE);
        const twoHighestRopeScores = findTwoHighestRopeScores(ropeCompletions);
        return {climberId, twoHighestRopeScores};
    });
}
export const findThreeHighestBoulderScoresPerClimber = (groupedByClimberId: Record<string, MixerCompletion[]>) => {
    return Object.keys(groupedByClimberId).map(climberId => {
        const boulderCompletions = groupedByClimberId[climberId].filter(completion => completion.type === CompletionType.BOULDER);
        const threeHighestBoulderScores = findThreeHighestBoulderScores(boulderCompletions);
        return {climberId, threeHighestBoulderScores};
    });
}
export const combineTwoHighestRopeScoresPerClimberWithAttempts = (twoHighestRopeScoresPerClimber: {climberId: string, twoHighestRopeScores: MixerCompletion[]}[]) => {
    return twoHighestRopeScoresPerClimber.map(climber => {
        // Sum points and attempts from all available rope completions (up to 2)
        return {climberId: climber.climberId, points: climber.twoHighestRopeScores.reduce((acc, completion) => acc + completion.points, 0), attempts: climber.twoHighestRopeScores.reduce((acc, completion) => acc + completion.attempts, 0)};
    });
}
export const combineThreeHighestBoulderScoresPerClimberWithAttempts = (threeHighestBoulderScoresPerClimber: {climberId: string, threeHighestBoulderScores: MixerCompletion[]}[]) => {
    return threeHighestBoulderScoresPerClimber.map(climber => {
        // Sum points and attempts from all available boulder completions (up to 3)
        return {climberId: climber.climberId, points: climber.threeHighestBoulderScores.reduce((acc, completion) => acc + completion.points, 0), attempts: climber.threeHighestBoulderScores.reduce((acc, completion) => acc + completion.attempts, 0)};
    });
}