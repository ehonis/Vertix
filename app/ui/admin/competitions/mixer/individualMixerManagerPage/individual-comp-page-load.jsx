import VariablesComponent from "./components/variables/variables-component";
import DivisionsComponent from "./components/divisions/divisions-component";
import RoutesComponent from "./components/routes/routes-component";
import UsersComponent from "./components/users/users-component";

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
}) {
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
      <RoutesComponent routes={routes} />
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
