import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/getCurrentAppUser";
import { MapEditorShell } from "@/app/ui/admin/map-editor/MapEditorShell";

export default async function MapEditorPage() {
  const user = await getCurrentAppUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/signin");
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#09090B]">
      <div className="h-full min-h-0">
        <MapEditorShell />
      </div>
    </div>
  );
}
