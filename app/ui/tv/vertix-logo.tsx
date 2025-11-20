export default function VertixLogo() {
  return (
    <div className="flex flex-col items-start justify-start z-10" style={{ marginRight: "5vw" }}>
      <p className="text-white font-jost" style={{ fontSize: "clamp(8rem, 12rem, 16rem)" }}>
        Vertix
      </p>
      <p
        className="text-white font-barlow"
        style={{
          fontSize: "clamp(1.25rem, 2rem, 2.5rem)",
          marginTop: "clamp(-5rem, -6rem, -7rem)",
          marginLeft: "clamp(4rem, 4vw, 12rem)",
        }}
      >
        All of your climbing data, in one place
      </p>
    </div>
  );
}
