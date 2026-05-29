import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Box,
  ChevronRight,
  MapPin,
  Search,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFaultModal, setShowFaultModal] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [faultDescription, setFaultDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: machines = [], isLoading } = trpc.machines.list.useQuery();

  const reportFault = trpc.faults.report.useMutation({
    onSuccess: () => {
      toast.success("Defeito reportado com sucesso.");
      setShowFaultModal(false);
      setFaultDescription("");
      setSelectedMachineId(null);
      utils.machines.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resolveFault = trpc.faults.resolveLastForMachine.useMutation({
    onSuccess: () => {
      toast.success("Máquina marcada como Disponível.");
      utils.machines.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredMachines = useMemo(() => {
    return (machines || [])?.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase()) ||
        m.type.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "available" && m.status === "available") ||
        (filter === "faulty" && m.status === "faulty");

      return matchesSearch && matchesFilter;
    });
  }, [machines, search, filter]);

  const stats = {
    total: (machines || []).length,
    available: (machines || [])?.filter((m) => m.status === "available").length,
    faulty: (machines || [])?.filter((m) => m.status === "faulty").length,
  };

  if (isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Máquinas</h1>
          <p className="text-slate-500 font-medium mt-1">Acompanhe o status do laboratório em tempo real</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Disponíveis</p>
            <p className="text-2xl font-black text-emerald-700">{stats.available}</p>
          </div>
          <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 shadow-sm">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Defeito</p>
            <p className="text-2xl font-black text-red-700">{stats.faulty}</p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, código, tipo ou localização..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            {[
              { id: "all", label: "Todas" },
              { id: "available", label: "Disponíveis" },
              { id: "faulty", label: "Com Defeito" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={cn(
                  "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filter === opt.id
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredMachines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredMachines?.map((machine) => (
            <div 
              key={machine.id} 
              className={cn(
                "bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full",
                machine.status === "available"
                  ? "border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-500/10"
                  : "border-red-200 hover:border-red-400 hover:shadow-red-500/10"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <Link href={`/maquina/${machine.id}`}>
                  <a className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {machine.name}
                    </h3>
                    <p className="text-xs font-black text-slate-400 tracking-widest mt-0.5">{machine.code}</p>
                  </a>
                </Link>
                <StatusBadge status={machine.status} />
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-slate-500">
                  <Box size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">{machine.type}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">{machine.location}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                {machine.status === "available" ? (
                  <button
                    onClick={() => {
                      setSelectedMachineId(machine.id);
                      setShowFaultModal(true);
                    }}
                    className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    Reportar Defeito
                  </button>
                ) : (
                  <button
                    onClick={() => resolveFault.mutate({ machineId: machine.id })}
                    className="w-full py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} />
                    Marcar Disponível
                  </button>
                )}
                <Link href={`/maquina/${machine.id}`}>
                  <a className="flex items-center justify-center w-full py-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors gap-1">
                    Ver detalhes <ChevronRight size={14} />
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 border-dashed py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Box size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Nenhuma máquina encontrada</h3>
          <p className="text-slate-500 mt-2 max-w-xs font-medium">Tente ajustar os filtros ou a busca para encontrar o que procura.</p>
        </div>
      )}

      {showFaultModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900">Reportar Defeito</h2>
              <button onClick={() => { setShowFaultModal(false); setSelectedMachineId(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Problema</label>
                <textarea
                  required
                  value={faultDescription}
                  onChange={(e) => setFaultDescription(e.target.value)}
                  placeholder="Descreva o que está acontecendo..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-red-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => { setShowFaultModal(false); setSelectedMachineId(null); }}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={!faultDescription || reportFault.isPending}
                  onClick={() => {
                    if (selectedMachineId) {
                      reportFault.mutate({
                        machineId: selectedMachineId,
                        reportedBy: "Administrador",
                        description: faultDescription,
                        markAsFaulty: true
                      });
                    }
                  }}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                >
                  Enviar Relato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
