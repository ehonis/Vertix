import ClientGraphs from "./client-graphs";
import VertixLogo from "./vertix-logo";

export default function GymStatsSlide({
  boulderGradeCounts,
  ropeGradeCounts,
  ropeTotal,
  boulderTotal,
}: {
  boulderGradeCounts: { grade: string; count: number }[];
  ropeGradeCounts: { grade: string; count: number }[];
  ropeTotal: number;
  boulderTotal: number;
}) {
  return (
    <div className="text-white font-barlow bg-black flex flex-col items-start gap-5">
      <VertixLogo />
      <ClientGraphs
        boulderCounts={boulderGradeCounts}
        ropeCounts={ropeGradeCounts}
        ropeTotal={ropeTotal}
        boulderTotal={boulderTotal}
      />
    </div>
  );
}
