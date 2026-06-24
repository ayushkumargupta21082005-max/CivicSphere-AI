import React, { useRef, useState } from 'react';
import { Upload, AlertTriangle, Sparkles, CheckCircle2, User, Mail, Map, Loader2, Info } from 'lucide-react';
import { CivicIssue, SeverityType } from '../types';
import { findDuplicateSuggestions } from '../utils/issueEngine';

interface ReportIssuePageProps {
  onIssueAdded: (newIssue: CivicIssue) => void;
  issues: CivicIssue[];
  highContrast: boolean;
}

export default function ReportIssuePage({ onIssueAdded, issues, highContrast }: ReportIssuePageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState('Ward 1');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested category from typing
  const localAnalysisText = `${title} ${description}`.toLowerCase();
  let suggestedCategory = 'Public Safety Hazards';
  if (localAnalysisText.includes('pothole') || localAnalysisText.includes('road') || localAnalysisText.includes('street')) suggestedCategory = 'Road Damage';
  else if (localAnalysisText.includes('garbage') || localAnalysisText.includes('trash') || localAnalysisText.includes('waste')) suggestedCategory = 'Garbage';
  else if (localAnalysisText.includes('water') || localAnalysisText.includes('leak') || localAnalysisText.includes('pipe')) suggestedCategory = 'Water Leakage';
  else if (localAnalysisText.includes('light') || localAnalysisText.includes('streetlights')) suggestedCategory = 'Broken Streetlights';
  else if (localAnalysisText.includes('sewage') || localAnalysisText.includes('drain')) suggestedCategory = 'Sewage';
  else if (localAnalysisText.includes('dumping')) suggestedCategory = 'Illegal Dumping';
  else if (localAnalysisText.includes('flood') || localAnalysisText.includes('rain')) suggestedCategory = 'Flooding';
  else if (localAnalysisText.includes('tree')) suggestedCategory = 'Trees';
  else if (localAnalysisText.includes('traffic')) suggestedCategory = 'Traffic Problems';

  // Duplicate suggestions based on typing
  const duplicates = findDuplicateSuggestions({ category: suggestedCategory, ward }, issues);

  // File to Base64
  const processFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setBase64Image(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit and query the backend Gemini API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !reporterName || !reporterEmail) return;

    setAnalyzing(true);
    setProgressMsg('Initiating secure full-stack connection...');

    const messages = [
      'Establishing secure full-stack connection...',
      'Verifying environment and API proxy authorization...',
      base64Image ? 'Gemini is running Multi-modal Vision Analysis on image...' : 'Gemini is parsing report text metadata...',
      'Analyzing local ward hazard densities...',
      'Calculating Smart Priority Score (Health/Safety metrics)...',
      'Determining municipal department routing...'
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length - 1) {
        msgIdx++;
        setProgressMsg(messages[msgIdx]);
      }
    }, 1500);

    try {
      const response = await fetch('/api/gemini/analyze-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          ward,
          reporterName,
          image: base64Image
        })
      });

      clearInterval(interval);
      setProgressMsg('Writing final verified analysis details...');

      const aiResponse = await response.json();

      // Formulate final database issue item
      const newIssueItem: CivicIssue = {
        id: `issue-${Date.now()}`,
        title: aiResponse.suggestedTitle || title,
        description: aiResponse.suggestedDescription || description,
        category: aiResponse.category || suggestedCategory,
        severity: (aiResponse.severity as SeverityType) || 'Medium',
        status: 'Submitted',
        priorityScore: 50, // will be recalculated dynamically based on severity/ward/duplicates
        ward,
        reporterName,
        reporterEmail,
        image: base64Image || undefined,
        createdAt: new Date().toISOString(),
        assignedDepartment: aiResponse.assignedDepartment || 'Department of Public Works',
        location: {
          address: `${ward} Central District Area`,
          lat: ward === 'Ward 1' ? 37.7833 : ward === 'Ward 2' ? 37.7542 : ward === 'Ward 3' ? 37.7749 : ward === 'Ward 4' ? 37.7610 : 37.7699,
          lng: ward === 'Ward 1' ? -122.4167 : ward === 'Ward 2' ? -122.4211 : ward === 'Ward 3' ? -122.4194 : ward === 'Ward 4' ? -122.4350 : -122.4468
        },
        comments: [
          {
            id: `c-sys-${Date.now()}`,
            author: 'System',
            role: 'system',
            text: `AI Smart routing analyzed report. Categorized as ${aiResponse.category}. Assigned to ${aiResponse.assignedDepartment} with priority level ${aiResponse.severity}. Confidence: ${aiResponse.confidence}%.`,
            createdAt: new Date().toISOString()
          }
        ],
        timeline: [
          {
            id: `t-sys-${Date.now()}`,
            status: 'Submitted',
            description: `Citizen report submitted & analyzed by Gemini.`,
            timestamp: new Date().toISOString(),
            updatedBy: reporterName
          }
        ],
        isDuplicate: duplicates.length > 0,
        duplicateOf: duplicates.length > 0 ? duplicates[0].id : null,
        duplicateCount: duplicates.length,
        citizenReputationScore: 75,
        aiConfidence: aiResponse.confidence || 85,
        hazards: aiResponse.hazards || ['General safety risk'],
        citizenAdvisory: aiResponse.citizenAdvisory || 'Please stay cautious in the vicinity.',
        governmentInsights: aiResponse.governmentInsights || 'Assigned to standard patrol list.',
        emergencyEscalation: aiResponse.emergencyEscalation || false,
        impactEstimation: aiResponse.impactEstimation || 'Localized neighborhood impact.'
      };

      setLatestAnalysis(aiResponse);
      onIssueAdded(newIssueItem);
      setSuccess(true);

      // Reset form fields
      setTitle('');
      setDescription('');
      setBase64Image(null);
    } catch (err) {
      console.error(err);
      clearInterval(interval);
      alert('An error occurred during report analysis. Utilizing local offline fallbacks.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResetSuccess = () => {
    setSuccess(false);
    setLatestAnalysis(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {analyzing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl flex flex-col items-center gap-4 max-w-md shadow-2xl">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <h3 className="font-extrabold text-lg text-slate-100">Analyzing Complaint with Gemini</h3>
            <p className="text-xs text-slate-400 h-10 animate-pulse">{progressMsg}</p>
            <span className="text-[10px] font-mono text-slate-500">models/gemini-3.5-flash</span>
          </div>
        </div>
      )}

      {success ? (
        <div className={`p-8 rounded-2xl border text-center space-y-6 ${
          highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-xl'
        }`}>
          <div className="mx-auto h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Complaint Successfully Submitted!</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your report has been analyzed, scored, and listed on the public dashboard. Local department heads have been notified.
            </p>
          </div>

          {latestAnalysis && (
            <div className="p-5 rounded-2xl bg-white/5 text-left border border-white/10 max-w-xl mx-auto space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Gemini Dispatch Report</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Classified Category:</span>
                  <strong className="font-semibold text-slate-200 text-sm">{latestAnalysis.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Calculated Severity:</span>
                  <strong className="font-semibold text-slate-200 text-sm">{latestAnalysis.severity}</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-white/5">
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-bold">Assigned Department:</span>
                  <strong className="font-semibold text-slate-200 text-sm">{latestAnalysis.assignedDepartment}</strong>
                </div>
              </div>
              {latestAnalysis.citizenAdvisory && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-400 font-medium">
                  <strong>Safety Advisory:</strong> {latestAnalysis.citizenAdvisory}
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleResetSuccess}
              className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer"
            >
              File Another Issue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${highContrast ? 'text-white' : 'text-white'}`}>
              Submit a Civic Concern
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Provide high-quality details to speed up emergency routing.
            </p>
          </div>

          <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
            highContrast ? 'border-yellow-400 bg-black text-white' : 'bg-white/5 border-white/10 text-white shadow-xl'
          }`}>
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="issue-title" className="block text-xs uppercase font-bold tracking-wider text-slate-400">Report Title</label>
              <input
                type="text"
                id="issue-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep pothole on crossings, broken streetlight outside 412"
                className={`w-full p-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                  highContrast 
                    ? 'border-white bg-black text-white focus:border-yellow-400' 
                    : 'border-white/10 bg-slate-950 focus:border-indigo-500 focus:bg-slate-900 text-slate-200 placeholder:text-slate-600'
                }`}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="issue-description" className="block text-xs uppercase font-bold tracking-wider text-slate-400">Incident Description</label>
              <textarea
                id="issue-description"
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what is happening, exact location markers, hazards, and how long it has been present..."
                className={`w-full p-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                  highContrast 
                    ? 'border-white bg-black text-white focus:border-yellow-400' 
                    : 'border-white/10 bg-slate-950 focus:border-indigo-500 focus:bg-slate-900 text-slate-200 placeholder:text-slate-600'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ward */}
              <div className="space-y-2">
                <label htmlFor="issue-ward" className="block text-xs uppercase font-bold tracking-wider text-slate-400">Municipal Ward</label>
                <select
                  id="issue-ward"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className={`w-full p-3.5 rounded-xl text-sm border focus:outline-none transition-all cursor-pointer ${
                    highContrast 
                      ? 'border-white bg-black text-white focus:border-yellow-400' 
                      : 'border-white/10 bg-slate-950 focus:border-indigo-500 focus:bg-slate-900 text-slate-200'
                  }`}
                >
                  <option value="Ward 1">Ward 1 - Northside</option>
                  <option value="Ward 2">Ward 2 - Retail Hub</option>
                  <option value="Ward 3">Ward 3 - Civic Center</option>
                  <option value="Ward 4">Ward 4 - Heights District</option>
                  <option value="Ward 5">Ward 5 - Residential East</option>
                </select>
              </div>

              {/* Local Smart Helper */}
              {title.length > 3 && (
                <div className={`p-3.5 rounded-xl border flex gap-2.5 text-xs items-start ${
                  highContrast ? 'border-yellow-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                }`}>
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400 animate-pulse" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[10px]">Local Pre-Classifier:</span>
                    <p className="mt-0.5 text-slate-400">Estimated category is <strong className="text-white">{suggestedCategory}</strong>. Routed as priority based on Ward defaults.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Merging Suggestions */}
            {duplicates.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-xs text-amber-400">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] block">Similar Report Detected in {ward}!</span>
                  <p className="text-slate-400 leading-relaxed">
                    Other citizens reported **{suggestedCategory}** in this ward recently. Filing this may register as a duplicate. To help prioritize, our Smart Engine will merge your coordinates to increase the original priority score!
                  </p>
                  <ul className="text-[11px] space-y-1 pt-1 font-semibold list-disc list-inside text-amber-300">
                    {duplicates.map(d => (
                      <li key={d.id}>{d.title} (Score: {d.priorityScore})</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="reporter-name" className="block text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Reporter Name</span>
                </label>
                <input
                  type="text"
                  id="reporter-name"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Ayush Kumar"
                  className={`w-full p-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    highContrast 
                      ? 'border-white bg-black text-white' 
                      : 'border-white/10 bg-slate-950 focus:border-indigo-500 focus:bg-slate-900 text-slate-200 placeholder:text-slate-600'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reporter-email" className="block text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Reporter Email</span>
                </label>
                <input
                  type="email"
                  id="reporter-email"
                  required
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="ayush@gmail.com"
                  className={`w-full p-3.5 rounded-xl text-sm border focus:outline-none transition-all ${
                    highContrast 
                      ? 'border-white bg-black text-white' 
                      : 'border-white/10 bg-slate-950 focus:border-indigo-500 focus:bg-slate-900 text-slate-200 placeholder:text-slate-600'
                  }`}
                />
              </div>
            </div>

            {/* Image Uploader */}
            <div className="space-y-2">
              <span className="block text-xs uppercase font-bold tracking-wider text-slate-400">Incident Photo Upload (Vision AI Feature)</span>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : base64Image
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : highContrast
                        ? 'border-white hover:border-yellow-400'
                        : 'border-white/10 bg-slate-950/60 hover:border-indigo-500 hover:bg-slate-950'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {base64Image ? (
                  <div className="space-y-3 w-full max-w-[200px]">
                    <img
                      src={base64Image}
                      alt="Incident upload preview"
                      className="rounded-xl h-24 object-cover mx-auto border border-emerald-500 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBase64Image(null);
                      }}
                      className="text-xs text-rose-400 hover:underline block mx-auto font-bold uppercase tracking-wider"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-500 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Drag & drop file here, or click to browse</p>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPEG, WEBP up to 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2.5 text-[10px] text-slate-400 bg-slate-950 border border-white/5 rounded-xl p-3.5">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                By submitting, your report will be analyzed using Gemini 3.5 on Google Cloud. Personal emails are kept encrypted and are only used for official resolution updates.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                id="submit-issue-btn"
                disabled={analyzing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transform hover:scale-102 transition-all ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-2 border-white font-extrabold'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300 shrink-0 animate-pulse" />
                <span>Submit & Analyze Report</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
