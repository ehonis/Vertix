import RoutePanel from "./route-panel";

export default async function RoutePanels() {
  let routes = [];
  const getRoutes = async () => {
    try {
      const response = await fetch("@/app/api/get-route", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      routes.push(data);
    } catch (error) {
      console.error(error);
    }
  };

  getRoutes();

  if (routes.data) {
    routes = routes.data.filter((route) => route.type === "boulder");
  }

  if (!routes.data) {
    return <p>no data available</p>;
  }

  return (
    <div>
      {filteredRoutes.map((route) => {
        return <RoutePanel key={route.id} />;
      })}
    </div>
  );
}
