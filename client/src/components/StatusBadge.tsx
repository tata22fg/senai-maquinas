import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isAvailable = status === "available";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
        isAvailable
          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
          : "bg-red-50 text-red-600 border-red-100",
        className
      )}
    >
      {isAvailable ? (
        <>
          <CheckCircle2 size={12} />
          Disponível
        </>
      ) : (
        <>
          <AlertTriangle size={12} />
          Com Defeito
        </>
      )}
    </div>
  );
}
