import clsx from "clsx";

export default function RouteTile({ color, name, grade }) {
  return (
    <>
      <div className="bg-bg2 md:w-80 grow rounded-xl flex">
        <div
          className={clsx(
            " w-12 rounded-l-xl",
            {
              "bg-green-400": color === "green",
              "bg-red-400": color === "red",
              "bg-blue-400": color === "blue",
              "bg-yellow-400": color === "yellow",
              "bg-purple-400": color === "purple",
              "bg-orange-400": color === "orange",
              "bg-white": color === "white",
              "bg-black": color === "black",
              "bg-slate-400": color === "defaultColor",
              "bg-pink-400": color === "pink",
            } // Using clsx for dynamic color
          )}
        ></div>
        <div className="flex flex-col md:w-64 w-56 pt-1 pl-2">
          <p className="text-white text-lg font-bold break-words whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {name}
          </p>
          <p className="text-gray-300 text-md font-bold italic">{grade}</p>
        </div>
      </div>
    </>
  );
}
