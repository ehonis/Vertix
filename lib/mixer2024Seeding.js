const { PrismaClient } = require("@/prisma");
const prisma = new PrismaClient();

// Spring Mixer 2024 Data
const mixerRoutes = [
  {
    id: 0,
    name: "Route A",
    holds: [
      { holdNumber: 1, topRopePoints: 1, leadPoints: 2 },
      { holdNumber: 2, topRopePoints: 4, leadPoints: 6 },
      { holdNumber: 3, topRopePoints: 7, leadPoints: 11 },
      { holdNumber: 4, topRopePoints: 10, leadPoints: 15 },
      { holdNumber: 5, topRopePoints: 13, leadPoints: 20 },
      { holdNumber: 6, topRopePoints: 17, leadPoints: 25 },
      { holdNumber: 7, topRopePoints: 21, leadPoints: 30 },
      { holdNumber: 8, topRopePoints: 24, leadPoints: 34 },
      { holdNumber: 9, topRopePoints: 28, leadPoints: 38 },
      { holdNumber: 10, topRopePoints: 32, leadPoints: 45 },
      { holdNumber: 11, topRopePoints: 35, leadPoints: 48 },
      { holdNumber: 12, topRopePoints: 37, leadPoints: 54 },
      { holdNumber: 13, topRopePoints: 43, leadPoints: 59 },
      { holdNumber: 14, topRopePoints: 47, leadPoints: 64 },
      { holdNumber: 15, topRopePoints: 49, leadPoints: 67 },
      { holdNumber: 16, topRopePoints: 53, leadPoints: 70 },
      { holdNumber: 17, topRopePoints: 56, leadPoints: 74 },
      { holdNumber: 18, topRopePoints: 61, leadPoints: 77 },
    ],
    color: "blue",
  },
  {
    id: 1,
    name: "Route B",
    holds: [
      { holdNumber: 1, topRopePoints: 3, leadPoints: 5 },
      { holdNumber: 2, topRopePoints: 9, leadPoints: 14 },
      { holdNumber: 3, topRopePoints: 16, leadPoints: 23 },
      { holdNumber: 4, topRopePoints: 22, leadPoints: 33 },
      { holdNumber: 5, topRopePoints: 31, leadPoints: 44 },
      { holdNumber: 6, topRopePoints: 36, leadPoints: 52 },
      { holdNumber: 7, topRopePoints: 46, leadPoints: 63 },
      { holdNumber: 8, topRopePoints: 51, leadPoints: 69 },
      { holdNumber: 9, topRopePoints: 60, leadPoints: 75 },
      { holdNumber: 10, topRopePoints: 66, leadPoints: 84 },
      { holdNumber: 11, topRopePoints: 72, leadPoints: 88 },
      { holdNumber: 12, topRopePoints: 75, leadPoints: 93 },
      { holdNumber: 13, topRopePoints: 83, leadPoints: 100 },
      { holdNumber: 14, topRopePoints: 86, leadPoints: 103 },
      { holdNumber: 15, topRopePoints: 90, leadPoints: 106 },
      { holdNumber: 16, topRopePoints: 92, leadPoints: 109 },
      { holdNumber: 17, topRopePoints: 97, leadPoints: 114 },
    ],
    color: "green",
  },
  {
    id: 2,
    name: "Route C",
    holds: [
      { holdNumber: 1, topRopePoints: 8, leadPoints: 12 },
      { holdNumber: 2, topRopePoints: 18, leadPoints: 26 },
      { holdNumber: 3, topRopePoints: 29, leadPoints: 40 },
      { holdNumber: 4, topRopePoints: 39, leadPoints: 55 },
      { holdNumber: 5, topRopePoints: 50, leadPoints: 68 },
      { holdNumber: 6, topRopePoints: 62, leadPoints: 79 },
      { holdNumber: 7, topRopePoints: 71, leadPoints: 87 },
      { holdNumber: 8, topRopePoints: 78, leadPoints: 95 },
      { holdNumber: 9, topRopePoints: 85, leadPoints: 102 },
      { holdNumber: 10, topRopePoints: 91, leadPoints: 108 },
      { holdNumber: 11, topRopePoints: 96, leadPoints: 113 },
      { holdNumber: 12, topRopePoints: 101, leadPoints: 118 },
      { holdNumber: 13, topRopePoints: 107, leadPoints: 124 },
      { holdNumber: 14, topRopePoints: 110, leadPoints: 126 },
      { holdNumber: 15, topRopePoints: 116, leadPoints: 132 },
      { holdNumber: 16, topRopePoints: 117, leadPoints: 136 },
      { holdNumber: 17, topRopePoints: 123, leadPoints: 140 },
      { holdNumber: 18, topRopePoints: 125, leadPoints: 142 },
      { holdNumber: 19, topRopePoints: 128, leadPoints: 146 },
      { holdNumber: 20, topRopePoints: 131, leadPoints: 147 },
      { holdNumber: 21, topRopePoints: 133, leadPoints: 149 },
    ],
    color: "orange",
  },
  {
    id: 3,
    name: "Route D",
    holds: [
      { holdNumber: 1, topRopePoints: 19, leadPoints: 27 },
      { holdNumber: 2, topRopePoints: 42, leadPoints: 58 },
      { holdNumber: 3, topRopePoints: 65, leadPoints: 82 },
      { holdNumber: 4, topRopePoints: 81, leadPoints: 99 },
      { holdNumber: 5, topRopePoints: 94, leadPoints: 111 },
      { holdNumber: 6, topRopePoints: 105, leadPoints: 122 },
      { holdNumber: 7, topRopePoints: 115, leadPoints: 130 },
      { holdNumber: 8, topRopePoints: 121, leadPoints: 139 },
      { holdNumber: 9, topRopePoints: 127, leadPoints: 145 },
      { holdNumber: 10, topRopePoints: 135, leadPoints: 151 },
      { holdNumber: 11, topRopePoints: 141, leadPoints: 156 },
      { holdNumber: 12, topRopePoints: 144, leadPoints: 161 },
      { holdNumber: 13, topRopePoints: 148, leadPoints: 164 },
      { holdNumber: 14, topRopePoints: 155, leadPoints: 169 },
      { holdNumber: 15, topRopePoints: 157, leadPoints: 173 },
      { holdNumber: 16, topRopePoints: 160, leadPoints: 176 },
      { holdNumber: 17, topRopePoints: 162, leadPoints: 178 },
      { holdNumber: 18, topRopePoints: 166, leadPoints: 182 },
      { holdNumber: 19, topRopePoints: 170, leadPoints: 184 },
      { holdNumber: 20, topRopePoints: 172, leadPoints: 187 },
    ],
    color: "yellow",
  },
  {
    id: 4,
    name: "Route E",
    holds: [
      { holdNumber: 1, topRopePoints: 41, leadPoints: 57 },
      { holdNumber: 2, topRopePoints: 80, leadPoints: 98 },
      { holdNumber: 3, topRopePoints: 104, leadPoints: 120 },
      { holdNumber: 4, topRopePoints: 119, leadPoints: 138 },
      { holdNumber: 5, topRopePoints: 134, leadPoints: 150 },
      { holdNumber: 6, topRopePoints: 143, leadPoints: 159 },
      { holdNumber: 7, topRopePoints: 154, leadPoints: 168 },
      { holdNumber: 8, topRopePoints: 158, leadPoints: 175 },
      { holdNumber: 9, topRopePoints: 165, leadPoints: 181 },
      { holdNumber: 10, topRopePoints: 171, leadPoints: 186 },
      { holdNumber: 11, topRopePoints: 177, leadPoints: 191 },
      { holdNumber: 12, topRopePoints: 180, leadPoints: 195 },
      { holdNumber: 13, topRopePoints: 185, leadPoints: 199 },
      { holdNumber: 14, topRopePoints: 190, leadPoints: 202 },
      { holdNumber: 15, topRopePoints: 192, leadPoints: 205 },
      { holdNumber: 16, topRopePoints: 194, leadPoints: 208 },
      { holdNumber: 17, topRopePoints: 197, leadPoints: 210 },
      { holdNumber: 18, topRopePoints: 200, leadPoints: 212 },
      { holdNumber: 19, topRopePoints: 204, leadPoints: 215 },
    ],
    color: "red",
  },
  {
    id: 5,
    name: "Route F",
    holds: [
      { holdNumber: 1, topRopePoints: 73, leadPoints: 89 },
      { holdNumber: 2, topRopePoints: 112, leadPoints: 129 },
      { holdNumber: 3, topRopePoints: 137, leadPoints: 153 },
      { holdNumber: 4, topRopePoints: 152, leadPoints: 167 },
      { holdNumber: 5, topRopePoints: 163, leadPoints: 179 },
      { holdNumber: 6, topRopePoints: 174, leadPoints: 189 },
      { holdNumber: 7, topRopePoints: 183, leadPoints: 196 },
      { holdNumber: 8, topRopePoints: 188, leadPoints: 201 },
      { holdNumber: 9, topRopePoints: 193, leadPoints: 207 },
      { holdNumber: 10, topRopePoints: 198, leadPoints: 211 },
      { holdNumber: 11, topRopePoints: 203, leadPoints: 214 },
      { holdNumber: 12, topRopePoints: 206, leadPoints: 218 },
      { holdNumber: 13, topRopePoints: 209, leadPoints: 220 },
      { holdNumber: 14, topRopePoints: 213, leadPoints: 222 },
      { holdNumber: 15, topRopePoints: 216, leadPoints: 225 },
      { holdNumber: 16, topRopePoints: 217, leadPoints: 227 },
      { holdNumber: 17, topRopePoints: 219, leadPoints: 229 },
      { holdNumber: 18, topRopePoints: 221, leadPoints: 230 },
      { holdNumber: 19, topRopePoints: 223, leadPoints: 231 },
      { holdNumber: 20, topRopePoints: 224, leadPoints: 232 },
      { holdNumber: 21, topRopePoints: 226, leadPoints: 233 },
      { holdNumber: 22, topRopePoints: 228, leadPoints: 234 },
    ],
    color: "red",
  },
];

const divisions = {
  "V0 - V2 / 5.7 - 5.8": [
    { id: 0, name: "William Greller" },
    { id: 1, name: "Wes Keller" },
    { id: 2, name: "Zachary Stout" },
    { id: 3, name: "Logan Clemence" },
    { id: 4, name: "Ian Barter" },
    { id: 5, name: "Ryder Kehres" },
    { id: 6, name: "Jacob Obermiller" },
    { id: 7, name: "Anna Lowe" },
    { id: 8, name: "Bailey Borer" },
    { id: 9, name: "Seth Chaffin" },
    { id: 10, name: "Arbor Lang" },
    { id: 11, name: "Donaven Skiver" },
    { id: 12, name: "Haydn Carr" },
    { id: 13, name: "Owen Babiuch" },
    { id: 14, name: "Bella Smith" },
    { id: 15, name: "Kenny Boardwine" },
    { id: 16, name: "Sean McGraw" },
  ],
  "V3 - V4 / 5.9 - 5.10+": [
    { id: 0, name: "Tara Hites" },
    { id: 1, name: "Ian Sparks" },
    { id: 2, name: "Alex Webb" },
    { id: 3, name: "Brandon Culig" },
    { id: 4, name: "Matt Evans" },
    { id: 5, name: "Matthew Dobrilovic" },
    { id: 6, name: "Justin Moyer" },
    { id: 7, name: "Isaac Johnson" },
    { id: 8, name: "Ethan Honis" },
    { id: 9, name: "Nate Yorks" },
    { id: 10, name: "Sebastian Jungschaffer" },
    { id: 11, name: "Nick Dolansky" },
    { id: 12, name: "Morgan Fillar" },
    { id: 13, name: "Domenic Tomazic" },
    { id: 14, name: "Gretchen Woodling" },
    { id: 15, name: "Cora Palfy" },
    { id: 16, name: "Christian Stevens" },
    { id: 17, name: "Andrew Baker" },
    { id: 18, name: "Zoe Neal" },
  ],
  "V5 - V6 / 5.11- - 5.12-": [
    { id: 0, name: "Olivia Krasznay" },
    { id: 1, name: "Mike Selig" },
    { id: 2, name: "Carl Selig" },
    { id: 3, name: "Cruz Mason" },
    { id: 4, name: "Jeff Svec" },
    { id: 5, name: "Brett Arthur" },
    { id: 6, name: "Tyler Rush" },
    { id: 7, name: "John Corn" },
  ],
  "≥V7 / ≥5.12": [
    { id: 0, name: "Dylan Brogan" },
    { id: 1, name: "Jacob Fife" },
    { id: 2, name: "Usamah Umar" },
  ],
};

const boulderScores = [
  { name: "Jacob Fife", score: 7600, attempts: 15 },
  { name: "Olivia Krasznay", score: 7400, attempts: 10 },
  { name: "Cruz Mason", score: 7100, attempts: 6 },
  { name: "Usamah Umar", score: 6700, attempts: 3 },
  { name: "John Corn", score: 6700, attempts: 10 },
  { name: "Carl Selig", score: 6600, attempts: 6 },
  { name: "Dylan Brogan", score: 6100, attempts: 3 },
  { name: "Brett Arthur", score: 6000, attempts: 6 },
  { name: "Jeff Svec", score: 5700, attempts: 6 },
  { name: "Zoe Neal", score: 5700, attempts: 7 },
  { name: "Tyler Rush", score: 5700, attempts: 10 },
  { name: "Jacob Obermiller", score: 5700, attempts: 12 },
  { name: "Isaac Johnson", score: 5500, attempts: 6 },
  { name: "Mike Selig", score: 5500, attempts: 14 },
  { name: "Matthew Dobrilovic", score: 5200, attempts: 5 },
  { name: "Nate Yorks", score: 5100, attempts: 5 },
  { name: "Ian Sparks", score: 4900, attempts: 4 },
  { name: "Christian Stevens", score: 4700, attempts: 5 },
  { name: "Ethan Honis", score: 3900, attempts: 3 },
  { name: "Tara Hites", score: 3900, attempts: 5 },
  { name: "Sebastian Jungschaffer", score: 3900, attempts: 5 },
  { name: "Domenic Tomazic", score: 3900, attempts: 6 },
  { name: "Brandon Culig", score: 3900, attempts: 7 },
  { name: "Logan Clemence", score: 3900, attempts: 11 },
  { name: "William Greller", score: 3900, attempts: 12 },
  { name: "Alex Webb", score: 3700, attempts: 5 },
  { name: "Andrew Baker", score: 3700, attempts: 5 },
  { name: "Gretchen Woodling", score: 3700, attempts: 9 },
  { name: "Justin Moyer", score: 3300, attempts: 3 },
  { name: "Matt Evans", score: 3300, attempts: 4 },
  { name: "Nick Dolansky", score: 3300, attempts: 5 },
  { name: "Donaven Skiver", score: 3300, attempts: 11 },
  { name: "Ian Barter", score: 3100, attempts: 7 },
  { name: "Owen Babiuch", score: 3000, attempts: 6 },
  { name: "Zachary Stout", score: 2900, attempts: 4 },
  { name: "Cora Palfy", score: 2900, attempts: 12 },
  { name: "Arbor Lang", score: 2800, attempts: 12 },
  { name: "Morgan Fillar", score: 2700, attempts: 6 },
  { name: "Haydn Carr", score: 2600, attempts: 3 },
  { name: "Bella Smith", score: 2300, attempts: 3 },
  { name: "Wes Keller", score: 2100, attempts: 4 },
  { name: "Anna Lowe", score: 2100, attempts: 7 },
  { name: "Seth Chaffin", score: 1500, attempts: 3 },
  { name: "Kenny Boardwine", score: 1500, attempts: 3 },
  { name: "Ryder Kehres", score: 1200, attempts: 3 },
  { name: "Sean McGraw", score: 600, attempts: 3 },
  { name: "Bailey Borer", score: 300, attempts: 2 },
];

const ropeScores = [
  { name: "Jacob Fife", score: 365, attempts: 11 },
  { name: "Olivia Krasznay", score: 376, attempts: 3 },
  { name: "Cruz Mason", score: 283, attempts: 2 },
  { name: "Usamah Umar", score: 354, attempts: 5 },
  { name: "John Corn", score: 332, attempts: 4 },
  { name: "Carl Selig", score: 352, attempts: 5 },
  { name: "Dylan Brogan", score: 358, attempts: 7 },
  { name: "Brett Arthur", score: 295, attempts: 3 },
  { name: "Jeff Svec", score: 353, attempts: 4 },
  { name: "Zoe Neal", score: 320, attempts: 4 },
  { name: "Tyler Rush", score: 339, attempts: 8 },
  { name: "Jacob Obermiller", score: 246, attempts: 6 },
  { name: "Isaac Johnson", score: 299, attempts: 2 },
  { name: "Mike Selig", score: 373, attempts: 3 },
  { name: "Matthew Dobrilovic", score: 337, attempts: 3 },
  { name: "Nate Yorks", score: 233, attempts: 5 },
  { name: "Ian Sparks", score: 272, attempts: 8 },
  { name: "Christian Stevens", score: 321, attempts: 6 },
  { name: "Ethan Honis", score: 294, attempts: 6 },
  { name: "Tara Hites", score: 191, attempts: 5 },
  { name: "Sebastian Jungschaffer", score: 214, attempts: 7 },
  { name: "Domenic Tomazic", score: 242, attempts: 6 },
  { name: "Brandon Culig", score: 205, attempts: 2 },
  { name: "Logan Clemence", score: 237, attempts: 5 },
  { name: "William Greller", score: 177, attempts: 4 },
  { name: "Alex Webb", score: 238, attempts: 10 },
  { name: "Andrew Baker", score: 346, attempts: 7 },
  { name: "Gretchen Woodling", score: 207, attempts: 3 },
  { name: "Justin Moyer", score: 250, attempts: 3 },
  { name: "Matt Evans", score: 156, attempts: 3 },
  { name: "Nick Dolansky", score: 264, attempts: 2 },
  { name: "Donaven Skiver", score: 201, attempts: 6 },
  { name: "Ian Barter", score: 99, attempts: 2 },
  { name: "Owen Babiuch", score: 167, attempts: 2 },
  { name: "Zachary Stout", score: 195, attempts: 4 },
  { name: "Cora Palfy", score: 204, attempts: 4 },
  { name: "Arbor Lang", score: 140, attempts: 2 },
  { name: "Morgan Fillar", score: 237, attempts: 8 },
  { name: "Haydn Carr", score: 254, attempts: 7 },
  { name: "Bella Smith", score: 182, attempts: 3 },
  { name: "Wes Keller", score: 230, attempts: 5 },
  { name: "Anna Lowe", score: 107, attempts: 5 },
  { name: "Seth Chaffin", score: 89, attempts: 2 },
  { name: "Kenny Boardwine", score: 103, attempts: 11 },
  { name: "Ryder Kehres", score: 35, attempts: 6 },
  { name: "Sean McGraw", score: 107, attempts: 2 },
  { name: "Bailey Borer", score: 13, attempts: 3 },
];

async function seedData() {
  console.log("Seeding Spring Mixer 2024 data...");

  // Create Competition
  const competition = await prisma.mixerCompetition.create({
    data: {
      name: "Spring Mixer 2024",
      year: 2024,
    },
  });

  console.log(`Created Competition: ${competition.name}`);

  // Create Divisions
  for (const [divisionName, climbers] of Object.entries(divisions)) {
    const division = await prisma.mixerDivision.create({
      data: {
        name: divisionName,
        competitionId: competition.id,
      },
    });

    // Add Climbers to Division
    for (const climber of climbers) {
      await prisma.mixerClimber.create({
        data: {
          name: climber.name,
          divisionId: division.id,
          competitionId: competition.id,
        },
      });
    }

    console.log(`Created Division: ${divisionName}`);
  }

  // Create Routes
  for (const route of mixerRoutes) {
    await prisma.mixerRoute.create({
      data: {
        name: route.name,
        color: route.color,
        holds: JSON.stringify(route.holds),
        competitionId: competition.id,
      },
    });

    console.log(`Created Route: ${route.name}`);
  }

  // Create Scores
  for (const score of boulderScores) {
    const climber = await prisma.mixerClimber.findUnique({
      where: { name: score.name },
    });

    if (climber) {
      await prisma.mixerBoulderScore.create({
        data: {
          score: score.score,
          attempts: score.attempts,
          climberId: climber.id,
          competitionId: competition.id,
        },
      });

      console.log(`Added Boulder Score for ${score.name}`);
    }
  }

  for (const score of ropeScores) {
    const climber = await prisma.mixerClimber.findUnique({
      where: { name: score.name },
    });

    if (climber) {
      await prisma.mixerRopeScore.create({
        data: {
          score: score.score,
          attempts: score.attempts,
          climberId: climber.id,
          competitionId: competition.id,
        },
      });

      console.log(`Added Rope Score for ${score.name}`);
    }
  }

  console.log("Spring Mixer 2024 Data Imported Successfully!");
}

// Run the seeding function
seedData()
  .catch(error => console.error(error))
  .finally(() => prisma.$disconnect());
