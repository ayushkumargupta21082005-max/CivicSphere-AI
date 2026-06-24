import React from 'react';
import { Shield, Sparkles, MapPin, Zap, ArrowRight, CheckCircle, BarChart3, Users, HelpCircle } from 'lucide-react';
import { CivicIssue } from '../types';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  issues: CivicIssue[];
  highContrast: boolean;
}

export default function LandingPage({ setActiveTab, issues, highContrast }: LandingPageProps) {
  // Statistics computations
  const totalReported = issues.length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const inProgressCount = issues.filter(i => i.status === 'In Progress').length;
  const pendingCount = issues.filter(i => i.status === 'Submitted').length;
  
  const avgConfidence = totalReported > 0 
    ? Math.round(issues.reduce((acc, curr) => acc + curr.aiConfidence, 0) / totalReported) 
    : 95;

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow Effects (hidden in high contrast) */}
        {!highContrast && (
          <div className="absolute inset-0 -z-10 flex items-center justify-center filter blur-[120px] opacity-15">
            <div className="h-64 w-64 rounded-full bg-indigo-500 animate-pulse"></div>
            <div className="h-48 w-48 rounded-full bg-indigo-400 delay-1000 animate-pulse"></div>
          </div>
        )}

        <div className="space-y-6 max-w-4xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
            highContrast 
              ? 'border-yellow-400 bg-black text-yellow-400' 
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
          }`}>
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-First Hyperlocal Community Portal</span>
          </div>

          <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] transition-all duration-300 ${
            highContrast ? 'text-white' : 'text-white'
          }`}>
            Empowering Citizens,{' '}
            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${
              highContrast ? 'text-yellow-400' : 'from-indigo-400 via-violet-400 to-sky-400'
            }`}>
              Streamlining City Response
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Report local pothole hazards, garbage pileups, dark street blocks, or sewer leaks. Our Gemini 3.5 AI instantly analyzes, categorizes, and dispatches requests to the exact municipal teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('report')}
              id="hero-report-btn"
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer ${
                highContrast
                  ? 'bg-yellow-400 text-black border-2 border-white'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:bg-indigo-700'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Report An Issue</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              id="hero-hub-btn"
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 border cursor-pointer ${
                highContrast
                  ? 'border-yellow-400 bg-black text-yellow-400'
                  : 'border-white/10 text-slate-300 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span>View Community Board</span>
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6 rounded-2xl border transition-all duration-300 ${
          highContrast 
            ? 'border-yellow-400 bg-black text-white' 
            : 'bg-white/5 border-white/10 text-white shadow-xl'
        }`}>
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="h-4 w-4 text-indigo-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Total Complaints</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-400">{totalReported}</div>
            <p className="text-[10px] text-slate-500 font-medium">Citizen submitted reports</p>
          </div>

          <div className="space-y-2 p-4 border-l border-white/10">
            <div className="flex items-center gap-2 text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Fully Resolved</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">{resolvedCount}</div>
            <p className="text-[10px] text-slate-500 font-medium">Fixed & verified by officials</p>
          </div>

          <div className="space-y-2 p-4 border-l border-white/10">
            <div className="flex items-center gap-2 text-slate-400">
              <BarChart3 className="h-4 w-4 text-amber-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Active Dispatch</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">{inProgressCount + pendingCount}</div>
            <p className="text-[10px] text-slate-500 font-medium">WIP and waiting review</p>
          </div>

          <div className="space-y-2 p-4 border-l border-white/10">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-spin-slow" />
              <span className="text-xs uppercase font-bold tracking-wider">AI Classification</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300">{avgConfidence}%</div>
            <p className="text-[10px] text-slate-500 font-medium">Average Routing Confidence</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            highContrast ? 'text-white' : 'text-white'
          }`}>
            How CivicSphere Works
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm">
            Three simple, automated phases powered by Google AI to bridge the gap between residents and city maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 shadow-md'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                1
              </div>
              <h3 className="font-bold text-lg text-white">Submit Report</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Explain the problem, specify the ward, and upload an optional image of the hazard.
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-indigo-400 mt-4 font-bold flex items-center gap-1">
              <span>Supports vision analysis</span>
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 shadow-md'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                2
              </div>
              <h3 className="font-bold text-lg text-white">AI Smart Analysis</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Google Gemini extracts details, rates risk severity, and instantly routes to the correct department team.
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-indigo-400 mt-4 font-bold">
              <span>Smart Priority Engine active</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-6 rounded-2xl border flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 shadow-md'
          }`}>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
                3
              </div>
              <h3 className="font-bold text-lg text-white">Track & Resolve</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Monitor status updates on an interactive timeline. Review official actions and details until completion.
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 mt-4 font-bold">
              <span>Verified resolution history</span>
            </div>
          </div>
        </div>
      </section>

      {/* Google Technologies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className={`p-8 rounded-3xl border ${
          highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 shadow-xl'
        }`}>
          <div className="space-y-4 max-w-3xl">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              <span>Built Natively inside Google AI Studio</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This application has been developed using cutting edge Google Cloud Run sandbox tools, securing API secret credentials with full-stack Node.js Express proxies while preserving rapid preview renders.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Model</h4>
                <p className="text-sm font-semibold text-white">gemini-3.5-flash</p>
                <p className="text-[10px] text-slate-500 mt-1">Multi-modal & text routing engine</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Architecture</h4>
                <p className="text-sm font-semibold text-white">Express Proxy Server</p>
                <p className="text-[10px] text-slate-500 mt-1">Hidden server-side API keys</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Design System</h4>
                <p className="text-sm font-semibold text-white">Geometric Balance</p>
                <p className="text-[10px] text-slate-500 mt-1">Glassmorphic & dark mode</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
