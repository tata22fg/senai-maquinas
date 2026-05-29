import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#dc2626", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = trpc.analytics.summary.useQuery();
  const { data: faultsByType, isLoading: typeLoading } = trpc.analytics.faultsByType.useQuery();
  const { data: topMachines, isLoading: topLoading } = trpc.analytics.topMachinesWithDefects.useQuery();
  const { data: trendData, isLoading: trendLoading } = trpc.analytics.faultsTrend.useQuery();
  const { data: machineStats, isLoading: statsLoading } = trpc.analytics.machineStats.useQuery();

  const isLoading = summaryLoading || typeLoading || topLoading || trendLoading || statsLoading;

  // Preparar dados para gráfico de pizza
  const pieData = useMemo(() => {
    if (!faultsByType) return [];
    return faultsByType.map((item) => ({
      name: item.type,
      value: item.count,
    }));
  }, [faultsByType]);

  // Preparar dados para gráfico de barras
  const barData = useMemo(() => {
    if (!topMachines) return [];
    return topMachines.map((item) => ({
      name: item.name,
      code: item.code,
      defeitos: item.count,
    }));
  }, [topMachines]);

  // Preparar dados para gráfico de linha
  const lineData = useMemo(() => {
    if (!trendData) return [];
    return trendData.map((item) => ({
      month: item.month,
      defeitos: item.count,
    }));
  }, [trendData]);

  if (isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-500 font-medium mt-1">Análise detalhada de defeitos e máquinas</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chamados em Aberto */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Chamados em Aberto</p>
              <p className="text-3xl font-black text-red-600">{summary?.openCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Aguardando atendimento</p>
        </div>

        {/* Em Atendimento */}
        <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Em Atendimento</p>
              <p className="text-3xl font-black text-amber-600">{summary?.inProgressCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Wrench size={24} className="text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Em progresso</p>
        </div>

        {/* Resolvidos */}
        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resolvidos</p>
              <p className="text-3xl font-black text-emerald-600">{summary?.resolvedCount || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Concluídos</p>
        </div>

        {/* Tempo Médio */}
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tempo Médio</p>
              <p className="text-3xl font-black text-blue-600">{summary?.avgRepairTimeHours || 0}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Por reparo</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Defeitos por Tipo de Máquina */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Defeitos por Tipo de Máquina
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              Sem dados disponíveis
            </div>
          )}
        </div>

        {/* Máquinas com Mais Defeitos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            Máquinas com Mais Defeitos (Top 5)
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="defeitos" fill="#dc2626" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-400">
              Sem dados disponíveis
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-600" />
          Tendência de Defeitos ao Longo do Tempo
        </h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="defeitos"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-400">
            Sem dados disponíveis
          </div>
        )}
      </div>

      {/* Máquinas com Mais Problemas - Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RefreshCw size={20} className="text-amber-600" />
            Máquinas com Mais Problemas
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Máquina</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Tipo</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Localização</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Total de Defeitos</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Abertos</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {machineStats && machineStats.length > 0 ? (
                machineStats.map((machine) => (
                  <tr key={machine.id} className={cn(
                    "hover:bg-slate-50/50 transition-colors group border-l-4",
                    machine.status === "available"
                      ? "border-l-emerald-400"
                      : "border-l-red-400"
                  )}>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-slate-900">{machine.name}</p>
                        <p className="text-xs font-black text-slate-400 tracking-widest uppercase">{machine.code}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-600">{machine.type}</td>
                    <td className="px-8 py-6 text-sm text-slate-600">{machine.location}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-900">
                        {machine.totalFaults}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {machine.openFaults > 0 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 font-bold text-red-600">
                          {machine.openFaults}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold",
                        machine.status === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      )}>
                        {machine.status === "available" ? "✓ Disponível" : "⚠ Com Defeito"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400">
                    Nenhuma máquina com defeitos registrados
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
