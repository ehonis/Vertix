import Image from "next/image";

// Define the data for each explainer section (same as before)
const explainersData = [
  {
    title: "Metrics",
    description: "Detailed and Personalized tracking for routes, competitions, and workouts",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="#000000"
        viewBox="0 0 256 256"
        className="size-32 fill-white"
      >
        <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"></path>
      </svg>
    ),
  },
  {
    title: "Competitions",
    description: "Live competitions featuring automatic scoring and leaderboards.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-32"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
        />
      </svg>
    ),
  },
  {
    title: "Community",
    description: "Contribute to the community with community grades and ratings!",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-32"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },
];

export default function Explainers() {
  return (
    <div className="relative font-barlow text-white w-full">
      {" "}
      {/* Removed h-svh, flex, items-center, justify-center */}
      {/* Gradient Background Layer */}
      <div
        className="absolute inset-0 w-full h-svh opacity-60 -z-10" // Full viewport height, behind content
        style={{
          background: "radial-gradient(circle at top right, #1447E6 0%, transparent 80%)",
        }}
      />
      {/* Content Wrapper Layer */}
      <div className="relative w-full h-svh md:h-auto flex items-center justify-center p-3 mt-40 md:mt-0">
        {" "}
        {/* min-h-svh, flex centering, padding */}
        {/* Content Block */}
        <div className="flex flex-col md:flex-row md:justify-center gap-5 md:gap-20 items-center w-full max-w-screen-lg">
          {/* Map over the data array */}
          {explainersData.map((explainer, index) => (
            <div key={index} className="flex flex-col gap-3 items-center text-center">
              <div className="bg-slate-900 rounded-full p-8 flex items-center justify-center z-10">
                {" "}
                {/* Ensure icons are above gradient */}
                {explainer.icon}
              </div>
              <h2 className="font-extrabold text-purple-600 text-3xl z-10">{explainer.title}</h2>
              <p className="font-normal z-10 w-xs">{explainer.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
