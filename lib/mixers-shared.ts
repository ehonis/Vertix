export interface Score {
  climberName: string;
  division: string;
  score: number;
  attempts: number;
}

export interface ClimberStanding {
  climberName: string;
  division: string;
  boulderPlace: number;
  ropePlace: number;
  finishPlacePoints: number;
  bestIndividualPlace: number;
  worstIndividualPlace: number;
  overallPlace: number;
  originalDivision?: string;
}

export interface DivisionStanding {
  divisionName: string;
  climbers: ClimberStanding[];
  averageFinishPlacePoints: number;
}

export interface StandingsData {
  boulderScores: Score[];
  ropeScores: Score[];
  overallStandings: ClimberStanding[];
  originalDivisionStandings: DivisionStanding[];
  adjustedDivisionStandings: DivisionStanding[];
}

function escapeCsvCell(cellData: unknown): string {
  const str = String(cellData ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCompetitionCsv(
  data: StandingsData,
  standingType: "Top" | "Average"
): string {
  const csvRows: string[] = [];
  let spreadsheetName = "";
  if (standingType === "Top") {
    spreadsheetName = "Division movement by 2025 rules";
  } else {
    spreadsheetName = "Divsion movement by 2024 rules";
  }

  csvRows.push(`${spreadsheetName} SCORES,,,,,,,,,,,,,`);
  csvRows.push(",,,,,,,,,,,,,");
  csvRows.push(",,,,,,,,,,,,,");

  const boulderScores = data.boulderScores;
  const ropeScores = data.ropeScores;
  const overallStandings = data.overallStandings;

  csvRows.push("BOULDER,,,,,ROPES,,,,,OVERALL,,,");
  csvRows.push(
    [
      "Name",
      "Boulder \nPoints",
      "Attempts",
      "Place",
      "",
      "Name",
      "Rope\nPoints",
      "Attempts",
      "Place",
      "",
      "Name",
      "Total Finish-\nPlace Points",
      "Best \nFinish Place",
      "Overall \nPlace",
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  const maxLength = Math.max(boulderScores.length, ropeScores.length, overallStandings.length);

  for (let i = 0; i < maxLength; i++) {
    const boulder = boulderScores[i];
    const rope = ropeScores[i];
    const overall = overallStandings[i];

    const row = [
      boulder?.climberName,
      boulder?.score,
      boulder?.attempts,
      i + 1,
      "",
      rope?.climberName,
      rope?.score,
      rope?.attempts,
      i + 1,
      "",
      overall?.climberName,
      overall?.finishPlacePoints,
      overall?.bestIndividualPlace,
      overall?.overallPlace,
    ];
    csvRows.push(row.map(escapeCsvCell).join(","));
  }

  csvRows.push(",,,,,,,,,,,,,");
  csvRows.push(",,,,,,,,,,,,,");

  csvRows.push("Final Standings without movement,,,,,,,,,,,,,");
  csvRows.push(",,,,,,,,,,,,,");
  csvRows.push(",,,,,,,,,,,,,");

  const originalDivisions = data.originalDivisionStandings;
  for (const division of originalDivisions) {
    csvRows.push(`"${division.divisionName}",,average = ${division.averageFinishPlacePoints},,,,,,,,,,,,`);

    csvRows.push(
      [
        "Name",
        "Total \nFinish-Place \nPoints",
        "Best \nFinish \nPlace",
        "Overall \nPlace",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]
        .map(escapeCsvCell)
        .join(",")
    );

    for (const climber of division.climbers) {
      const row = [
        climber.climberName,
        climber.finishPlacePoints,
        climber.bestIndividualPlace,
        climber.overallPlace,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];
      csvRows.push(row.map(escapeCsvCell).join(","));
    }

    csvRows.push(",,,,,,,,,,,,,");
    csvRows.push(",,,,,,,,,,,,,");
  }

  csvRows.push("Final Standings with Division Movement,,,,,,,,,,,,,");
  csvRows.push(",,,,,,,,,,,,,");
  csvRows.push(",,,,,,,,,,,,,");

  const adjustedDivisions = data.adjustedDivisionStandings;
  for (const division of adjustedDivisions) {
    csvRows.push(`"${division.divisionName}",,average = ${division.averageFinishPlacePoints},,,,,,,,,,,,`);

    csvRows.push(
      [
        "Name",
        "Total \nFinish-Place \nPoints",
        "Best \nFinish \nPlace",
        "Overall \nPlace",
        "Movement",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]
        .map(escapeCsvCell)
        .join(",")
    );

    for (const climber of division.climbers) {
      const movement = climber.originalDivision !== division.divisionName ? "moved" : "";
      const row = [
        climber.climberName,
        climber.finishPlacePoints,
        climber.bestIndividualPlace,
        climber.overallPlace,
        movement,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];
      csvRows.push(row.map(escapeCsvCell).join(","));
    }

    csvRows.push(",,,,,,,,,,,,,");
    csvRows.push(",,,,,,,,,,,,,");
  }

  return csvRows.join("\n");
}
