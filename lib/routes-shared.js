export function getGradeRange(grade) {
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
    if (index === 0) return ["vfeature", "vb", "v0"];
    if (index === 1) return ["vfeature", "vb", "v0", "v1"];
    if (index === gradeList.length - 1) return ["v8", "v9", "v10"];
    return gradeList.slice(Math.max(0, index - 1), Math.min(gradeList.length, index + 2));
  }

  if (index === 0) return ["5.feature", "5.B", "5.7-", "5.7"];
  if (index <= 2) return ["5.feature", "5.B", "5.7-", "5.7", "5.7+", "5.8-"];
  if (index >= gradeList.length - 3) return ["5.12", "5.12+", "5.13-", "5.13", "5.13+"];
  return gradeList.slice(index - 2, index + 3);
}

export function splitGradeModifier(grade) {
  let modifier = "";
  if (grade[grade.length - 1] !== "-" && grade[grade.length - 1] !== "+") {
    return [grade, modifier];
  }

  const splitGrade = grade.slice(0, grade.length - 1);
  modifier = grade[grade.length - 1];
  return [splitGrade, modifier];
}
