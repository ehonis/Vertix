import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { userId, routeId, rating, comment, isRated } = await request.json();
  if (!isRated) {
    try {
      const response = await prisma.RouteStar.create({
        data: {
          user: { connect: { id: userId } },
          route: { connect: { id: routeId } },
          stars: rating,
          comment: comment,
        },
      });
      if (!response.ok) {
        return NextResponse.json({ status: 400 });
      }
      return NextResponse.json(
        { status: 200 },
        { message: 'Successfully Rated Route' }
      );
    } catch (error) {
      return NextResponse.json({ status: 400 }, { message: `error: ${error}` });
    }
  } else if (isRated) {
    try {
      const response = await prisma.RouteStar.update({
        where: { userId_routeId: { userId, routeId } },
        data: { stars: rating, comment: comment },
      });
      if (!response.ok) {
        return NextResponse.json({ status: 400 });
      }
      return NextResponse.json(
        { status: 200 },
        { message: 'Successfully Updated Rating' }
      );
    } catch (error) {
      return NextResponse.json({ status: 400 }, { message: `error: ${error}` });
    }
  } else {
    return NextResponse.json(
      { status: 400 },
      { message: 'failed to handle any cases' }
    );
  }
}
