import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Wrench,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Painel de Máquinas",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Manutenção",
    href: "/manutencao",
    icon: Wrench,
  },
  {
    title: "Gerenciar Máquinas",
    href: "/gerenciar",
    icon: Settings,
  },
  {
    title: "Meu Perfil",
    href: "/perfil",
    icon: User,
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const user = { name: "Admin", role: "admin" };
  const isAdmin = user?.role === "admin";

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-slate-800 shadow-xl",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">SENAI</h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Controle de Máquinas</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        size={20}
                        className={cn(
                          "transition-colors",
                          isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                        )}
                      />
                      {item.title}
                    </div>
                    {isActive && <ChevronRight size={16} className="text-blue-200" />}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-6 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User size={20} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </Button>

          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-bold text-slate-800 lg:hidden">SENAI</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unidade</span>
              <span className="text-sm font-bold text-slate-700">Laboratório de Mecânica</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
