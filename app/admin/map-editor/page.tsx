import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";
import { MapEditorShell } from "@/app/ui/admin/map-editor/MapEditorShell";

export default async function MapEditorPage() {
  const user = await getCurrentAppUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#09090B]">
      {/* Compact top chrome */}
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#09090B] px-4">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Admin
        </Link>
        <div className="h-3.5 w-px bg-white/[0.08]" />
        <h1 className="text-[13px] font-semibold tracking-tight text-white">Map Editor</h1>
      </header>

      <div className="min-h-0 flex-1">
        <MapEditorShell />
      </div>
    </div>
  );
}
