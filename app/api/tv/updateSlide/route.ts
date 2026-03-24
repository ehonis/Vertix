import { getCurrentAppSession as auth } from "@/lib/getCurrentAppUser";
import { NextResponse } from "next/server";
import { createTvSlide, setTvSlideActive } from "@/lib/tv";

const ADMIN = "ADMIN";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else if (session.user.role != ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slideId, isActive } = await req.json();

  await setTvSlideActive(slideId, isActive);

  return NextResponse.json({ message: "Slide updated successfully" }, { status: 200 });
}

export async function POST(req: Request) {
  const session = await auth();

  console.log(session?.user);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else if (session.user.role != ADMIN) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { type, imageUrl, text, isActive } = await req.json();

  await createTvSlide({ type, imageUrl, text, isActive });

  return NextResponse.json({ message: "Slide created successfully" }, { status: 200 });
}
