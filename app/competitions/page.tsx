import Link from "next/link";

export default function CompetitionsPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 text-white">
      <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-lg backdrop-blur-sm">
        <p className="font-tomorrow text-xs uppercase tracking-[0.35em] text-primary">
          Phase 2 Migration
        </p>
        <h1 className="mt-4 font-jost text-4xl">Competitions are offline</h1>
        <p className="mt-4 font-barlow text-lg text-gray-300">
          The competitions surface has been retired while Vertix finishes the broader Convex
          migration.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/routes"
            className="blue-button rounded-lg px-4 py-2 font-barlow text-lg font-bold"
          >
            Browse Routes
          </Link>
        </div>
      </div>
    </div>
  );
}
