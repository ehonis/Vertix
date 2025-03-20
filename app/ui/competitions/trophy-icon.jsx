export default function TrophyIcon() {
  return (
    <div className="relative flex justify-center items-center">
      <div className="absolute flex justify-center items-center">
        <svg
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute size-64 animate-slowPulse"
        >
          <defs>
            <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
              <stop offset="50%" stopColor="rgba(255, 215, 0, 0.4)" />{" "}
              {/* Softer gold transition */}
              <stop offset="80%" stopColor="rgba(255, 215, 0, 1)" /> {/* Faint gold near edge */}
              <stop offset="100%" stopColor="rgba(32, 34, 36, 1)" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="150" r="140" fill="url(#gradient)" />
        </svg>
      </div>

      {/* Trophy Icon */}
      <div className="relative z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth={0.6}
          className="size-32 stroke-white fill-yellow-400 stroke"
          style={{
            filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 1))",
          }}
        >
          <path
            fillRule="evenodd"
            d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
