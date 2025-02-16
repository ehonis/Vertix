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

    console.log(data);
    const results = await Promise.all(
      data.map(async (element) => {
        if (element.type === 'route') {
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
        } else if (element.type === 'comp') {
          if (element.compType === 'Mixer') {
            const dateObject = parseDateString(element.selectedDate);
            const year = dateObject.getFullYear();
            let status = '';
            if (element.isActive) {
              status = 'upcoming';
            } else {
              status = 'unavailable';
            }
            return prisma.MixerCompetition.create({
              data: {
                name: element.title,
                year: year,
                status: status,
              },
            });
          }
        }
      })
    );

    // Return success response
    return NextResponse.json({
      message: 'Content successfully added',
      results,
    });
  } catch (error) {
    console.error('Error committing routes:', error);
    return NextResponse.json({
      message: 'An error occurred',
      error: error.message,
      status: 500,
    });
  }
}
