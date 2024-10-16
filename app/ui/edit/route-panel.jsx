import Link from 'next/link';
import { formatDate } from '@/lib/routeScripts';

export default function RoutePanel({ id, name, grade, date, color, onChange }) {
  if (color == 'defaultColor') {
    color = 'gray';
  }
  date = formatDate(date);

  return (
    <Link
      href={`/${id}`}
      key={id}
      className="h-12 w-full bg-bg2 rounded flex justify-between pr-2 items-center"
    >
      <div className="flex h-full items-center justify-center">
        <div
          className={`bg-${color}-400 overflow-hidden h-full w-16 rounded-l`}
        ></div>
        <p className="text-white font-bold ml-2 w-14">{name}</p>
      </div>
      <p className="text-white font-bold">{grade}</p>
      <p className="text-white font-bold">{date}</p>
    </Link>
  );
}
