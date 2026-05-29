import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Wrench,
  Box,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useMemo } from "react";

function formatTs(ts: number | null | undefined) {
  if (!ts) return "—";
  return format(new Date(ts), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

const faultStatusLabel: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  resolved: "Resolvido",
};

export default function Maintenance() {
  const [expandedMachines, setExpandedMachines] = useState<Set<number>>(new Set());
  
  const utils = trpc.useUtils();
  const { data: machines = [], isLoading: loadingMachines } = trpc.machines.list.useQuery();
  const { data: allFaults = [], isLoading: loadingFaults } = trpc.faults.listAll.useQuery({});

  const faultyMachines = useMemo(() => {
    return machines.filter(m => m.status === "faulty");
  }, [machines]);

  const openFaults = useMemo(() => {
    return allFaults.filter(f => f.status !== "resolved");
  }, [allFaults]);

  const faultsByMachine = useMemo(() => {
    const map: Record<number, typeof allFaults> = {};
    allFaults.forEach(fault => {
      if (!map[fault.machineId]) map[fault.machineId] = [];
      map[fault.machineId].push(fault);
    });
    return map;
  }, [allFaults]);

  const updateFaultStatus = trpc.faults.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso.");
      utils.faults.listAll.invalidate();
      utils.machines.list.invalidate();
    },
    onError: (err) => toast.error(err.message ?? "Erro ao atualizar status."),
  });

  const toggleMachine = (id: number) => {
    setExpandedMachines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isLoading = loadingMachines || loadingFaults;

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manutenção</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Gerenciamento de reparos e máquinas com defeito</p>
        </div>
        <button
          onClick={() => { utils.machines.list.invalidate(); utils.faults.listAll.invalidate(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-fit"
        >
          <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
          Atualizar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Máquinas com Defeito
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {faultyMachines.length > 0 ? (
                faultyMachines.map((machine) => (
                  <div key={machine.id} className="group">
                    <button
                      onClick={() => toggleMachine(machine.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100">
                          <Wrench size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{machine.name}</h3>
                          <p className="text-xs font-black text-slate-400 tracking-widest uppercase">{machine.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 uppercase tracking-tighter">
                            {faultsByMachine[machine.id]?.filter(f => f.status !== "resolved").length || 0} Chamados
                          </span>
                        </div>
                        {expandedMachines.has(machine.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </button>

                    {expandedMachines.has(machine.id) && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-4">
                          {faultsByMachine[machine.id]?.map((fault) => (
                            <div key={fault.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-[10px] font-black uppercase px-2 py-0.5 rounded border tracking-tight",
                                    fault.status === "open" && "bg-red-50 text-red-600 border-red-100",
                                    fault.status === "in_progress" && "bg-blue-50 text-blue-600 border-blue-100",
                                    fault.status === "resolved" && "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  )}>
                                    {faultStatusLabel[fault.status]}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold">{formatTs(fault.createdAt ? new Date(fault.createdAt).getTime() : null)}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{fault.description}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Relatado por: {fault.reportedBy}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {fault.status !== "resolved" && (
                                  <select
                                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                    value={fault.status}
                                    onChange={(e) => updateFaultStatus.mutate({ id: fault.id, status: e.target.value })}
                                  >
                                    <option value="open">Aberto</option>
                                    <option value="in_progress">Em Reparo</option>
                                    <option value="resolved">Resolvido</option>
                                  </select>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Tudo em ordem!</h3>
                  <p className="text-slate-500 font-medium">Nenhuma máquina com defeito registrada no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wrench size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Resumo Geral</h3>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Acompanhe a saúde do laboratório e a agilidade nos reparos.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
                      <Clock size={20} />
                    </div>
                    <span className="text-sm font-bold">Chamados em Aberto</span>
                  </div>
                  <span className="text-2xl font-black">{openFaults.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-sm font-bold">Resolvidos (Total)</span>
                  </div>
                  <span className="text-2xl font-black">{allFaults.filter(f => f.status === "resolved").length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
