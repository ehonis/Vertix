export default function TextHeader(props) {
  return (
    <h1 className="text-white text-3xl self-center justify-center flex py-5 font-bold">
      {props.text}
    </h1>
  );
}
