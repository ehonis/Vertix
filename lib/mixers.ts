import { CompletionType, MixerBoulderScore, MixerCompletion, MixerDivision, MixerRopeScore } from "@prisma/client";
import prisma from "@/prisma";

interface Climber {
    climberName: string;
    division: string;
    boulderPlace: number;
    ropePlace: number;
    finishPlacePoints: number;
    bestIndividualPlace: number;
    worstIndividualPlace: number;
    overallPlace: number;
    originalDivision?: string;  // Track original division for movement indicators
}

interface DivisionStanding {
    divisionName: string;
    climbers: Climber[];
    averageFinishPlacePoints: number;
}

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

const formatDivisionStandings = (divisionStandings: {
    divisionName: string;
    climbers: {
        climberName: string;
        boulderPlace: number;
        ropePlace: number;
        finishPlacePoints: number;
        bestIndividualPlace: number;
        overallPlace: number;
        originalDivision?: string;
    }[];
    averageFinishPlacePoints: number;
}[]) => {
    divisionStandings.forEach((division, index) => {
        // Print division header
        console.log('\n' + '='.repeat(110));  // Increased width for new column
        console.log(`\nDivision: ${division.divisionName}`);
        console.log(`Average Finish Place Points: ${division.averageFinishPlacePoints}`);
        console.log('-'.repeat(110));  // Increased width for new column
        
        // Print header row with Movement column
        console.log(
            'Overall Place'.padEnd(15) +
            'Name'.padEnd(25) +
            'Boulder Place'.padEnd(15) +
            'Rope Place'.padEnd(15) +
            'Finish Points'.padEnd(15) +
            'Best Place'.padEnd(15) +
            'Movement'.padEnd(10)  // New column
        );
        console.log('-'.repeat(110));

        // Print each climber's data with movement indicator
        division.climbers.forEach(climber => {
            // Determine movement indicator
            let movementIndicator = '   ';  // Default: no movement (3 spaces)
            if (climber.originalDivision) {
                const divisionOrder = divisionStandings.findIndex(d => d.divisionName === division.divisionName);
                const originalDivisionOrder = divisionStandings.findIndex(d => d.divisionName === climber.originalDivision);
                const moveDistance = originalDivisionOrder - divisionOrder;
                
                if (moveDistance > 1) movementIndicator = '↑↑';
                else if (moveDistance === 1) movementIndicator = '↑ ';
                else if (moveDistance === -1) movementIndicator = '↓ ';
                else if (moveDistance < -1) movementIndicator = '↓↓';
            }

            console.log(
                `${climber.overallPlace}`.padEnd(15) +
                climber.climberName.padEnd(25) +
                `${climber.boulderPlace}`.padEnd(15) +
                `${climber.ropePlace}`.padEnd(15) +
                `${climber.finishPlacePoints}`.padEnd(15) +
                `${climber.bestIndividualPlace}`.padEnd(15) +
                movementIndicator.padEnd(10)
            );
        });

        // Print division summary
        console.log('-'.repeat(110));
        console.log(`Total Climbers in Division: ${division.climbers.length}\n`);
    });
};

const findOutliers = (divisionStandings: DivisionStanding[]) => {
    // Map division names to their index (represents division difficulty level)
    const divisionOrder = new Map(divisionStandings.map((div, index) => [div.divisionName, index]));
    
    const outliers = [];
    for (const division of divisionStandings) {
        for (const climber of division.climbers) {
            // Find the best fitting division based on finish points
            let bestFitDivision = division.divisionName;
            let bestFitDifference = Infinity;
            
            for (const potentialDiv of divisionStandings) {
                const difference = Math.abs(climber.finishPlacePoints - potentialDiv.averageFinishPlacePoints);
                if (difference < bestFitDifference) {
                    bestFitDifference = difference;
                    bestFitDivision = potentialDiv.divisionName;
                }
            }
            
            // If climber should move 2 or more divisions, mark as outlier
            const currentDivIndex = divisionOrder.get(division.divisionName)!;
            const bestFitDivIndex = divisionOrder.get(bestFitDivision)!;
            if (Math.abs(currentDivIndex - bestFitDivIndex) >= 2) {
                outliers.push({
                    climber,
                    fromDivision: division.divisionName,
                    toDivision: bestFitDivision
                });
            }
        }
    }
    return outliers;
};

const moveClimberBetweenDivisions = (
    divisionStandings: DivisionStanding[],
    climber: Climber,
    fromDivisionName: string,
    toDivisionName: string
) => {
    // Remove climber from old division
    const fromDivision = divisionStandings.find(d => d.divisionName === fromDivisionName)!;
    fromDivision.climbers = fromDivision.climbers.filter((c: Climber) => c.climberName !== climber.climberName);
    
    // Add climber to new division with original division tracking
    const toDivision = divisionStandings.find(d => d.divisionName === toDivisionName)!;
    toDivision.climbers.push({
        ...climber,
        division: toDivisionName,
        originalDivision: climber.originalDivision || fromDivisionName  // Keep original division if already set
    });
    
    // Recalculate averages for both divisions
    for (const div of [fromDivision, toDivision]) {
        if (div.climbers.length > 0) {
            const total = div.climbers.reduce((sum: number, c: Climber) => sum + c.finishPlacePoints, 0);
            div.averageFinishPlacePoints = Math.round(total / div.climbers.length);
        }
    }
    
    // Sort climbers within each division by overall place
    for (const div of divisionStandings) {
        div.climbers.sort((a: Climber, b: Climber) => a.overallPlace - b.overallPlace);
    }
    
    // Sort divisions by average points
    divisionStandings.sort((a, b) => a.averageFinishPlacePoints - b.averageFinishPlacePoints);
};

const adjustDivisions = (originalDivisionStandings: DivisionStanding[]) => {
    // Create a deep copy and mark original divisions
    const divisionStandings = JSON.parse(JSON.stringify(originalDivisionStandings));
    divisionStandings.forEach((division: DivisionStanding) => {
        division.climbers.forEach((climber: Climber) => {
            climber.originalDivision = division.divisionName;
        });
    });
    
    // First handle outliers (2 or more division moves)
    const outliers = findOutliers(divisionStandings);
    for (const {climber, fromDivision, toDivision} of outliers) {
        moveClimberBetweenDivisions(divisionStandings, climber as Climber, fromDivision, toDivision);
    }
    
    // Move climbers up based on rule d)
    for (let i = 0; i < divisionStandings.length - 1; i++) {
        const higherDiv = divisionStandings[i];
        const lowerDiv = divisionStandings[i + 1];
        
        const climbersToMoveUp = lowerDiv.climbers.filter(
            (climber: Climber) => climber.finishPlacePoints <= higherDiv.averageFinishPlacePoints
        );
        
        for (const climber of climbersToMoveUp) {
            moveClimberBetweenDivisions(divisionStandings, climber, lowerDiv.divisionName, higherDiv.divisionName);
        }
    }
    
    // Move climbers down based on rule e)
    for (let i = 0; i < divisionStandings.length - 1; i++) {
        const higherDiv = divisionStandings[i];
        const lowerDiv = divisionStandings[i + 1];
        
        if (lowerDiv.climbers.length > 0) {
            const bestLowerDivScore = Math.min(...lowerDiv.climbers.map((c: Climber) => c.finishPlacePoints));
            const climbersToMoveDown = higherDiv.climbers.filter(
                (climber: Climber) => climber.finishPlacePoints >= bestLowerDivScore
            );
            
            for (const climber of climbersToMoveDown) {
                moveClimberBetweenDivisions(divisionStandings, climber, higherDiv.divisionName, lowerDiv.divisionName);
            }
        }
    }
    
    return divisionStandings;
};

const adjustDivisionsWithAverageDownwardMovement = (originalDivisionStandings: DivisionStanding[]) => {
    // Create a deep copy and mark original divisions
    const divisionStandings = JSON.parse(JSON.stringify(originalDivisionStandings));
    divisionStandings.forEach((division: DivisionStanding) => {
        division.climbers.forEach((climber: Climber) => {
            climber.originalDivision = division.divisionName;
        });
    });
    
    // First handle outliers (2 or more division moves)
    const outliers = findOutliers(divisionStandings);
    for (const {climber, fromDivision, toDivision} of outliers) {
        moveClimberBetweenDivisions(divisionStandings, climber as Climber, fromDivision, toDivision);
    }
    
    // Move climbers up based on rule d) - same as original
    for (let i = 0; i < divisionStandings.length - 1; i++) {
        const higherDiv = divisionStandings[i];
        const lowerDiv = divisionStandings[i + 1];
        
        const climbersToMoveUp = lowerDiv.climbers.filter(
            (climber: Climber) => climber.finishPlacePoints <= higherDiv.averageFinishPlacePoints
        );
        
        for (const climber of climbersToMoveUp) {
            moveClimberBetweenDivisions(divisionStandings, climber, lowerDiv.divisionName, higherDiv.divisionName);
        }
    }
    
    // Move climbers down based on modified rule - using average of lower division
    for (let i = 0; i < divisionStandings.length - 1; i++) {
        const higherDiv = divisionStandings[i];
        const lowerDiv = divisionStandings[i + 1];
        
        if (lowerDiv.climbers.length > 0) {
            // Calculate average finish place points for the lower division
            const lowerDivAverage = lowerDiv.averageFinishPlacePoints;
            const climbersToMoveDown = higherDiv.climbers.filter(
                (climber: Climber) => climber.finishPlacePoints >= lowerDivAverage
            );
            
            for (const climber of climbersToMoveDown) {
                moveClimberBetweenDivisions(divisionStandings, climber, higherDiv.divisionName, lowerDiv.divisionName);
            }
        }
    }
    
    return divisionStandings;
};

export const calculateStandings = async (compId: string) => {
    // Fetch all climbers for the competition with their scores and division
    const climbers = await prisma.mixerClimber.findMany({
        where: {
            competitionId: compId,
        },
        select:{
            id: true,
            name: true,
            boulderScores: {
                select: {
                    score: true,
                    attempts: true
                }
            },
            ropeScores: {
                select: {
                    score: true,
                    attempts: true
                }
            },
            division: {
                select: {
                    id: true,
                    name: true
                }
            },
        }
    });

    // Create arrays for all boulder and rope scores
    const allBoulderScores = climbers.flatMap(climber => 
        climber.boulderScores.map(score => ({
            climberName: climber.name,
            division: climber.division?.name || 'No Division',
            score: score.score,
            attempts: score.attempts
        }))
    );

    const allRopeScores = climbers.flatMap(climber => 
        climber.ropeScores.map(score => ({
            climberName: climber.name,
            division: climber.division?.name || 'No Division',
            score: score.score,
            attempts: score.attempts
        }))
    );

    // Sort scores in descending order (highest to lowest)
    // If scores are equal, sort by attempts (lower attempts is better)
    const sortedBoulderScores = allBoulderScores.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        return a.attempts - b.attempts;
    });

    const sortedRopeScores = allRopeScores.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        return a.attempts - b.attempts;
    });

    // Create a map to store each climber's places
    const climberPlaces = new Map<string, { boulderPlace: number, ropePlace: number }>();

    // Assign places for boulder scores
    let currentPlace = 1;
    let previousScore = -1;
    let previousAttempts = -1;
    sortedBoulderScores.forEach((score, index) => {
        if (score.score !== previousScore || score.attempts !== previousAttempts) {
            currentPlace = index + 1;
        }
        if (!climberPlaces.has(score.climberName)) {
            climberPlaces.set(score.climberName, { boulderPlace: currentPlace, ropePlace: 0 });
        } else {
            climberPlaces.get(score.climberName)!.boulderPlace = currentPlace;
        }
        previousScore = score.score;
        previousAttempts = score.attempts;
    });

    // Reset for rope scores
    currentPlace = 1;
    previousScore = -1;
    previousAttempts = -1;
    sortedRopeScores.forEach((score, index) => {
        if (score.score !== previousScore || score.attempts !== previousAttempts) {
            currentPlace = index + 1;
        }
        if (!climberPlaces.has(score.climberName)) {
            climberPlaces.set(score.climberName, { boulderPlace: 0, ropePlace: currentPlace });
        } else {
            climberPlaces.get(score.climberName)!.ropePlace = currentPlace;
        }
        previousScore = score.score;
        previousAttempts = score.attempts;
    });

    console.log(climberPlaces);

    // Calculate overall standings
    const overallStandings = Array.from(climberPlaces.entries()).map(([climberName, places]) => {
        const division = sortedBoulderScores.find(s => s.climberName === climberName)?.division || 'No Division';
        return {
            climberName,
            division,
            boulderPlace: places.boulderPlace,
            ropePlace: places.ropePlace,
            finishPlacePoints: places.boulderPlace + places.ropePlace,
            bestIndividualPlace: Math.min(places.boulderPlace, places.ropePlace),
            worstIndividualPlace: Math.max(places.boulderPlace, places.ropePlace)
        };
    });

    // Sort overall standings to match the image exactly
    const sortedOverallStandings = overallStandings.sort((a, b) => {
        // First compare by total place
        if (a.finishPlacePoints !== b.finishPlacePoints) {
            return a.finishPlacePoints - b.finishPlacePoints;
        }
        // If total places are equal, compare by best individual place
        if (a.bestIndividualPlace !== b.bestIndividualPlace) {
            return a.bestIndividualPlace - b.bestIndividualPlace;
        }
        // If best places are equal, compare by worst individual place
        if (a.worstIndividualPlace !== b.worstIndividualPlace) {
            return a.worstIndividualPlace - b.worstIndividualPlace;
        }
        // If still tied, compare by boulder place (lower is better)
        return a.boulderPlace - b.boulderPlace;
    });

    // Add final overall place
    const finalStandings = sortedOverallStandings.map((standing, index) => ({
        ...standing,
        overallPlace: index + 1
    }));

    // Group standings by division and calculate division averages
    const standingsByDivision = finalStandings.reduce((acc, climber) => {
        const divisionName = climber.division;
        if (!acc[divisionName]) {
            acc[divisionName] = {
                climbers: [],
                totalFinishPlacePoints: 0,
                climberCount: 0
            };
        }
        acc[divisionName].climbers.push(climber);
        acc[divisionName].totalFinishPlacePoints += climber.finishPlacePoints;
        acc[divisionName].climberCount += 1;
        return acc;
    }, {} as Record<string, {
        climbers: typeof finalStandings,
        totalFinishPlacePoints: number,
        climberCount: number
    }>);

    // Calculate averages and sort climbers within each division
    const divisionStandings = Object.entries(standingsByDivision).map(([divisionName, data]) => ({
        divisionName,
        climbers: data.climbers.sort((a, b) => a.overallPlace - b.overallPlace),
        averageFinishPlacePoints: Math.round((data.totalFinishPlacePoints / data.climberCount))
    }));

    // Sort divisions by their average finish place points
    const sortedDivisionStandings = divisionStandings.sort((a, b) => 
        a.averageFinishPlacePoints - b.averageFinishPlacePoints
    );

    // Get adjusted division standings
    const adjustedDivisionStandings = adjustDivisions(sortedDivisionStandings);

    // Format and print both original and adjusted standings
    console.log("\n=== ORIGINAL STANDINGS ===");
    formatDivisionStandings(sortedDivisionStandings);
    
    console.log("\n=== ADJUSTED STANDINGS (AFTER DIVISION MOVEMENTS) ===");
    formatDivisionStandings(adjustedDivisionStandings);

    return {
        boulderScores: sortedBoulderScores,
        ropeScores: sortedRopeScores,
        overallStandings: finalStandings,
        originalDivisionStandings: sortedDivisionStandings,
        adjustedDivisionStandings: adjustedDivisionStandings
    };
}

export const calculateStandingsWithAverageDownwardMovement = async (compId: string) => {
    // Fetch all climbers for the competition with their scores and division
    const climbers = await prisma.mixerClimber.findMany({
        where: {
            competitionId: compId,
        },
        select:{
            id: true,
            name: true,
            boulderScores: {
                select: {
                    score: true,
                    attempts: true
                }
            },
            ropeScores: {
                select: {
                    score: true,
                    attempts: true
                }
            },
            division: {
                select: {
                    id: true,
                    name: true
                }
            },
        }
    });

    // Create arrays for all boulder and rope scores
    const allBoulderScores = climbers.flatMap(climber => 
        climber.boulderScores.map(score => ({
            climberName: climber.name,
            division: climber.division?.name || 'No Division',
            score: score.score,
            attempts: score.attempts
        }))
    );

    const allRopeScores = climbers.flatMap(climber => 
        climber.ropeScores.map(score => ({
            climberName: climber.name,
            division: climber.division?.name || 'No Division',
            score: score.score,
            attempts: score.attempts
        }))
    );

    // Sort scores in descending order (highest to lowest)
    // If scores are equal, sort by attempts (lower attempts is better)
    const sortedBoulderScores = allBoulderScores.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        return a.attempts - b.attempts;
    });

    const sortedRopeScores = allRopeScores.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        return a.attempts - b.attempts;
    });

    // Create a map to store each climber's places
    const climberPlaces = new Map<string, { boulderPlace: number, ropePlace: number }>();

    // Assign places for boulder scores
    let currentPlace = 1;
    let previousScore = -1;
    let previousAttempts = -1;
    sortedBoulderScores.forEach((score, index) => {
        if (score.score !== previousScore || score.attempts !== previousAttempts) {
            currentPlace = index + 1;
        }
        if (!climberPlaces.has(score.climberName)) {
            climberPlaces.set(score.climberName, { boulderPlace: currentPlace, ropePlace: 0 });
        } else {
            climberPlaces.get(score.climberName)!.boulderPlace = currentPlace;
        }
        previousScore = score.score;
        previousAttempts = score.attempts;
    });

    // Reset for rope scores
    currentPlace = 1;
    previousScore = -1;
    previousAttempts = -1;
    sortedRopeScores.forEach((score, index) => {
        if (score.score !== previousScore || score.attempts !== previousAttempts) {
            currentPlace = index + 1;
        }
        if (!climberPlaces.has(score.climberName)) {
            climberPlaces.set(score.climberName, { boulderPlace: 0, ropePlace: currentPlace });
        } else {
            climberPlaces.get(score.climberName)!.ropePlace = currentPlace;
        }
        previousScore = score.score;
        previousAttempts = score.attempts;
    });

    // Calculate overall standings
    const overallStandings = Array.from(climberPlaces.entries()).map(([climberName, places]) => {
        const division = sortedBoulderScores.find(s => s.climberName === climberName)?.division || 'No Division';
        return {
            climberName,
            division,
            boulderPlace: places.boulderPlace,
            ropePlace: places.ropePlace,
            finishPlacePoints: places.boulderPlace + places.ropePlace,
            bestIndividualPlace: Math.min(places.boulderPlace, places.ropePlace),
            worstIndividualPlace: Math.max(places.boulderPlace, places.ropePlace)
        };
    });

    // Sort overall standings to match the image exactly
    const sortedOverallStandings = overallStandings.sort((a, b) => {
        // First compare by total place
        if (a.finishPlacePoints !== b.finishPlacePoints) {
            return a.finishPlacePoints - b.finishPlacePoints;
        }
        // If total places are equal, compare by best individual place
        if (a.bestIndividualPlace !== b.bestIndividualPlace) {
            return a.bestIndividualPlace - b.bestIndividualPlace;
        }
        // If best places are equal, compare by worst individual place
        if (a.worstIndividualPlace !== b.worstIndividualPlace) {
            return a.worstIndividualPlace - b.worstIndividualPlace;
        }
        // If still tied, compare by boulder place (lower is better)
        return a.boulderPlace - b.boulderPlace;
    });

    // Add final overall place
    const finalStandings = sortedOverallStandings.map((standing, index) => ({
        ...standing,
        overallPlace: index + 1
    }));

    // Group standings by division and calculate division averages
    const standingsByDivision = finalStandings.reduce((acc, climber) => {
        const divisionName = climber.division;
        if (!acc[divisionName]) {
            acc[divisionName] = {
                climbers: [],
                totalFinishPlacePoints: 0,
                climberCount: 0
            };
        }
        acc[divisionName].climbers.push(climber);
        acc[divisionName].totalFinishPlacePoints += climber.finishPlacePoints;
        acc[divisionName].climberCount += 1;
        return acc;
    }, {} as Record<string, {
        climbers: typeof finalStandings,
        totalFinishPlacePoints: number,
        climberCount: number
    }>);

    // Calculate averages and sort climbers within each division
    const divisionStandings = Object.entries(standingsByDivision).map(([divisionName, data]) => ({
        divisionName,
        climbers: data.climbers.sort((a, b) => a.overallPlace - b.overallPlace),
        averageFinishPlacePoints: Math.round((data.totalFinishPlacePoints / data.climberCount))
    }));

    // Sort divisions by their average finish place points
    const sortedDivisionStandings = divisionStandings.sort((a, b) => 
        a.averageFinishPlacePoints - b.averageFinishPlacePoints
    );

    // Get adjusted division standings using the new method
    const adjustedDivisionStandings = adjustDivisionsWithAverageDownwardMovement(sortedDivisionStandings);

    // Format and print both original and adjusted standings
    console.log("\n=== ORIGINAL STANDINGS WITH AVERAGE DOWNWARD MOVEMENT ===");
    formatDivisionStandings(sortedDivisionStandings);
    
    console.log("\n=== ADJUSTED STANDINGS WITH AVERAGE DOWNWARD MOVEMENT ===");
    formatDivisionStandings(adjustedDivisionStandings);

    return {
        boulderScores: sortedBoulderScores,
        ropeScores: sortedRopeScores,
        overallStandings: finalStandings,
        originalDivisionStandings: sortedDivisionStandings,
        adjustedDivisionStandings: adjustedDivisionStandings
    };
}