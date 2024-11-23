export default function StarRating({ rating }) {
  const roundedRating = Math.floor(rating * 2) / 2;
  const [intPart, decimalPart] = roundedRating.toString().split('.');
  let starRating = [];
  for (let i = 0; i < intPart; i++) {
    starRating.push(
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="fill-yellow-500 shadow-lg size-8"
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (decimalPart) {
    starRating.push(
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="shadow-lg size-8"
      >
        <path
          d="M12 2.5c-.398 0-.776.235-.948.61l-2.082 5.005-5.404.434c-.882.071-1.247 1.18-.573 1.764l4.117 3.527-1.257 5.273c-.205.861.733 1.543 1.487 1.082L12 17.5V2.5Z"
          className="fill-yellow-500"
        />

        <path
          d="M12 2.5v15l4.743 2.752c.754.461 1.692-.22 1.487-1.082l-1.257-5.273 4.117-3.527c.674-.584.309-1.693-.573-1.764l-5.404-.434-2.082-5.005c-.172-.375-.55-.61-.948-.61Z"
          className="fill-slate-500"
        />
      </svg>
    );
  }
  return (
    <div className="flex gap-2 items-center">
      {starRating} <span className="text-white">({rating})</span>
    </div>
  );
}
