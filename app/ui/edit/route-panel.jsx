import Link from "next/link";

export default function RoutePanel({ id, name, grade, date, color, onChange }) {
  return (
    <Link
      href={`/${id}`}
      key={id}
      className="h-12 w-full bg-bg2 rounded flex justify-between pr-2 items-center"
    >
      <div className="bg-green-400 overflow-hidden h-full w-16 rounded-l"></div>
      <p className="text-white font-bold">Route Name</p>
      <p className="text-white font-bold">5.11</p>
      <p className="text-white font-bold">08/10/2024</p>

      <div className="flex justify-between gap-3">
        <button className="rounded-lg bg-slate-500 px-2 text-white">
          Edit
        </button>
        <button className="rounded-lg bg-red-500 px-2  text-white">
          delete
        </button>
      </div>
    </Link>
  );
}
