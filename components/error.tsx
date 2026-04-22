export default function Error({ err }: { err: any }) {
  return (
    <div className="container text-center w-full py-10">
      <h3 className="text-fg-primary">Oops, there is an error when requesting data</h3>
    </div>
  );
}
