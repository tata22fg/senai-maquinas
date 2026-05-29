import { trpc } from "@/lib/trpc";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Plus,
  Pencil,
  Trash2,
  Settings2,
  RefreshCw,
  Box,
  MapPin,
  Tag,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emptyForm = {
  code: "",
  name: "",
  type: "",
  location: "",
  notes: "",
  status: "available" as "available" | "faulty",
};

export default function ManageMachines() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: machines = [], isLoading, refetch } = trpc.machines.list.useQuery();

  const createMachine = trpc.machines.create.useMutation({
    onSuccess: () => {
      toast.success("Máquina adicionada com sucesso!");
      resetForm();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMachine = trpc.machines.update.useMutation({
    onSuccess: () => {
      toast.success("Máquina atualizada com sucesso!");
      resetForm();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMachine = trpc.machines.delete.useMutation({
    onSuccess: () => {
      toast.success("Máquina removida com sucesso.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (machine: any) => {
    setEditingId(machine.id);
    setForm({
      code: machine.code,
      name: machine.name,
      type: machine.type,
      location: machine.location,
      notes: machine.notes || "",
      status: machine.status,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMachine.mutate({ id: editingId, ...form });
    } else {
      createMachine.mutate(form);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gerenciar Máquinas</h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Adicione, edite ou remova equipamentos do inventário</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
            Atualizar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            <Plus size={18} />
            Nova Máquina
          </button>
        </div>
      </div>

      {/* Form Modal/Section */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900">
                {editingId ? "Editar Máquina" : "Cadastrar Nova Máquina"}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Código Identificador</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Ex: TOR-01"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Máquina</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Torno Mecânico Universal"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tipo / Categoria</label>
                  <input
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="Ex: Torno"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Localização</label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex: Bancada A - Setor 1"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Status Atual</label>
                <div className="flex gap-4">
                  {["available", "faulty"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s as any })}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2",
                        form.status === s
                          ? s === "available" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-500 bg-red-50 text-red-700"
                          : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {form.status === s && <Check size={18} />}
                      {s === "available" ? "Disponível" : "Com Defeito"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Observações Adicionais</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalhes técnicos ou observações..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMachine.isPending || updateMachine.isPending}
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  {editingId ? "Salvar Alterações" : "Confirmar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Machines List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Equipamento</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {machines?.map((machine) => (
                <tr 
                  key={machine.id} 
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors group border-l-4",
                    machine.status === "available"
                      ? "border-l-emerald-400"
                      : "border-l-red-400"
                  )}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Box size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{machine.name}</p>
                        <p className="text-xs font-black text-slate-400 tracking-widest uppercase">{machine.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <MapPin size={16} className="text-slate-400" />
                      {machine.location}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <StatusBadge status={machine.status} />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(machine)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir a máquina ${machine.name}?`)) {
                            deleteMachine.mutate(machine.id);
                          }
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {machines.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold italic">Nenhuma máquina cadastrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
