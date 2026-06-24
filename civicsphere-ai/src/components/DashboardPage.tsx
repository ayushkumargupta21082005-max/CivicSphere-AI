import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, AlertCircle, Clock, CheckCircle, XCircle, 
  MapPin, ShieldAlert, Calendar, ChevronDown, ChevronUp, MessageSquare, 
  Sparkles, Plus, Award, User, Send, Check
} from 'lucide-react';
import { CivicIssue, Comment } from '../types';

interface DashboardPageProps {
  issues: CivicIssue[];
  onAddComment: (issueId: string, comment: Comment) => void;
  highContrast: boolean;
}

export default function DashboardPage({ issues, onAddComment, highContrast }: DashboardPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterWard, setFilterWard] = useState('All');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'confidence'>('priority');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Comment posting state
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  // Extract unique categories
  const categories = ['All', 'Road Damage', 'Garbage', 'Water Leakage', 'Broken Streetlights', 'Sewage', 'Illegal Dumping', 'Traffic Problems', 'Trees', 'Flooding', 'Animals', 'Construction', 'Public Safety Hazards'];
  const severities = ['All', 'Low', 'Medium', 'High', 'Emergency'];
  const statuses = ['All', 'Submitted', 'In Progress', 'Resolved', 'Rejected'];
  const wards = ['All', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];

  // Handle comment submit
  const handleCommentSubmit = (e: React.FormEvent, issueId: string) => {
    e.preventDefault();
    if (!newCommentText || !commentAuthor) return;

    const addedComment: Comment = {
      id: `c-added-${Date.now()}`,
      author: commentAuthor,
      role: 'citizen',
      text: newCommentText,
      createdAt: new Date().toISOString()
    };

    onAddComment(issueId, addedComment);
    setNewCommentText('');
    setCommentAuthor('');
  };

  // Filters and search logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.assignedDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
    const matchesSeverity = filterSeverity === 'All' || issue.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
    const matchesWard = filterWard === 'All' || issue.ward === filterWard;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesWard;
  });

  // Sorting
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'priority') {
      return b.priorityScore - a.priorityScore;
    } else if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.aiConfidence - a.aiConfidence;
    }
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20';
      case 'In Progress': return 'bg-amber-500/15 text-amber-300 border-amber-500/20 animate-pulse';
      case 'Resolved': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
      case 'Rejected': return 'bg-rose-500/15 text-rose-300 border-rose-500/20';
      default: return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Emergency': return 'bg-rose-650 text-white border-rose-800';
      case 'High': return 'bg-amber-500 text-slate-950 border-amber-600';
      case 'Medium': return 'bg-indigo-600 text-white border-indigo-700';
      case 'Low': return 'bg-slate-800 text-slate-300 border-white/10';
      default: return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  const getPriorityColorClass = (score: number) => {
    if (score >= 80) return 'text-rose-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${highContrast ? 'text-white' : 'text-slate-950 dark:text-slate-100'}`}>
            Civic Action Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse, search, and track hyperlocal municipal resolutions in real-time.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            id="toggle-filters-btn"
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              highContrast
                ? 'border-yellow-400 text-yellow-400 hover:bg-slate-900'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <div className="relative">
            <select
              value={sortBy}
              id="sort-select"
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`appearance-none px-4 py-2 pr-8 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer transition-all duration-300 ${
                highContrast
                  ? 'border-yellow-400 text-yellow-400 bg-black'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              <option value="priority">Priority: High to Low</option>
              <option value="date">Date: Newest First</option>
              <option value="confidence">AI Confidence Level</option>
            </select>
            <ChevronDown className="h-3 w-3 absolute right-3 top-3 pointer-events-none text-slate-400" />
          </div>
        </div>
      </div>

      {/* Filters Area */}
      {(showFilters || highContrast) && (
        <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ${
          highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80'
        }`}>
          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="filter-cat" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
            <select
              id="filter-cat"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Severity */}
          <div className="space-y-1">
            <label htmlFor="filter-sev" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Severity</label>
            <select
              id="filter-sev"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {severities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label htmlFor="filter-stat" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
            <select
              id="filter-stat"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>

          {/* Ward */}
          <div className="space-y-1">
            <label htmlFor="filter-wrd" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ward</label>
            <select
              id="filter-wrd"
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {wards.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          id="search-input"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search civic complaints using keyword or simulated semantic query..."
          className={`w-full py-3.5 pl-12 pr-4 text-sm rounded-2xl border focus:outline-none transition-all ${
            highContrast 
              ? 'border-yellow-400 bg-black text-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:bg-slate-50/50'
          }`}
        />
        <Search className="h-5 w-5 text-slate-400 absolute left-4 top-3.5" />
      </div>

      {/* Meta count */}
      <p className="text-xs text-slate-400 font-mono">
        Showing {sortedIssues.length} of {issues.length} community complaints
      </p>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 gap-6">
        {sortedIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 text-sm">No complaints match your search query or filters.</p>
          </div>
        ) : (
          sortedIssues.map((issue) => {
            const isExpanded = expandedIssueId === issue.id;
            return (
              <div 
                key={issue.id} 
                className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                  highContrast 
                    ? 'border-yellow-400 bg-black text-white' 
                    : isExpanded
                      ? 'bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 border-blue-500/50 shadow-xl'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Visual Emergency Ribbon */}
                {issue.emergencyEscalation && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-600 to-rose-500"></div>
                )}

                {/* Main Card Section */}
                <div className="p-6 space-y-4">
                  {/* Top Bar inside Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                        highContrast ? 'border-yellow-400 text-yellow-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {issue.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{issue.ward}</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {issue.title}
                      {issue.emergencyEscalation && (
                        <ShieldAlert className="h-4.5 w-4.5 text-rose-500 shrink-0" title="Emergency Escalated" />
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                      {issue.description}
                    </p>
                  </div>

                  {/* Core Visual Metres (Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Priority Score Gauge */}
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority Score</span>
                        <div className="flex items-baseline gap-1 justify-center mt-1">
                          <span className={`text-2xl font-black font-mono leading-none ${getPriorityColorClass(issue.priorityScore)}`}>
                            {issue.priorityScore}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            issue.priorityScore >= 80 ? 'bg-rose-500' : issue.priorityScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${issue.priorityScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Assigned Department */}
                    <div className="text-xs p-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Dept</span>
                      <strong className="block mt-1 font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                        {issue.assignedDepartment}
                      </strong>
                    </div>

                    {/* Metadata dates */}
                    <div className="text-xs p-1 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reported On</span>
                        <strong className="block mt-0.5 text-slate-600 dark:text-slate-400 text-[11px] font-medium font-mono">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-6">
                    {/* Image Preview & Hazards List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {issue.image ? (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Vision Upload Evidence</span>
                          <img 
                            src={issue.image} 
                            alt={issue.title}
                            className="rounded-2xl max-h-56 object-cover border border-slate-300 dark:border-slate-800 shadow-md w-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900">
                          <p className="text-xs text-slate-400 text-center">No photograph was provided. Details processed via semantic text models.</p>
                        </div>
                      )}

                      {/* Hazards and Impact Details */}
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>AI Identified Hazards</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {issue.hazards.map((hazard, index) => (
                              <span key={index} className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-semibold border border-rose-500/15">
                                {hazard}
                              </span>
                            ))}
                          </div>
                        </div>

                        {issue.impactEstimation && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Community Impact</span>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl">
                              {issue.impactEstimation}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">AI Routing Confidence:</span>
                            <span className="font-bold text-sky-400 font-mono">{issue.aiConfidence}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Duplications Merged:</span>
                            <span className="font-bold text-slate-600 dark:text-slate-300">{issue.duplicateCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Safety Advisory Banner */}
                    {issue.citizenAdvisory && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-600 dark:text-amber-400">
                        <Sparkles className="h-5 w-5 shrink-0 mt-0.5 animate-spin-slow text-amber-500" />
                        <div>
                          <strong className="text-xs uppercase tracking-wider block mb-1">Citizen Safety Advisory</strong>
                          <p className="text-xs leading-relaxed">{issue.citizenAdvisory}</p>
                        </div>
                      </div>
                    )}

                    {/* Timeline of dispatches */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>Resolution Progress Timeline</span>
                      </h4>
                      <div className="border-l border-slate-200 dark:border-slate-800 ml-3.5 pl-5 space-y-4">
                        {issue.timeline.map((event) => (
                          <div key={event.id} className="relative">
                            <div className="absolute -left-7.5 top-1.5 h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900"></div>
                            <div className="text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{event.status}</span>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{event.description}</p>
                              <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                                <span>Updated by: {event.updatedBy}</span>
                                <span>•</span>
                                <span className="font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments & Discussion */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        <span>Discussion & Official Updates ({issue.comments.length})</span>
                      </h4>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {issue.comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className={`p-3 rounded-2xl text-xs space-y-1.5 border ${
                              comment.role === 'system'
                                ? 'bg-sky-500/5 border-sky-500/10'
                                : comment.role === 'official'
                                  ? 'bg-amber-500/5 border-amber-500/10'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold flex items-center gap-1">
                                {comment.role === 'official' && <Award className="h-3.5 w-3.5 text-amber-500" />}
                                {comment.author}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({comment.role === 'system' ? 'System' : comment.role === 'official' ? 'Official' : 'Resident'})
                                </span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment Form */}
                      <form onSubmit={(e) => handleCommentSubmit(e, issue.id)} className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={commentAuthor}
                            onChange={(e) => setCommentAuthor(e.target.value)}
                            className="text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none col-span-1 focus:border-indigo-500"
                          />
                          <div className="col-span-2 flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Post comment or question..."
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              className="text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 focus:outline-none flex-1 focus:border-indigo-500"
                            />
                            <button
                              type="submit"
                              className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 flex items-center gap-1 transition-all"
                            >
                              <Send className="h-3 w-3" />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Toggle Card Details Button */}
                <button
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                  id={`expand-btn-${issue.id}`}
                  className={`w-full py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    highContrast
                      ? 'bg-yellow-400 text-black font-extrabold border-t border-white'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-t border-slate-100 dark:border-slate-850'
                  }`}
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Explore AI Assessment & Timeline</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
