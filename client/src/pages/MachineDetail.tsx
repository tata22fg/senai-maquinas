import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeft,
  Box,
  Calendar,
  History as HistoryIcon,
  Info,
  MapPin,
  Settings,
  Tag,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

function formatTs(ts: any) {
  if (!ts) return "—";
  try {
    const date = typeof ts === 'number' ? new Date(ts) : ts;
    if (date instanceof Date && !isNaN(date.getTime())) {
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    }
    return "—";
  } catch (e) {
    return "—";
  }
}

export default function MachineDetail() {
  const { id } = useParams();
  const machineId = parseInt(id!);
  const [showFaultModal, setShowFaultModal] = useState(false);
  const [faultDescription, setFaultDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: machine, isLoading } = trpc.machines.get.useQuery(machineId);
  const { data: faults = [] } = trpc.faults.listAll.useQuery({ machineId });

  const updateMachine = trpc.machines.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.machines.get.invalidate(machineId);
      utils.machines.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const reportFault = trpc.faults.report.useMutation({
    onSuccess: () => {
      toast.success("Defeito reportado com sucesso.");
      setShowFaultModal(false);
      setFaultDescription("");
      utils.machines.get.invalidate(machineId);
      utils.faults.listAll.invalidate({ machineId });
    },
    onError: (err) => toast.error(err.message),
  });

  const resolveFault = trpc.faults.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Defeito marcado como resolvido.");
      // Also update machine status to available
      if (machine) {
        updateMachine.mutate({
          id: machine.id,
          name: machine.name,
          code: machine.code,
          type: machine.type,
          location: machine.location,
          notes: machine.notes ?? undefined,
          status: "available"
        });
      }
      utils.faults.listAll.invalidate({ machineId });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Wrench size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Máquina não encontrada</h3>
        <Link href="/">
          <a className="mt-4 text-blue-600 font-bold hover:underline">Voltar ao painel</a>
        </Link>
      </div>
    );
  }

  const isFaulty = machine.status === "faulty";

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <Link href="/">
        <a className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao Painel
        </a>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className={cn(
            "bg-white rounded-3xl border-2 shadow-sm overflow-hidden",
            machine.status === "available"
              ? "border-emerald-200"
              : "border-red-200"
          )}>
            <div className="p-8 lg:p-12 border-b border-slate-100 bg-slate-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                    <Box size={40} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">{machine.code}</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{machine.name}</h1>
                  </div>
                </div>
                <StatusBadge status={machine.status} className="text-sm px-5 py-2" />
              </div>
            </div>

            <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} />
                  Especificações
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                      <Tag size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Tipo</p>
                      <p className="text-sm font-bold text-slate-700">{machine.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Localização</p>
                      <p className="text-sm font-bold text-slate-700">{machine.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} />
                  Observações
                </h3>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-[100px]">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    {machine.notes || "Nenhuma observação técnica cadastrada para este equipamento."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fault History */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <HistoryIcon className="text-slate-400" size={24} />
                Histórico de Manutenção
              </h2>
            </div>
            <div className="p-8">
              {faults?.length > 0 ? (
                <div className="space-y-4">
                  {faults?.map((fault: any) => (
                    <div key={fault.id} className="flex gap-6 relative group">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-4 h-4 rounded-full border-4 border-white shadow-sm z-10",
                          fault.status === "resolved" ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <div className="w-0.5 flex-1 bg-slate-100 group-last:bg-transparent" />
                      </div>
                      <div className="pb-8 flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                              {formatTs(fault.createdAt)}
                            </span>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border",
                              fault.status === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                            )}>
                              {fault.status === "resolved" ? "Resolvido" : "Pendente"}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">{fault.description}</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">Reportado por: {fault.reportedBy}</p>
                        </div>
                        
                        {fault.status !== "resolved" && (
                          <button
                            onClick={() => resolveFault.mutate({ id: fault.id, status: "resolved" })}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
                          >
                            Resolver Defeito
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <CheckCircle2 size={40} className="text-emerald-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold italic">Sem registros de manutenção para esta máquina.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions/Quick Info */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-xl font-black mb-6">Controle de Status</h3>
            <div className="space-y-4">
              {isFaulty ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Máquina com Defeito
                  </p>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Para voltar o status para "Disponível", você deve resolver o chamado pendente no histórico.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowFaultModal(true)}
                  className="w-full bg-red-600 hover:bg-red-700 p-5 rounded-2xl transition-all font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
                >
                  <AlertTriangle size={20} />
                  Reportar Defeito
                </button>
              )}
              
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link href="/gerenciar">
                  <a className="flex items-center justify-between w-full hover:bg-white/5 p-4 rounded-xl transition-all font-bold group text-slate-400 hover:text-white">
                    Editar Equipamento
                    <ChevronRight size={18} />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Fault Modal */}
      {showFaultModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900">Reportar Defeito</h2>
              <button onClick={() => setShowFaultModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
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
                  placeholder="Descreva o que está acontecendo com a máquina..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-red-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setShowFaultModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={!faultDescription || reportFault.isPending}
                  onClick={() => reportFault.mutate({
                    machineId,
                    reportedBy: "Administrador",
                    description: faultDescription,
                    markAsFaulty: true
                  })}
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

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
