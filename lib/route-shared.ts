import type { CommunityGrade, User } from "@/generated/prisma/browser";

function findClosestGrade(value: number, map: Record<string, number>): string {
  let closestGrade = "none";
  let smallestDiff = Infinity;

  for (const [grade, numValue] of Object.entries(map)) {
    const diff = Math.abs(value - numValue);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestGrade = grade;
    }
  }

  return closestGrade;
}

export function getBoulderGradeMapping(grade: string) {
  let mappedGrade = "";
  if (grade === "vfeature") {
    mappedGrade = "vfeature";
  } else if (grade === "v1" || grade === "v0") {
    mappedGrade = "v0-v2";
  } else if (grade === "v2") {
    mappedGrade = "v1-v3";
  } else if (grade === "v3") {
    mappedGrade = "v2-v4";
  } else if (grade === "v4") {
    mappedGrade = "v3-v5";
  } else if (grade === "v5") {
    mappedGrade = "v4-v6";
  } else if (grade === "v6") {
    mappedGrade = "v5-v7";
  } else if (grade === "v7") {
    mappedGrade = "v6-v8";
  } else if (grade === "v8") {
    mappedGrade = "v7-v9";
  } else if (grade === "v9") {
    mappedGrade = "v8-v10";
  } else if (grade === "v10") {
    mappedGrade = "v9-v11";
  } else {
    mappedGrade = "vb";
  }

  return mappedGrade;
}

export function findCommunityGradeForRoute(communityGrades: CommunityGrade[]): string {
  if (!communityGrades.length) return "none";

  const ropeGrades = communityGrades.filter(
    grade => !grade.grade.toLowerCase().startsWith("v") && grade.grade.toLowerCase() !== "5.feature"
  );
  const boulderGrades = communityGrades.filter(
    grade => grade.grade.toLowerCase().startsWith("v") && grade.grade.toLowerCase() !== "vfeature"
  );

  if (ropeGrades.length > 0) {
    const ropeGradeMap: Record<string, number> = {
      "5.b": 6.0,
      "5.7-": 7.0,
      5.7: 7.2,
      "5.7+": 7.3,
      "5.8-": 8.0,
      5.8: 8.2,
      "5.8+": 8.3,
      "5.9-": 9.0,
      5.9: 9.2,
      "5.9+": 9.3,
      "5.10-": 10.0,
      "5.10": 10.2,
      "5.10+": 10.3,
      "5.11-": 11.0,
      5.11: 11.2,
      "5.11+": 11.3,
      "5.12-": 12.0,
      5.12: 12.2,
      "5.12+": 12.3,
      "5.13-": 13.0,
      5.13: 13.2,
      "5.13+": 13.3,
    };

    const numericGrades = ropeGrades
      .map(grade => ropeGradeMap[grade.grade.toLowerCase()])
      .filter((grade): grade is number => grade !== undefined);

    if (!numericGrades.length) return "none";

    const averageNumeric =
      numericGrades.reduce((sum: number, num: number) => sum + num, 0) / numericGrades.length;

    return findClosestGrade(averageNumeric, ropeGradeMap);
  }

  if (boulderGrades.length > 0) {
    const boulderGradeMap: Record<string, number> = {
      vb: 0,
      v0: 1,
      v1: 2,
      v2: 3,
      v3: 4,
      v4: 5,
      v5: 6,
      v6: 7,
      v7: 8,
      v8: 9,
      v9: 10,
      v10: 11,
    };

    const numericGrades = boulderGrades
      .map(grade => boulderGradeMap[grade.grade.toLowerCase()])
      .filter((grade): grade is number => grade !== undefined);

    if (!numericGrades.length) return "none";

    const averageNumeric =
      numericGrades.reduce((sum: number, num: number) => sum + num, 0) / numericGrades.length;
    const closestNumeric = Math.round(averageNumeric);

    return (
      Object.entries(boulderGradeMap).find(([_, value]) => value === closestNumeric)?.[0] ?? "none"
    );
  }

  return "none";
}

export function isGradeHigher(user: User, newGrade: string, type: string) {
  const ropeGrades = [
    "5.b",
    "5.7-",
    "5.7",
    "5.7+",
    "5.8-",
    "5.8",
    "5.8+",
    "5.9-",
    "5.9",
    "5.9+",
    "5.10-",
    "5.10",
    "5.10+",
    "5.11-",
    "5.11",
    "5.11+",
    "5.12-",
    "5.12",
    "5.12+",
    "5.13-",
    "5.13",
    "5.13+",
  ];
  const boulderGrades = ["vb", "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

  if (!user.highestRopeGrade || !user.highestBoulderGrade) {
    return true;
  }

  if (type === "rope") {
    return ropeGrades.indexOf(user.highestRopeGrade) < ropeGrades.indexOf(newGrade);
  }

  if (type === "boulder") {
    return boulderGrades.indexOf(user.highestBoulderGrade) < boulderGrades.indexOf(newGrade);
  }

  return false;
}

export function getGradeRange(grade: string) {
  const ropeGrades = [
    "5.feature",
    "5.B",
    "5.7-",
    "5.7",
    "5.7+",
    "5.8-",
    "5.8",
    "5.8+",
    "5.9-",
    "5.9",
    "5.9+",
    "5.10-",
    "5.10",
    "5.10+",
    "5.11-",
    "5.11",
    "5.11+",
    "5.12-",
    "5.12",
    "5.12+",
    "5.13-",
    "5.13",
    "5.13+",
  ];
  const boulderGrades = [
    "vfeature",
    "vb",
    "v0",
    "v1",
    "v2",
    "v3",
    "v4",
    "v5",
    "v6",
    "v7",
    "v8",
    "v9",
    "v10",
  ];

  const isBoulderGrade = grade[0] === "v";
  const gradeList = isBoulderGrade ? boulderGrades : ropeGrades;
  const index = gradeList.findIndex(element => grade === element);

  if (index === -1) return [];

  if (isBoulderGrade) {
    if (index === 0) return ["vb", "v0"];
    if (index === 1) return ["vb", "v0", "v1"];
    if (index === gradeList.length - 1) return ["v8", "v9", "v10"];
    return gradeList.slice(Math.max(0, index - 1), Math.min(gradeList.length, index + 2));
  }

  if (index === 0) return ["5.B", "5.7-", "5.7"];
  if (index <= 2) return ["5.B", "5.7-", "5.7", "5.7+", "5.8-"];
  if (index >= gradeList.length - 3) return ["5.12", "5.12+", "5.13-", "5.13", "5.13+"];
  return gradeList.slice(index - 2, index + 3);
}

export function getRouteXp(grade: string) {
  const boulderGrades = {
    competition: 0,
    vfeature: 0,
    vb: 10,
    v0: 20,
    v1: 21,
    v2: 26,
    v3: 35,
    v4: 44,
    v5: 64,
    v6: 88,
    v7: 110,
    v8: 155,
    v9: 175,
    v10: 210,
  };

  const ropeGrades = {
    competition: 0,
    "5.feature": 0,
    "5.b": 10,
    "5.7-": 20,
    "5.7": 20,
    "5.7+": 21,
    "5.8-": 21,
    "5.8": 26,
    "5.8+": 28,
    "5.9-": 28,
    "5.9": 31,
    "5.9+": 35,
    "5.10-": 39,
    "5.10": 42,
    "5.10+": 48,
    "5.11-": 60,
    "5.11": 73,
    "5.11+": 88,
    "5.12-": 105,
    "5.12": 123,
    "5.12+": 143,
    "5.13-": 164,
    "5.13": 187,
    "5.13+": 212,
  };

  if (grade.toLowerCase().startsWith("v")) {
    return boulderGrades[grade.toLowerCase() as keyof typeof boulderGrades];
  }
  return ropeGrades[grade.toLowerCase() as keyof typeof ropeGrades];
}

export function calculateCompletionXpForRoute({
  grade,
  previousCompletions,
  newHighestGrade,
  bonusXp = 0,
}: {
  grade: string;
  previousCompletions: number;
  newHighestGrade: boolean;
  bonusXp?: number;
}) {
  const firstTimeXp = 25;
  const newHighestGradeBonusXP = 250;

  const baseXp = getRouteXp(grade);
  const isFeatureRoute =
    grade.toLowerCase() === "vfeature" ||
    grade.toLowerCase() === "5.feature" ||
    grade.toLowerCase() === "competition";

  if (isFeatureRoute && previousCompletions > 0) {
    return { xp: 0, baseXp: 0, xpExtrapolated: [{ type: "Repeated Feature Route", xp: 0 }] };
  }

  const xpExtrapolated: { type: string; xp: number }[] = [];
  let totalXp = 0;

  if (!isFeatureRoute) {
    totalXp += baseXp;
  }

  if (previousCompletions === 0) {
    totalXp += firstTimeXp;
    xpExtrapolated.push({ type: "First Send Bonus", xp: firstTimeXp });
    if (bonusXp > 0) {
      totalXp += bonusXp;
      xpExtrapolated.push({ type: "Bonus XP", xp: bonusXp });
    }
  }

  if (newHighestGrade) {
    totalXp += newHighestGradeBonusXP;
    xpExtrapolated.push({ type: "New Highest Grade Bonus", xp: newHighestGradeBonusXP });
  }

  if (previousCompletions > 0 && !isFeatureRoute) {
    const additionalXp = Math.floor(previousCompletions * (baseXp * 0.2));
    totalXp -= additionalXp;
    if (totalXp < 0) {
      totalXp = 0;
    }
    xpExtrapolated.push({ type: "Repeated Send XP Penalty", xp: -additionalXp });
  }

  return { xp: totalXp, baseXp, xpExtrapolated };
}

export function getLevelForXp(xp: number) {
  if (xp < 0) return 0;
  const K = 10;
  return Math.floor(Math.sqrt(xp / K));
}

export function getXpForLevel(level: number) {
  const K = 10;
  return Math.floor(K * level * level);
}
