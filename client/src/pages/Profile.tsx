import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, User, Check, AlertCircle } from "lucide-react";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: user } = trpc.auth.getMe.useQuery();
  const updateEmailMutation = trpc.auth.updateEmail.useMutation({
    onSuccess: () => {
      toast.success("E-mail atualizado com sucesso!");
      setIsSaving(false);
    },
    onError: (err) => {
      toast.error("Erro ao atualizar e-mail: " + err.message);
      setIsSaving(false);
    },
  });

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveEmail = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Por favor, insira um e-mail válido");
      return;
    }

    setIsSaving(true);
    updateEmailMutation.mutate({ email });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Meu Perfil</h1>
        <p className="text-slate-500 font-medium mt-1">Gerencie suas informações pessoais</p>
      </header>

      <div className="max-w-2xl">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{user?.name || "Usuário"}</h2>
                <p className="text-sm text-slate-500 mt-1">Administrador do Sistema</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Email Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={20} className="text-slate-600" />
                <label className="text-sm font-black text-slate-600 uppercase tracking-widest">
                  E-mail para Notificações
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  Este é o e-mail que receberá notificações quando um defeito for reportado em uma máquina.
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-email@example.com"
                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
                <button
                  onClick={handleSaveEmail}
                  disabled={isSaving || email === user?.email}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Salvar
                    </>
                  )}
                </button>
              </div>

              {user?.email && (
                <p className="text-xs text-slate-500 mt-2">
                  E-mail atual: <span className="font-mono font-bold text-slate-700">{user.email}</span>
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                ✓ Seu e-mail está seguro e será usado apenas para notificações de defeitos de máquinas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
