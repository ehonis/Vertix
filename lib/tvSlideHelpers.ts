import prisma from "@/prisma";
import { TVSlideType } from "@/generated/prisma/client";

/**
 * Get or create the featured route TV slide
 */
export async function getOrCreateFeaturedRouteSlide() {
  let featuredSlide = await prisma.tVSlide.findFirst({
    where: {
      type: TVSlideType.FEATURED_ROUTE,
      isActive: true,
    },
  });

  if (!featuredSlide) {
    featuredSlide = await prisma.tVSlide.create({
      data: {
        type: TVSlideType.FEATURED_ROUTE,
        isActive: true,
      },
    });
  }

  return featuredSlide;
}

/**
 * Add a route to the featured route TV slide (only for vfeature/5.feature routes)
 */
export async function addRouteToFeaturedSlide(routeId: string, grade: string) {
  const isFeaturedGrade = grade.toLowerCase() === "vfeature" || grade.toLowerCase() === "5.feature";
  
  if (!isFeaturedGrade) {
    return; // Only add featured grade routes
  }

  const featuredSlide = await getOrCreateFeaturedRouteSlide();
  
  await prisma.tVSlide.update({
    where: { id: featuredSlide.id },
    data: {
      routes: {
        connect: { id: routeId },
      },
    },
  });
}

/**
 * Remove a route from all TV slides
 */
export async function removeRouteFromAllSlides(routeId: string) {
  // Find all TV slides that contain this route
  const slidesWithRoute = await prisma.tVSlide.findMany({
    where: {
      routes: {
        some: {
          id: routeId,
        },
      },
    },
  });

  // Remove the route from all slides
  await Promise.all(
    slidesWithRoute.map(slide =>
      prisma.tVSlide.update({
        where: { id: slide.id },
        data: {
          routes: {
            disconnect: { id: routeId },
          },
        },
      })
    )
  );
}

/**
 * Remove multiple routes from all TV slides
 */
export async function removeRoutesFromAllSlides(routeIds: string[]) {
  // Find all TV slides that contain any of these routes
  const slidesWithRoutes = await prisma.tVSlide.findMany({
    where: {
      routes: {
        some: {
          id: { in: routeIds },
        },
      },
    },
  });

  // Remove all routes from all affected slides
  await Promise.all(
    slidesWithRoutes.map(slide =>
      prisma.tVSlide.update({
        where: { id: slide.id },
        data: {
          routes: {
            disconnect: routeIds.map(id => ({ id })),
          },
        },
      })
    )
  );
}

