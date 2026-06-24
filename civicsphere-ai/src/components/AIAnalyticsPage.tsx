import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Sparkles, BrainCircuit, Activity, ShieldAlert, CheckCircle, Lightbulb, Loader2 } from 'lucide-react';
import { CivicIssue, AIAnalyticsSummary } from '../types';

interface AIAnalyticsPageProps {
  issues: CivicIssue[];
  highContrast: boolean;
}

export default function AIAnalyticsPage({ issues, highContrast }: AIAnalyticsPageProps) {
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [analytics, setAnalytics] = useState<AIAnalyticsSummary | null>(null);

  // Initial charts computations
  const getCategoryChartData = () => {
    const counts: { [key: string]: number } = {};
    issues.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return Object.keys(counts).map(cat => ({
      name: cat,
      count: counts[cat]
    }));
  };

  const getWardChartData = () => {
    const counts: { [key: string]: number } = {};
    issues.forEach(i => {
      counts[i.ward] = (counts[i.ward] || 0) + 1;
    });
    return Object.keys(counts).map(w => ({
      name: w,
      issues: counts[w],
      risk: w === 'Ward 3' ? 85 : w === 'Ward 5' ? 70 : w === 'Ward 2' ? 60 : 45
    }));
  };

  const getDepartmentChartData = () => {
    const counts: { [key: string]: { open: number; resolved: number } } = {};
    issues.forEach(i => {
      const dept = i.assignedDepartment;
      if (!counts[dept]) counts[dept] = { open: 0, resolved: 0 };
      if (i.status === 'Resolved') counts[dept].resolved += 1;
      else counts[dept].open += 1;
    });
    return Object.keys(counts).map(d => ({
      name: d.replace('Department of ', 'Dept ').replace('Authority', 'Auth'),
      Open: counts[d].open,
      Resolved: counts[d].resolved
    }));
  };

  const runAIForecast = async () => {
    setLoading(true);
    setProgressMsg('Compiling issues metadata arrays...');
    
    const logs = [
      'Querying server-side Express AI proxy...',
      'Bundling local incident logs...',
      'Contacting Google Gemini 3.5 Flash Model...',
      'Evaluating seasonal environmental multipliers (weather forecasts)...',
      'Synthesizing community health rating grids...',
      'Writing predictive analytics forecasts...'
    ];

    let logIdx = 0;
    const interval = setInterval(() => {
      if (logIdx < logs.length - 1) {
        logIdx++;
        setProgressMsg(logs[logIdx]);
      }
    }, 1200);

    try {
      const response = await fetch('/api/gemini/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ issues })
      });

      clearInterval(interval);
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      alert('Failed to connect to Gemini Analytics server. Standard offline metrics loaded.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first page load
  useEffect(() => {
    runAIForecast();
  }, []);

  // Standard Recharts cell colors
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#4f46e5'];

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title & Generate Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-2 ${
            highContrast ? 'text-white' : 'text-slate-100'
          }`}>
            <BrainCircuit className="h-8 w-8 text-indigo-400 animate-pulse" />
            <span>AI Predictive Dashboard</span>
          </h2>
          <p className="text-sm text-slate-400">
            Real-time municipal performance charts integrated with Gemini forecasting.
          </p>
        </div>

        <button
          onClick={runAIForecast}
          disabled={loading}
          className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg transform hover:scale-[1.02] cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black border-2 border-white'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-700 text-white shadow-indigo-500/10'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              <span className="text-xs uppercase tracking-wider">Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4.5 w-4.5 text-yellow-300 fill-yellow-300" />
              <span className="text-xs uppercase tracking-wider">Re-Run AI Forecast</span>
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-dashed border-white/10 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <h4 className="font-bold text-sm text-white">Generating Gemini AI Forecast Insights</h4>
          <p className="text-xs text-slate-400 font-mono animate-pulse">{progressMsg}</p>
        </div>
      )}

      {/* Analytics Cards Header */}
      {analytics && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
          }`}>
            <div className="h-14 w-14 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Community Health Score</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black font-mono text-indigo-400">{analytics.communityHealthScore}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Reflects active hazards and cleanup rates</p>
            </div>
          </div>

          {/* High Risk Ward Card */}
          <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
          }`}>
            <div className="h-14 w-14 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">High Risk Area Detected</span>
              <strong className="text-lg font-bold block text-rose-400 mt-0.5 font-mono">
                {analytics.highRiskAreas && analytics.highRiskAreas.length > 0 ? analytics.highRiskAreas[0].ward : 'None'}
              </strong>
              <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1">
                {analytics.highRiskAreas && analytics.highRiskAreas.length > 0 ? analytics.highRiskAreas[0].primaryHazard : 'No hazard warning'}
              </p>
            </div>
          </div>

          {/* Target Resolution Rate */}
          <div className={`p-6 rounded-2xl border flex items-center gap-4 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
          }`}>
            <div className="h-14 w-14 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Goal Resolution Rate</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black font-mono text-emerald-400">92%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Target dispatch response under 48 hours</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown (Bar) */}
        <div className={`p-6 rounded-2xl border ${
          highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
        }`}>
          <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider font-mono mb-4">Incidents by Category</h3>
          <div className="h-72 w-full text-xs">
            {issues.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No data points available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCategoryChartData()}>
                  <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                  <YAxis stroke="#888888" tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {getCategoryChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department performance load (Bar) */}
        <div className={`p-6 rounded-2xl border ${
          highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
        }`}>
          <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider font-mono mb-4">Department Queue Load</h3>
          <div className="h-72 w-full text-xs">
            {issues.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No departments assigned</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDepartmentChartData()} stackOffset="sign">
                  <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                  <YAxis stroke="#888888" tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Open" fill="#f59e0b" stackId="stack" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Resolved" fill="#10b981" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Predicted Issue growth chart */}
        {analytics && analytics.weeklyPredictions && (
          <div className={`p-6 rounded-2xl border lg:col-span-2 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
          }`}>
            <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider font-mono mb-4">Predicted Weekly Incident Rate</h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.weeklyPredictions}>
                  <XAxis dataKey="name" stroke="#888888" tickLine={false} />
                  <YAxis stroke="#888888" tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="expectedIssues" stroke="#6366f1" strokeWidth={3} dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Gemini Predictions & Recommendations Written Logs */}
      {analytics && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          {/* Trend Report Markdown */}
          <div className={`p-6 rounded-2xl border md:col-span-7 space-y-4 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
          }`}>
            <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-spin-slow" />
              <span>Gemini Predictive Trend Report</span>
            </h3>
            
            <div className="prose dark:prose-invert max-w-none text-xs text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
              {analytics.trendPrediction}
            </div>
          </div>

          {/* Action Recommendations List */}
          <div className={`p-6 rounded-2xl border md:col-span-5 space-y-4 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-md'
          }`}>
            <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Lightbulb className="h-4.5 w-4.5 text-amber-450" />
              <span>Smart Directives for Officials</span>
            </h3>

            <div className="space-y-3">
              {analytics.recommendations && analytics.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2.5 text-xs items-start bg-slate-950 p-3 rounded-xl border border-white/5">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center font-mono border border-indigo-500/20">
                    {i + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
