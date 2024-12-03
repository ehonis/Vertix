import prisma from '@/prisma';
import { NextResponse } from 'next/server';
import { parseDateString } from '@/lib/dates';

export async function POST(request) {
  try {
    const res = await request.json();
    const data = res;

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No data to commit', status: 500 });
    }

    // Use Promise.all to handle async operations for all elements
    const results = await Promise.all(
      data.map(async (element) => {
        let routeType = '';
        if (element.grade.startsWith('v')) {
          routeType = 'boulder';
        } else {
          routeType = 'rope';
        }

        const dateObject = parseDateString(element.setDate);

        // Create a route in the database
        return prisma.Route.create({
          data: {
            title: element.title,
            grade: element.grade,
            type: routeType,
            color: element.color,
            setDate: dateObject,
            location: element.wall,
          },
        });
      })
    );

    // Return success response
    return NextResponse.json({ message: 'Routes successfully added', results });
  } catch (error) {
    console.error('Error committing routes:', error);
    return NextResponse.json({
      message: 'An error occurred',
      error: error.message,
      status: 500,
    });
  }
}
