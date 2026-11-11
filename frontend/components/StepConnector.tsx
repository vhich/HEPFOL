import { useDBcontext } from "@/providers/dashboardProvider";

export function Step({ number, label }: { number: string; label: string }) {
  const { steps } = useDBcontext();
  const isActive = steps.includes(parseInt(number));
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          isActive
            ? "bg-purple-600 text-white"
            : "bg-transparent text-muted-foreground"
        }`}
      >
        {number}
      </div>

      <span
        className={`text-xs font-medium ${
          isActive ? "text-purple-400" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function StepConnector() {
  return <div className="mx-3 hidden h-px w-12 bg-slate-200 sm:block" />;
}
