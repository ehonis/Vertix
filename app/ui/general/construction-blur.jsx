import Link from 'next/link';

export default function ConstructionBlur() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md font-barlow">
      <div className="bg-bg2/80 p-8 rounded-lg shadow-lg text-center w-xs">
        <h2 className="text-2xl font-bold mb-4 text-white">
          🚧 Construction 🚧
        </h2>

        <p className="text-white text-lg">
          Check back after the Spring Mixer to get access to all features of
          <span className="font-tomorrow text-white font-bold italic">
            {' '}
            Vertix
          </span>
        </p>
        <Link
          href="/"
          className="text-blue-500 text-md font-semibold underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
