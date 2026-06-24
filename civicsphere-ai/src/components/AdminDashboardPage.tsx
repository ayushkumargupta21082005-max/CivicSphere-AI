import React, { useState } from 'react';
import { 
  Lock, AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Briefcase, 
  Settings, MessageSquare, ChevronDown, Award, Send, Users, AlertCircle, Sparkles
} from 'lucide-react';
import { CivicIssue, SeverityType, StatusType, Comment, TimelineEvent } from '../types';

interface AdminDashboardPageProps {
  issues: CivicIssue[];
  onUpdateIssue: (updatedIssue: CivicIssue) => void;
  highContrast: boolean;
}

export default function AdminDashboardPage({ issues, onUpdateIssue, highContrast }: AdminDashboardPageProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<StatusType>('In Progress');
  const [newDepartment, setNewDepartment] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [officialName, setOfficialName] = useState('Director Davis');

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  const departments = [
    'Department of Public Works',
    'Sanitation Services',
    'Water & Sewer Authority',
    'Electrical Department',
    'Traffic Control',
    'Parks & Recreation',
    'Emergency Services'
  ];

  const handleSelectIssue = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    setNewStatus(issue.status);
    setNewDepartment(issue.assignedDepartment);
    setResolutionDetails(issue.resolutionDetails || '');
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;

    // Create a new comment if admin wrote anything or if status changed
    const updatedComments = [...selectedIssue.comments];
    const updatedTimeline = [...selectedIssue.timeline];

    let changeText = `Official update: Status changed to ${newStatus}.`;
    if (newDepartment !== selectedIssue.assignedDepartment) {
      changeText += ` Re-routed from ${selectedIssue.assignedDepartment} to ${newDepartment}.`;
    }

    // System comment
    updatedComments.push({
      id: `c-sys-${Date.now()}`,
      author: 'System',
      role: 'system',
      text: changeText,
      createdAt: new Date().toISOString()
    });

    // Admin official comment if provided
    if (adminComment) {
      updatedComments.push({
        id: `c-admin-${Date.now()}`,
        author: officialName,
        role: 'official',
        text: adminComment,
        createdAt: new Date().toISOString()
      });
    }

    // Timeline event
    updatedTimeline.push({
      id: `t-admin-${Date.now()}`,
      status: newStatus,
      description: adminComment || `Issue status marked as ${newStatus} under ${newDepartment}.`,
      timestamp: new Date().toISOString(),
      updatedBy: officialName
    });

    const updatedIssue: CivicIssue = {
      ...selectedIssue,
      status: newStatus,
      assignedDepartment: newDepartment,
      resolutionDetails: newStatus === 'Resolved' ? resolutionDetails : selectedIssue.resolutionDetails,
      comments: updatedComments,
      timeline: updatedTimeline
    };

    onUpdateIssue(updatedIssue);
    setAdminComment('');
    setSelectedIssueId(null);
  };

  const activeEmergencies = issues.filter(i => i.severity === 'Emergency' && i.status !== 'Resolved');

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intro Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
        highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-slate-900 text-white border-white/5 shadow-xl'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-450" />
            <span className="text-xs uppercase tracking-wider font-bold text-amber-450 font-mono">Municipal Command Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Official Administration Console</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dispatch engineers, update repair lifecycles, route department backlogs, and publish public warnings.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Credentials: <span className="text-indigo-400">Authorized Official</span>
          </div>
        </div>
      </div>

      {/* Emergency Flash Bulletins */}
      {activeEmergencies.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 animate-bounce" />
            <span>Active Severe Emergencies ({activeEmergencies.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {activeEmergencies.map(e => (
              <div 
                key={e.id}
                onClick={() => handleSelectIssue(e)}
                className={`p-3 rounded-xl border text-xs cursor-pointer hover:bg-rose-500/10 transition-all ${
                  highContrast ? 'border-white bg-black' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-rose-500 truncate max-w-[180px]">{e.title}</span>
                  <span className="font-mono text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase">{e.ward}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{e.description}</p>
                <span className="text-[10px] text-slate-400 block mt-2">Score: {e.priorityScore} • Dept: {e.assignedDepartment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Issues List Column */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Unresolved Issues Queue</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {issues.filter(i => i.status !== 'Resolved').length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm">All complaints have been resolved! Excellent response rate.</p>
              </div>
            ) : (
              issues.filter(i => i.status !== 'Resolved').map((issue) => (
                <div 
                  key={issue.id}
                  onClick={() => handleSelectIssue(issue)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedIssueId === issue.id 
                      ? highContrast 
                        ? 'border-yellow-400 bg-slate-900 text-white border-2' 
                        : 'border-indigo-500 bg-indigo-500/5 shadow-md'
                      : highContrast
                        ? 'border-white bg-black hover:bg-slate-900'
                        : 'bg-white/5 border-white/10 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">{issue.category}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold font-mono uppercase ${
                      issue.severity === 'Emergency' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 mt-1 flex items-center gap-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{issue.description}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 text-[10px] text-slate-450">
                    <span className="font-semibold">{issue.assignedDepartment}</span>
                    <span className="font-bold font-mono text-indigo-400">SCORE: {issue.priorityScore}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Panel Column */}
        <div className="lg:col-span-5">
          {selectedIssue ? (
            <form onSubmit={handleSaveAction} className={`p-6 rounded-2xl border space-y-6 ${
              highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-xl'
            }`}>
              <div className="space-y-1 pb-3 border-b border-white/5">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Action Panel</span>
                <h3 className="font-bold text-base line-clamp-1 text-white">{selectedIssue.title}</h3>
                <span className="text-xs text-slate-400 block">{selectedIssue.ward} • Assigned to {selectedIssue.assignedDepartment}</span>
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <label htmlFor="admin-status" className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Update Status</label>
                <select
                  id="admin-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusType)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Submitted">Submitted (Awaiting review)</option>
                  <option value="In Progress">In Progress (Dispatching team)</option>
                  <option value="Resolved">Resolved (Complete fix)</option>
                  <option value="Rejected">Rejected (Out of scope / False alert)</option>
                </select>
              </div>

              {/* Re-route Department */}
              <div className="space-y-2">
                <label htmlFor="admin-dept" className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">Re-route Department</label>
                <select
                  id="admin-dept"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Resolution text box if resolved */}
              {newStatus === 'Resolved' && (
                <div className="space-y-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-2xl">
                  <label htmlFor="admin-res" className="block text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Resolution Logs & Verification Details</span>
                  </label>
                  <textarea
                    id="admin-res"
                    required
                    rows={3}
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                    placeholder="Describe how the issue was fixed (e.g. repaved pothole with 2 tons asphalt, replaced ballasts)..."
                    className="w-full text-xs p-2 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Dispatch official name */}
              <div className="space-y-2">
                <label htmlFor="admin-name" className="block text-xs font-bold uppercase text-slate-400 tracking-wider">Signed Official</label>
                <input
                  type="text"
                  id="admin-name"
                  required
                  value={officialName}
                  onChange={(e) => setOfficialName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Add progress comment */}
              <div className="space-y-2">
                <label htmlFor="admin-comment" className="block text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Public Progress Logs / Comment</span>
                </label>
                <textarea
                  id="admin-comment"
                  rows={2}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Inform the public what action is currently active..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Save actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssueId(null)}
                  className="px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 flex-1 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-action-btn"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex-1 cursor-pointer flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Update & Dispatch</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 h-full bg-slate-50/50 dark:bg-slate-950/20">
              <Settings className="h-10 w-10 text-slate-400 animate-spin-slow" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Awaiting Selection</h4>
                <p className="text-xs text-slate-400 max-w-[250px] mx-auto">
                  Select any active complaint from the left queue to open the official dispatch and resolution logs form.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
