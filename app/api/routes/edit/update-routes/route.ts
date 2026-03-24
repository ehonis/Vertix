import { NextResponse } from "next/server";
import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { api } from "@/convex/_generated/api";
import { createConvexServerClient } from "@/lib/convexServer";

type TransformedRoute = {
  id: string;
  name: string;
  order: number;
};

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { routesToChange }: { routesToChange: TransformedRoute[] } = await req.json();

  const convex = createConvexServerClient();
  await convex.mutation(api.routes.updateRouteSortOrders, {
    routes: routesToChange.map(route => ({ id: route.id, order: route.order })),
  });

  return NextResponse.json({ message: "Routes updated successfully" });
}
