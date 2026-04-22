import { Loader2 } from "lucide-react";

export default function Spinner() {
  return (
    <div className="w-full text-center py-20">
      <Loader2 className="inline-block animate-spin text-accent-cyan" size={32} />
    </div>
  );
}
