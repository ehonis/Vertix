export default function RoutePanel({ name, grade, date, color }) {
  return (
    <div className="h-12 w-full bg-bg2 rounded flex justify-between px-2 items-center">
      <p className="text-white">08/10/2024</p>
      <p className="text-white">Route Name</p>
      <p className="text-white">Green</p>
      <p className="text-white">5.11</p>
      <div className="flex justify-between gap-3">
        <button className="rounded-lg bg-slate-500 px-2 text-white">
          Edit
        </button>
        <button className="rounded-lg bg-red-500 px-2  text-white">
          delete
        </button>
      </div>
    </div>
  );
}
