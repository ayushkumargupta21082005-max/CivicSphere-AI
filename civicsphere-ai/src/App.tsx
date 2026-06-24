import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import ReportIssuePage from './components/ReportIssuePage';
import DashboardPage from './components/DashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import AIAnalyticsPage from './components/AIAnalyticsPage';
import AIChatAssistant from './components/AIChatAssistant';
import { CivicIssue, Comment } from './types';
import { getInitialIssues, calculatePriorityScore } from './utils/issueEngine';
import { Sparkles, Landmark, Terminal, Layers, BookOpen, Code2, HelpCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSizeClass, setFontSizeClass] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [showDocumentation, setShowDocumentation] = useState<boolean>(false);

  // Load issues on mount
  useEffect(() => {
    const saved = localStorage.getItem('civic_sphere_issues');
    if (saved) {
      try {
        setIssues(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse local issues storage', err);
        setIssues(getInitialIssues());
      }
    } else {
      const initial = getInitialIssues();
      setIssues(initial);
      localStorage.setItem('civic_sphere_issues', JSON.stringify(initial));
    }
  }, []);

  // Update dark mode wrapper class on HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handler for adding a new issue
  const handleIssueAdded = (newIssue: CivicIssue) => {
    const updated = [newIssue, ...issues];
    
    // Recalculate priority scores for all active issues to adjust for newly introduced duplicate weights
    const recalculated = updated.map(issue => {
      if (issue.status === 'Resolved') return issue;

      // Find matching categories in the same ward to dynamically adjust duplicates counts
      const duplicatesCount = updated.filter(
        i => i.id !== issue.id &&
             i.status !== 'Resolved' &&
             i.category.toLowerCase() === issue.category.toLowerCase() &&
             i.ward === issue.ward
      ).length;

      // Determine open days
      const created = new Date(issue.createdAt);
      const diffTime = Math.abs(Date.now() - created.getTime());
      const openDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const newScore = calculatePriorityScore({
        severity: issue.severity,
        ward: issue.ward,
        duplicateCount: duplicatesCount,
        emergencyEscalation: issue.emergencyEscalation,
        openDays
      });

      return {
        ...issue,
        duplicateCount: duplicatesCount,
        priorityScore: newScore
      };
    });

    setIssues(recalculated);
    localStorage.setItem('civic_sphere_issues', JSON.stringify(recalculated));
    setActiveTab('dashboard'); // take them to dashboard to see their new report!
  };

  // Handler for updating an issue (Admin actions)
  const handleUpdateIssue = (updatedIssue: CivicIssue) => {
    const updated = issues.map(issue => issue.id === updatedIssue.id ? updatedIssue : issue);
    setIssues(updated);
    localStorage.setItem('civic_sphere_issues', JSON.stringify(updated));
  };

  // Handler for posting user comment
  const handleAddComment = (issueId: string, comment: Comment) => {
    const updated = issues.map(issue => {
      if (issue.id === issueId) {
        const updatedComments = [...issue.comments, comment];
        return {
          ...issue,
          comments: updatedComments
        };
      }
      return issue;
    });
    setIssues(updated);
    localStorage.setItem('civic_sphere_issues', JSON.stringify(updated));
  };

  // Count active emergencies
  const activeEmergencies = issues.filter(i => i.severity === 'Emergency' && i.status !== 'Resolved').length;

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${fontSizeClass} ${
      highContrast 
        ? 'bg-black text-white' 
        : darkMode 
          ? 'bg-slate-950 text-slate-100' 
          : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Dynamic Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        fontSizeClass={fontSizeClass}
        setFontSizeClass={setFontSizeClass}
        emergencyCount={activeEmergencies}
      />

      {/* Primary tab router content */}
      <main className="flex-1 pb-16">
        {activeTab === 'landing' && (
          <LandingPage 
            setActiveTab={setActiveTab} 
            issues={issues}
            highContrast={highContrast}
          />
        )}
        {activeTab === 'report' && (
          <ReportIssuePage 
            onIssueAdded={handleIssueAdded} 
            issues={issues}
            highContrast={highContrast}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardPage 
            issues={issues} 
            onAddComment={handleAddComment}
            highContrast={highContrast}
          />
        )}
        {activeTab === 'admin' && (
          <AdminDashboardPage 
            issues={issues} 
            onUpdateIssue={handleUpdateIssue}
            highContrast={highContrast}
          />
        )}
        {activeTab === 'analytics' && (
          <AIAnalyticsPage 
            issues={issues}
            highContrast={highContrast}
          />
        )}
      </main>

      {/* Floating AIChatAssistant widget in bottom right */}
      <AIChatAssistant issues={issues} highContrast={highContrast} />

      {/* Collapsible Hackathon documentation drawer */}
      <footer className={`border-t transition-all duration-300 mt-auto py-8 ${
        highContrast 
          ? 'bg-black border-yellow-400 text-white' 
          : 'bg-slate-950 text-slate-400 border-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-400" />
              <span className="font-bold text-sm text-slate-100 font-mono">CivicSphere AI • Google Hackathon Project</span>
            </div>
            
            <button
              onClick={() => setShowDocumentation(!showDocumentation)}
              id="toggle-docs-btn"
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                highContrast
                  ? 'border-yellow-400 text-yellow-400 hover:bg-slate-900'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{showDocumentation ? 'Hide Judges Portal' : 'Show Judges Portal & Docs'}</span>
            </button>
          </div>

          {showDocumentation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-900 text-xs text-slate-300 leading-relaxed">
              {/* Architecture & Tech Stack */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono uppercase">
                  <Layers className="h-4 w-4 text-sky-400" />
                  <span>Architecture & Google Technologies</span>
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>Google Gemini 3.5 Flash Model:</strong> Runs on our Express proxy backend. Drives multi-modal image assessment, instant hazard categorization, routing directives, and community health scoring.
                  </p>
                  <p>
                    <strong>Full-Stack Proxy Architecture:</strong> Implements a Node.js Express server to route calls. This hides the <code>GEMINI_API_KEY</code> from client-side bundles completely, adhering to strict production security rules.
                  </p>
                  <p>
                    <strong>Resilient Fallback Mode:</strong> Built with static regex categorization and priority matrix logic on the backend. If quota fails or keys are missing, the app continues to operate flawlessly.
                  </p>
                  <p>
                    <strong>Modern Styling:</strong> Powered by Tailwind CSS, glassmorphic layout details, and custom Recharts visual analytics.
                  </p>
                </div>
              </div>

              {/* Hackathon Workflows & Hackathon Features */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-mono uppercase">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>Key Hackathon Features</span>
                </h4>
                <div className="space-y-2">
                  <p>
                    <strong>Smart Priority Engine:</strong> Scores reports (0-100) dynamically using duplicate volume, hazard ratings, ward factors, and emergency metrics.
                  </p>
                  <p>
                    <strong>Duplicate Detection:</strong> Checks incoming alerts against same-ward category backlogs and advises citizens to combine/merge forces.
                  </p>
                  <p>
                    <strong>Administrative Dispatch:</strong> Allows government heads to assign department tickets, track dispatches, and log resolutions.
                  </p>
                  <p>
                    <strong>Interactive AI Chat:</strong> Integrates the complete active local issues array as context, enabling citizens to query real-time town statuses factually.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-900 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Current local time: 2026-06-24 14:06 (PST)</span>
            <span>Created by Ayush Kumar • Natively Deployable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
