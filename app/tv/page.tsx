import TVSlider from "../ui/tv/tv-slider";
import { getTvData } from "@/lib/tv";

export const dynamic = "force-dynamic";

export default async function TV() {
  const {
    slides,
    monthlyLeaderBoardData,
    boulderGradeCounts,
    ropeGradeCounts,
    ropeTotal,
    boulderTotal,
  } = await getTvData();

  return (
    <div className="fixed inset-0 overflow-hidden">
      <TVSlider
        slides={slides}
        monthlyLeaderBoardData={monthlyLeaderBoardData}
        boulderGradeCounts={boulderGradeCounts}
        ropeGradeCounts={ropeGradeCounts}
        ropeTotal={ropeTotal}
        boulderTotal={boulderTotal}
      />
    </div>
  );
}
