import { RouteWithExtraData } from "@/app/api/routes/get-wall-routes-non-archive/route";
import prisma from "@/prisma"
import { Route, RouteImage, RouteStar, RouteCompletion, CommunityGrade, User, RouteType } from "@prisma/client"

// Type definitions for better type safety
type RouteWithImages = Route & {
  images: RouteImage[];
};

type RouteRating = {
  stars: number;
  comment: string | null;
};

// Grade mapping for boulder problems
export function getBoulderGradeMapping(grade:string){
    let mappedGrade = ""
    if(grade === "v1" || grade === "v0"){
        mappedGrade = "v0-v2"
      }else if(grade === "v2"){
        mappedGrade = "v1-v3"
      }else if(grade === "v3"){
        mappedGrade = "v2-v4"
      }else if(grade === "v4"){
        mappedGrade = "v3-v5"
      }else if(grade === "v5"){
        mappedGrade = "v4-v6"
      }else if(grade === "v6"){
        mappedGrade = "v5-v7"
      }else if(grade === "v7"){
        mappedGrade = "v6-v8"
      }else if(grade === "v8"){
        mappedGrade = "v7-v9"
      }else if(grade === "v9"){
        mappedGrade = "v8-v10"
      }else if(grade === "v10"){
        mappedGrade = "v9-v11"
      }else{
        mappedGrade = "vb"
      }

      return mappedGrade

}

// Get a route by ID with proper error handling
export async function getRouteById(id: string): Promise<Route | null> {
    try {
      const route = await prisma.route.findUnique({
        where: { id },
      });
      
      return route;
    } catch (error) {
      console.error(`Error finding route with id: ${id}`, error);
      return null;
    }
}

// Get route images with proper error handling
export async function getRouteImagesById(id: string): Promise<RouteImage[]> {
    try {
      const images = await prisma.routeImage.findMany({
        where: {
          routeId: id,
        },
      });
      return images;
    } catch (error) {
      console.error(`Error fetching images for route: ${id}`, error);
      return [];
    }
}

// Find user rating for a route
export async function findRating(userId: string | undefined, routeId: string): Promise<RouteRating | null> {
    if (!userId) return null;
    
    try {
      const rating = await prisma.routeStar.findFirst({
        where: {
          userId,
          routeId,
        },
      });
      return rating ? { stars: rating.stars, comment: rating.comment } : null;
    } catch (error) {
      console.error(`Error finding rating for route ${routeId} by user ${userId}`, error);
      return null;
    }
}

// Check if a route is completed by a user
export async function findIfCompleted(userId: string | undefined, routeId: string): Promise<boolean> {
    if (!userId) return false;
    
    try {
      const completion = await prisma.routeCompletion.findFirst({
        where: {
          userId,
          routeId,
        },
      });
      return completion !== null;
    } catch (error) {
      console.error(`Error checking completion status for route ${routeId} by user ${userId}`, error);
      return false;
    }
}

// Calculate total sends for a route
export async function findAllTotalSends(routeId: string): Promise<number> {
    try {
      const sends = await prisma.routeCompletion.findMany({
        where: { routeId },
      });
  
      return sends.reduce((acc, send) => acc + send.sends, 0);
    } catch (error) {
      console.error(`Error calculating total sends for route ${routeId}`, error);
      return 0;
    }
}

// Find user's proposed grade for a route
export async function findProposedGrade(userId: string | undefined, routeId: string): Promise<string | null> {
    if (!userId) return null;
    
    try {
      const userCommunityRouteGrade = await prisma.communityGrade.findFirst({
        where: { userId, routeId },
      });
      return userCommunityRouteGrade?.grade ?? null;
    } catch (error) {
      console.error(`Error finding proposed grade for route ${routeId} by user ${userId}`, error);
      return null;
    }
}

// Calculate average star rating from an array of ratings
function calculateStarRating(stars: number[]): number {
    if (!stars.length) return 0;
    return stars.reduce((sum, star) => sum + star, 0) / stars.length;
}

// Find the average star rating for a route
export async function findStarRating(routeId: string): Promise<number> {
    try {
      const starRatings = await prisma.routeStar.findMany({
        where: { routeId },
        select: { stars: true },
      });
      return calculateStarRating(starRatings.map(r => r.stars));
    } catch (error) {
      console.error(`Error calculating star rating for route ${routeId}`, error);
      return 0;
    }
}

// Find the closest grade from a numeric value
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

// Find the community grade for a route
export function findCommunityGradeForRoute(communityGrades: CommunityGrade[]): string {
  // Return "none" if no community grades exist
  if (!communityGrades.length) return "none";
      
  // Separate rope and boulder grades based on whether they start with 'v'
  const ropeGrades = communityGrades.filter((grade: { grade: string }) => !grade.grade.toLowerCase().startsWith('v'));
  const boulderGrades = communityGrades.filter((grade: { grade: string }) => grade.grade.toLowerCase().startsWith('v'));
      
  // Handle rope grades if any exist
  if (ropeGrades.length > 0) {
    // Define rope grade mapping with numeric values for averaging
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
        
    // Convert rope grades to numeric values and filter out invalid ones
    const numericGrades = ropeGrades
      .map((grade: { grade: string }) => ropeGradeMap[grade.grade.toLowerCase()])
      .filter((grade): grade is number => grade !== undefined);
          
    // Return "none" if no valid numeric grades found
    if (!numericGrades.length) return "none";
        
    // Calculate average numeric grade
    const averageNumeric = numericGrades.reduce((sum: number, num: number) => sum + num, 0) / numericGrades.length;

    // Find the closest grade from the mapping
    return findClosestGrade(averageNumeric, ropeGradeMap);
  }
  
  // Handle boulder grades if any exist (and no rope grades)
  if (boulderGrades.length > 0) {
    // Define boulder grade mapping with numeric values for averaging
    const boulderGradeMap: Record<string, number> = {
      "vb": 0,
      "v0": 1,
      "v1": 2,
      "v2": 3,
      "v3": 4,
      "v4": 5,
      "v5": 6,
      "v6": 7,
      "v7": 8,
      "v8": 9,
      "v9": 10,
      "v10": 11,
    };
        
    // Convert boulder grades to numeric values and filter out invalid ones
    const numericGrades = boulderGrades
      .map((grade: { grade: string }) => boulderGradeMap[grade.grade.toLowerCase()])
      .filter((grade): grade is number => grade !== undefined);
          
    // Return "none" if no valid numeric grades found
    if (!numericGrades.length) return "none";
        
    // Calculate average numeric grade and round to nearest integer
    const averageNumeric = numericGrades.reduce((sum: number, num: number) => sum + num, 0) / numericGrades.length;
    const closestNumeric = Math.round(averageNumeric);
    
    // Find the grade string that matches the rounded numeric value
    return Object.entries(boulderGradeMap).find(([_, value]) => value === closestNumeric)?.[0] ?? "none";
  }
      
  // Return "none" if no valid grades found
  return "none";
}

export async function findCommunityGrade(routeId: string): Promise<string> {
    try {
      const communityGrades = await prisma.communityGrade.findMany({
        where: { routeId },
        select: { grade: true },
      });
      
      if (!communityGrades.length) return "none";
      
      // Separate rope and boulder grades based on whether they start with 'v'
      const ropeGrades = communityGrades.filter((grade: { grade: string }) => !grade.grade.toLowerCase().startsWith('v'));
      const boulderGrades = communityGrades.filter((grade: { grade: string }) => grade.grade.toLowerCase().startsWith('v'));
      
      // Handle rope grades if any exist
      if (ropeGrades.length > 0) {
        // Define rope grade mapping with numeric values for averaging
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
        
        // Convert rope grades to numeric values and filter out invalid ones
        const numericGrades = ropeGrades
          .map((grade: { grade: string }) => ropeGradeMap[grade.grade.toLowerCase()])
          .filter((grade): grade is number => grade !== undefined);
          
        // Return "none" if no valid numeric grades found
        if (!numericGrades.length) return "none";
        
        // Calculate average numeric grade
        const averageNumeric = numericGrades.reduce((sum: number, num: number) => sum + num, 0) / numericGrades.length;
        return findClosestGrade(averageNumeric, ropeGradeMap);
      }
      
      // Handle boulder grades if any exist (and no rope grades)
      if (boulderGrades.length > 0) {
        // Define boulder grade mapping with numeric values for averaging
        const boulderGradeMap: Record<string, number> = {
          "vb": 0,
          "v0": 1,
          "v1": 2,
          "v2": 3,
          "v3": 4,
          "v4": 5,
          "v5": 6,
          "v6": 7,
          "v7": 8,
          "v8": 9,
          "v9": 10,
          "v10": 11,
        };
        
        // Convert boulder grades to numeric values and filter out invalid ones
        const numericGrades = boulderGrades
          .map((grade: { grade: string }) => boulderGradeMap[grade.grade.toLowerCase()])
          .filter((grade): grade is number => grade !== undefined);
          
        // Return "none" if no valid numeric grades found
        if (!numericGrades.length) return "none";
        
        // Calculate average numeric grade and round to nearest integer
        const averageNumeric = numericGrades.reduce((sum: number, num: number) => sum + num, 0) / numericGrades.length;
        const closestNumeric = Math.round(averageNumeric);
        return Object.entries(boulderGradeMap).find(([_, value]) => value === closestNumeric)?.[0] ?? "none";
      }
      
      // Return "none" if no valid grades found
      return "none";
    } catch (error) {
      console.error(`Error calculating community grade for route ${routeId}`, error);
      return "none";
    }
}

export function findIfRopeGradeIsHigher (user:User, route:Route){
  const ropeGrades = ["5.b", "5.7-", "5.7", "5.7+", "5.8-", "5.8", "5.8+", "5.9-", "5.9", "5.9+", "5.10-", "5.10", "5.10+", "5.11-", "5.11", "5.11+", "5.12-", "5.12", "5.12+", "5.13-", "5.13", "5.13+"]
  if(!user.highestRopeGrade){
    return true
  }else{
    if(ropeGrades.indexOf(user.highestRopeGrade) < ropeGrades.indexOf(route.grade)){
      return true
    }else{
      return false
    }
  }
}
export function findIfBoulderGradeIsHigher(user:User, route:Route){
  const boulderGrades = ["vb", "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]
  if(!user.highestBoulderGrade){
    return true
  }else{
    if(boulderGrades.indexOf(user.highestBoulderGrade) < boulderGrades.indexOf(route.grade)){
      return true
    }else{
      return false
    }
  }
}
export function isGradeHigher  (userHighest:string, newGrade:string, type:string) {
  const ropeGrades = ["5.b", "5.7-", "5.7", "5.7+", "5.8-", "5.8", "5.8+", "5.9-", "5.9", "5.9+", "5.10-", "5.10", "5.10+", "5.11-", "5.11", "5.11+", "5.12-", "5.12", "5.12+", "5.13-", "5.13", "5.13+"]
  const boulderGrades = ["vb", "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]

  if(type === "rope"){
    if(ropeGrades.indexOf(userHighest) < ropeGrades.indexOf(newGrade)){
      return true
    }else{
      return false
    }
  }else if(type === "boulder"){
    if(boulderGrades.indexOf(userHighest) < boulderGrades.indexOf(newGrade)){
      return true
    }else{
      return false
    }
  }
}
export function getGradeRange(grade:string) {
  const ropeGrades = [
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
  const boulderGrades = ["vb", "v0", "v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

  const isBoulderGrade = grade[0] === "v";
  const gradeList = isBoulderGrade ? boulderGrades : ropeGrades;
  const index = gradeList.findIndex(element => grade === element);

  if (index === -1) return []; // Handle case where grade isn't found

  if (isBoulderGrade) {
    if (index === 0 || index === 1) return ["vb", "v0", "v1"];
    if (index === gradeList.length - 1) return ["v8", "v9", "v10"];
    return gradeList.slice(Math.max(0, index - 1), Math.min(gradeList.length, index + 2));
  } else {
    if (index <= 2) return ["5.B", "5.7-", "5.7", "5.7+", "5.8-"];
    if (index >= gradeList.length - 3) return ["5.12", "5.12+", "5.13-", "5.13", "5.13+"];
    return gradeList.slice(index - 2, index + 3);
  }
}

