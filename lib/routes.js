import prisma from '@/prisma';
import { split } from 'postcss/lib/list';

export async function getRouteById(id) {
  try {
    const route = await prisma.route.findUnique({
      where: { id },
    });
    return route;
  } catch (error) {
    console.error(
      `error finding route with id: ${routeId} with error:${error}`
    );
  }
}
export async function getRouteImagesById(id) {
  try {
    const images = await prisma.routeImage.findMany({
      where: {
        routeId: id,
      },
    });
    return images;
  } catch (error) {
    return [];
  }
}

export function getGradeRange(grade) {
  const ropeGrades = [
    '5.B',
    '5.7-',
    '5.7',
    '5.7+',
    '5.8-',
    '5.8',
    '5.8+',
    '5.9-',
    '5.9',
    '5.9+',
    '5.10-',
    '5.10',
    '5.10+',
    '5.11-',
    '5.11',
    '5.11+',
    '5.12-',
    '5.12',
    '5.12+',
    '5.13-',
    '5.13',
    '5.13+',
  ];
  const boulderGrades = [
    'vb',
    'v0',
    'v1',
    'v2',
    'v3',
    'v4',
    'v5',
    'v6',
    'v7',
    'v8',
    'v9',
    'v10',
  ];

  const isBoulderGrade = grade[0] === 'v';
  const gradeList = isBoulderGrade ? boulderGrades : ropeGrades;
  const index = gradeList.findIndex((element) => grade === element);

  if (index === -1) return []; // Handle case where grade isn't found

  if (isBoulderGrade) {
    if (index === 0 || index === 1) return ['vb', 'v0', 'v1'];
    if (index === gradeList.length - 1) return ['v8', 'v9', 'v10'];
    return gradeList.slice(
      Math.max(0, index - 1),
      Math.min(gradeList.length, index + 2)
    );
  } else {
    if (index <= 2) return ['5.B', '5.7-', '5.7', '5.7+', '5.8-'];
    if (index >= gradeList.length - 3)
      return ['5.12', '5.12+', '5.13-', '5.13', '5.13+'];
    return gradeList.slice(index - 2, index + 3);
  }
}

export async function findAllTotalSends(routeId) {
  try {
    const sends = await prisma.RouteCompletion.findMany({
      where: { routeId: routeId },
    });

    if (sends.length > 0) {
      const sendsInt = sends.reduce((acc, send) => acc + send.sends, 0);
      return sendsInt;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('could not find any sends, error:', error);
  }
}

export async function findProposedGrade(userId, routeId) {
  try {
    const userCommunityRouteGrade = await prisma.CommunityGrade.findFirst({
      where: { userId: userId, routeId: routeId },
    });
    if (!userCommunityRouteGrade) {
      return null;
    }
    return userCommunityRouteGrade.grade;
  } catch (error) {
    console.error('failed to find user grade, error: ', error);
    return null;
  }
}

export async function findIfCommunityGraded(userId, routeId) {
  try {
    const communityGrade = await prisma.CommunityGrade.findFirst({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });

    return communityGrade !== null;
  } catch (error) {
    console.error('failed to get CommunityGrade status error: ', error);
    throw new Error('failed to check communityGrade status');
  }
}

export async function findRating(userId, routeId) {
  try {
    const rating = await prisma.RouteStar.findFirst({
      where: {
        userId: userId,
        routeId: routeId,
      },
    });
    if (!rating) {
      return null;
    }
    return { stars: rating.stars, comment: rating.comment };
  } catch (error) {
    console.error('failed to get rated status error: ', error);
    throw new Error('failed to check communityGrade status');
  }
}

function calculateStarRating(stars) {
  const amountStarRatings = stars.length;
  if (amountStarRatings > 0) {
    let addedStars = 0;
    stars.forEach((star) => {
      addedStars += star;
    });
    return addedStars / amountStarRatings;
  } else {
    return 0;
  }
}

export async function findStarRating(routeId) {
  try {
    const starRatingsObject = await prisma.RouteStar.findMany({
      where: {
        routeId: routeId,
      },
    });
    const starRatings = starRatingsObject.map((starRating) => starRating.stars);
    return calculateStarRating(starRatings);
  } catch (error) {
    console.error(`could not find star rating with error: ${error}`);
  }
}
function findClosestGrade(value, map) {
  let closestGrade = null;
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
export async function findCommunityGrade(routeId) {
  try {
    const communityGradeObject = await prisma.communityGrade.findMany({
      where: {
        routeId: routeId,
      },
    });
    if (communityGradeObject.length === 0) {
      return 'none';
    }
    const grades = communityGradeObject.map((route) => route.grade);
    const gradeMap = {
      '5.b': 6.0,
      '5.7-': 7.0,
      5.7: 7.2,
      '5.7+': 7.3,
      '5.8-': 8.0,
      5.8: 8.2,
      '5.8+': 8.3,
      '5.9-': 9.0,
      5.9: 9.2,
      '5.9+': 9.3,
      '5.10-': 10.0,
      '5.10': 10.2,
      '5.10+': 10.3,
      '5.11-': 11.0,
      5.11: 11.2,
      '5.11+': 11.3,
      '5.12-': 12.0,
      5.12: 12.2,
      '5.12+': 12.3,
      '5.13-': 13.0,
      5.13: 13.2,
      '5.13+': 13.3,
    };

    const numericGrades = grades.map((grade) => gradeMap[grade]);
    const averageNumeric =
      numericGrades.reduce((sum, num) => sum + num, 0) / numericGrades.length;
    const averageGrade = findClosestGrade(averageNumeric, gradeMap);
    return averageGrade;
  } catch (error) {
    console.error(`could not find star rating with error: ${error}`);
  }
}

export function splitGradeModifier(grade) {
  let modifier = '';
  if (grade[grade.length - 1] !== '-' && grade[grade.length - 1] !== '+') {
    return [grade, modifier];
  } else {
    const splitGrade = grade.slice(0, grade.length - 1);
    modifier = grade[grade.length - 1];
    return [splitGrade, modifier];
  }
}
