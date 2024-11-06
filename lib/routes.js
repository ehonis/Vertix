import prisma from '@/prisma';

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
