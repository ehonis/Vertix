import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";
import type { TVData, TVSlide, TVRoute } from "@/lib/tvTypes";

function getConvex() {
  return createConvexServerClient();
}

export async function getTvData(): Promise<TVData> {
  const data = await getConvex().query(api.routes.getTvData, {});
  return {
    ...data,
    slides: data.slides.map(slide => ({
      ...slide,
      routes: slide.routes.map(route => ({
        ...route,
        setDate: new Date(route.setDate),
      })),
    })),
  };
}

export async function searchTvRoutes(text: string, slideId?: string) {
  const routes = await getConvex().query(api.routes.searchTvRoutes, { text, slideId });
  return routes.map(route => ({
    ...route,
    setDate: new Date(route.setDate),
  }));
}

export async function setTvSlideActive(slideId: string, isActive: boolean) {
  return await getConvex().mutation(api.routes.setTvSlideActive, { slideId, isActive });
}

export async function createTvSlide(input: {
  type: TVSlide["type"];
  imageUrl?: string;
  text?: string;
  isActive: boolean;
}) {
  return await getConvex().mutation(api.routes.createTvSlide, input);
}

export async function updateTvSlideRoutes(input: {
  functionName: "addRoute" | "removeRoute" | "uploadImage";
  routeId: string;
  slideId?: string;
  imageUrl?: string;
}) {
  return await getConvex().mutation(api.routes.updateTvSlideRoutes, input);
}

export function findFeaturedRoutes(slides: TVSlide[]): TVRoute[] {
  return slides.find(slide => slide.type === "FEATURED_ROUTE")?.routes ?? [];
}

export async function getRouteImagesById(routeId: string) {
  const data = await getTvData();
  for (const slide of data.slides) {
    const route = slide.routes.find(currentRoute => currentRoute.id === routeId);
    if (route) {
      return route.images;
    }
  }
  return [];
}
