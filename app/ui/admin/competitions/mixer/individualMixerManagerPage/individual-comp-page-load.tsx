import DivisionsComponent from "./components/divisions/divisions-component";
import RoutesComponent from "./components/routes/routes-component";
import UsersComponent from "./components/users/users-component";
import {
  MixerClimber,
  MixerRoute,
  MixerBoulderScore,
  CompetitionStatus,
  MixerDivision,
  MixerRopeScore,
  MixerBoulder,
} from "@prisma/client";
import VariablesComponent from "./components/variables/variables-component";

type inDividualCompPageProps = {
  compId: string;
  name: string;
  imageUrl: string | null;
  climbers: MixerClimber[];
  routes: MixerRoute[];
  areScoresAvailable: boolean;
  compDay: Date | null;
  time: number;
  status: CompetitionStatus;
  divisions: MixerDivision[];
  ropeScores: MixerRopeScore[];
  boulderScores: MixerBoulderScore[];
};
export default function IndividualCompPageLoad({
  compId,
  name,
  imageUrl,
  climbers,
  routes,
  areScoresAvailable,
  compDay,
  time,
  status,
  divisions,
  ropeScores,
  boulderScores,
}: inDividualCompPageProps) {
  return (
    <div className="w-full overflow-hidden">
      <VariablesComponent
        compId={compId}
        name={name}
        compDay={compDay}
        areScoresAvailable={areScoresAvailable}
        status={status}
        time={time}
        imageUrl={imageUrl}
      />
      <DivisionsComponent divisions={divisions} compId={compId} />
      <RoutesComponent routes={routes} compId={compId} />
      <UsersComponent
        compId={compId}
        climbers={climbers}
        ropeScores={ropeScores}
        boulderScores={boulderScores}
        divisions={divisions}
      />
    </div>
  );
}
