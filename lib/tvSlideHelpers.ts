import { getTvData, updateTvSlideRoutes } from "@/lib/tv";

export async function getOrCreateFeaturedRouteSlide() {
  const data = await getTvData();
  const featuredSlide = data.slides.find(slide => slide.type === "FEATURED_ROUTE");
  return featuredSlide ?? null;
}

export async function addRouteToFeaturedSlide(routeId: string, grade: string) {
  const isFeaturedGrade = grade.toLowerCase() === "vfeature" || grade.toLowerCase() === "5.feature";
  if (!isFeaturedGrade) {
    return;
  }

  const featuredSlide = await getOrCreateFeaturedRouteSlide();
  if (!featuredSlide) {
    return;
  }

  await updateTvSlideRoutes({
    functionName: "addRoute",
    routeId,
    slideId: featuredSlide.id,
  });
}

export async function removeRouteFromAllSlides(routeId: string) {
  const data = await getTvData();
  const slidesWithRoute = data.slides.filter(slide =>
    slide.routes.some(route => route.id === routeId)
  );
  await Promise.all(
    slidesWithRoute.map(slide =>
      updateTvSlideRoutes({
        functionName: "removeRoute",
        routeId,
        slideId: slide.id,
      })
    )
  );
}

export async function removeRoutesFromAllSlides(routeIds: string[]) {
  for (const routeId of routeIds) {
    await removeRouteFromAllSlides(routeId);
  }
}
