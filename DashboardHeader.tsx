import { Sun, Battery, Zap, Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'forecast', label: 'Forecast', icon: Sun },
  { id: 'optimization', label: 'Energy Optimization', icon: Zap },
  { id: 'anomalies', label: 'Anomalies', icon: Battery },
];

export default function DashboardHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('overview');

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-base-900/80 backdrop-blur-xl border-b border-base-600">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center shadow-lg shadow-solar-500/20">
                <Sun size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-base-800 flex items-center justify-center">
                <Zap size={11} className="text-battery-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SolarSync</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Intelligent Energy Management</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active === item.id
                      ? 'bg-base-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-base-700'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-battery-400/10 border border-battery-400/20">
              <div className="w-2 h-2 rounded-full bg-battery-400 animate-pulse-slow" />
              <span className="text-xs font-medium text-battery-300">System Online</span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-base-700"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active === item.id
                      ? 'bg-base-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-base-700'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
