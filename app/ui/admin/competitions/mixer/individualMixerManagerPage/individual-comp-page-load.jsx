import VariablesComponent from './components/variables-component';
import DivisionsComponent from './components/divisions-component';
import RoutesComponent from './components/routes-components';
import UsersComponent from './components/users-component';

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
}) {
  return (
    <div className="w-full overflow-hidden">
      <h2 className="text-4xl mb-3 ">{name}</h2>
      {/*Route Variables*/}
      <VariablesComponent
        compDay={compDay}
        areScoresAvailable={areScoresAvailable}
        status={status}
        time={time}
        imageUrl={imageUrl}
      />
      {/* divisions */}
      <DivisionsComponent divisions={divisions} />
      {/* routes */}
      <RoutesComponent routes={routes} />
      {/* climbers */}
      <UsersComponent climbers={climbers} />
    </div>
  );
}
