import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Access individual query parameters
    const routes = searchParams.get('routes');

    const searchTerm = searchParams.get('text');

    if (routes === 'true') {
      const data = await prisma.Route.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } }, // Search by name
            { color: { contains: searchTerm, mode: 'insensitive' } },
            { grade: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });

      return NextResponse.json(
        {
          message: 'routes',
          data: data,
        },
        {
          status: 200,
        }
      );
    } else {
      const data = await prisma.user.findMany({
        where: {
          OR: [{ name: { contains: searchTerm, mode: 'insensitive' } }],
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
        take: 10,
      });
      return NextResponse.json(
        {
          message: 'profiles',
          data: data,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    return NextResponse.json({
      message: 'An error occurred',
      error: error.message,
      status: 500,
    });
  }
}
