export default function IndividualCompPageLoad({
  name,
  imageUrl,
  climbers,
  routes,
  areScoresAvailable,
  compDay,
  time,
  status,
}) {
  return (
    <div>
      <h2 className="text-4xl">{name}</h2>
    </div>
  );
}
