import RouteTiles from '../ui/routes/routeTiles';

const getRoutes = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-route`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        next: { revalidate: 1 }, // Move cache inside the options object
      }
    );

    return response.json();
  } catch (error) {
    console.error(error);
  }
};

export default async function RoutePage() {
  const routes = await getRoutes();

  try {
    const boulderRoutes = routes.data.filter(
      (route) => route.type === 'boulder'
    );
    const ropeRoutes = routes.data.filter((route) => route.type === 'rope');
    return (
      <>
        <RouteTiles ropes={ropeRoutes} boulders={boulderRoutes} />
      </>
    );
  } catch {
    return <div>failed to get any routes</div>;
  }
}
