import VariablesComponent from './components/variables/variables-component';
import DivisionsComponent from './components/divisions/divisions-component';
import RoutesComponent from './components/routes/routes-component';
import UsersComponent from './components/users/users-component';

export default function IndividualCompPageLoad({
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
      <h2 className="text-4xl mb-3 ">{name}</h2>
      <VariablesComponent
        compDay={compDay}
        areScoresAvailable={areScoresAvailable}
        status={status}
        time={time}
        imageUrl={imageUrl}
      />
      <DivisionsComponent divisions={divisions} />
      <RoutesComponent routes={routes} />
      <UsersComponent
        climbers={climbers}
        ropeScores={ropeScores}
        boulderScores={boulderScores}
      />
    </div>
  );
}
