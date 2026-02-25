import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X, Activity, Frown, Meh, Smile, Sparkles, CheckCircle, Loader2, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generateSessionSummary } from '../../lib/aiService';
import { useApp } from '../../lib/context';
import { THERAPY_TYPES } from '../../data/mockData';
import { sessionAPI } from '../../lib/api';

const SessionLog = () => {
  const { kids, addSession, getChildDocuments, currentUser, refreshSessions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const childIdFromState = location.state?.childId;

  // Filter kids assigned to this therapist or all if admin
  const myKids = kids.filter(k =>
    (k.therapistIds?.length > 0 ? k.therapistIds : (k.therapistId ? [k.therapistId] : [])).includes(currentUser?.id || 't1')
  );

  const [selectedChild, setSelectedChild] = useState(
    childIdFromState || (myKids && myKids[0] ? myKids[0].id : '')
  );

  const baselineDocs = getChildDocuments(selectedChild);

  // Update selected child if passed from navigation
  useEffect(() => {
    if (childIdFromState) {
      setSelectedChild(childIdFromState);
    }
  }, [childIdFromState]);

  const [selectedSessionTypes, setSelectedSessionTypes] = useState(['Speech Therapy']);
  const [engagement, setEngagement] = useState(50);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [mood, setMood] = useState('Neutral');
  const [isUnwell, setIsUnwell] = useState(false);
  const [customTherapyName, setCustomTherapyName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableActivities = [
    "Picture Exchange", "Sound Imitation", "Blocks Stacking", "Sensory Play", "Social Story"
  ];

  const handleGenerateAI = async () => {
    if (activities.length === 0) {
      alert("Please select at least one activity first.");
      return;
    }
    if (selectedSessionTypes.length === 0 && !customTherapyName) {
      alert("Please select at least one therapy type.");
      return;
    }

    setIsGenerating(true);
    const child = kids.find(c => c.id === selectedChild);
    const summaries = {};

    try {
      const typesToProcess = [...selectedSessionTypes];
      if (showCustomInput && customTherapyName) typesToProcess.push(customTherapyName);

      for (const type of typesToProcess) {
        const data = {
          childName: child?.name || 'Unknown',
          activities,
          engagement,
          mood,
          isUnwell,
          healthStatus,
          therapyType: type,
          rawNotes: notes
        };
        const result = await generateSessionSummary(data);
        summaries[type] = result;
      }

      setAiSummary(summaries);
      // Auto-fill clinical notes from the first summary if empty
      const firstType = Object.keys(summaries)[0];
      if (!notes && firstType) setNotes(summaries[firstType].clinicalNote);
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (aiSummary && !isApproved) {
      alert("Please review and approve the AI summaries before saving.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Initiating Multi-Fork Session Publish...');
      const typesToSave = Object.keys(aiSummary || {});
      const originalSessionId = location.state?.sessionId;
      const originalDate = location.state?.sessionDate;
      const originalDuration = location.state?.sessionDuration || 45;

      for (const type of typesToSave) {
        const summary = aiSummary[type];
        const sessionData = {
          childId: selectedChild,
          type: type,
          engagement: parseInt(engagement),
          activities,
          notes,
          healthStatus,
          aiSummary: summary.parentSummary,
          measurableOutcomes: summary.measurableOutcomes,
          nonMeasurableOutcomes: summary.nonMeasurableOutcomes,
          wins: summary.wins,
          emotionalState: mood,
          status: 'completed',
          duration: Math.floor(originalDuration / typesToSave.length), // Split original duration
          date: originalDate || new Date().toISOString() // Keep original date!
        };

        const savedSession = await sessionAPI.create(sessionData);

        // Add to context (which replaces locally if replaceId exists)
        addSession({
          ...sessionData,
          id: savedSession.id || savedSession._id
        }, originalSessionId);
      }

      // 🧹 Database Cleanup - Remove the scheduled placeholder from MongoDB
      if (originalSessionId) {
        console.log(`🧹 Cleaning up original session ${originalSessionId} from database...`);
        try {
          await sessionAPI.delete(originalSessionId);
          console.log('✅ Original placeholder removed successfully');
        } catch (delErr) {
          console.error('⚠️ Failed to delete original placeholder from database', delErr);
        }
      }

      // 🏁 Final Synchronization
      console.log('🔄 Triggering global session refresh...');
      await refreshSessions();


      alert(`🎉 Successfully published ${typesToSave.length} clinical records to MongoDB!`);
      navigate('/therapist/command-center');
    } catch (error) {


      console.error('❌ Failed to Save Session:', error);
      const errorMsg = typeof error === 'object'
        ? (error.detail || JSON.stringify(error))
        : error;
      alert(`Critical Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivity = (activity) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter(a => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-100px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        <header className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 py-2">
          <div>
            <h2 className="text-2xl font-black text-neutral-800 tracking-tight">Session Intelligence Log</h2>
            <p className="text-neutral-500">Document therapy progress with dual-output AI assistance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)} className="font-bold">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading} className="font-black bg-primary-600 shadow-lg shadow-primary-200">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Session
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: INPUTS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Child Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Child</label>
                <select
                  className="w-full p-2 border border-neutral-200 rounded-lg bg-white text-neutral-900"
                  style={{ color: '#171717', backgroundColor: '#ffffff' }}
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                >
                  <option value="" disabled className="text-neutral-400" style={{ color: '#a3a3a3' }}>Select a child</option>
                  {myKids.map(c => (
                    <option key={c.id} value={c.id} className="text-neutral-900" style={{ color: '#171717' }}>
                      {c.name} - {c.diagnosis}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health Status Toggle */}
              <div className={`p-4 rounded-2xl border-2 transition-all ${isUnwell ? 'bg-orange-50 border-orange-200 shadow-inner' : 'bg-green-50/30 border-green-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isUnwell ? 'bg-orange-100' : 'bg-green-100'}`}>
                      <Activity className={`h-4 w-4 ${isUnwell ? 'text-orange-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isUnwell ? 'text-orange-800' : 'text-green-800'}`}>Session Context</h4>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold">Child Health Status</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUnwell(!isUnwell)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isUnwell
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white text-green-600 border border-green-200'
                      }`}
                  >
                    {isUnwell ? 'Under the Weather' : 'Fit for Therapy'}
                  </button>
                </div>
                {isUnwell && (
                  <p className="text-[11px] text-orange-600 font-bold mt-2 animate-pulse">
                    ⚠️ AI report will prioritize Comfort & Regulation over Mastery.
                  </p>
                )}
              </div>

              {/* Session Type Multi-Select */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-neutral-700 block">Focus Disciplines (Multi-Select)</label>
                <div className="grid grid-cols-2 gap-2">
                  {THERAPY_TYPES.map(therapy => (
                    <button
                      key={therapy.id}
                      onClick={() => {
                        if (selectedSessionTypes.includes(therapy.name)) {
                          setSelectedSessionTypes(selectedSessionTypes.filter(t => t !== therapy.name));
                        } else {
                          setSelectedSessionTypes([...selectedSessionTypes, therapy.name]);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all border-2 ${selectedSessionTypes.includes(therapy.name)
                        ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm'
                        : 'bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200'
                        }`}
                    >
                      <span className="text-base">{therapy.icon}</span>
                      <span className="flex-1">{therapy.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all border-2 ${showCustomInput
                      ? 'bg-violet-50 border-violet-500 text-violet-700 shadow-sm'
                      : 'bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200'
                      }`}
                  >
                    <span className="text-base">➕</span>
                    <span className="flex-1">Custom Type</span>
                  </button>
                </div>

                {showCustomInput && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                    <input
                      type="text"
                      placeholder="e.g., Hydrotherapy, Counseling..."
                      className="w-full p-2.5 border-2 border-violet-100 rounded-xl bg-white text-sm focus:border-violet-300 outline-none placeholder:text-neutral-300"
                      value={customTherapyName}
                      onChange={(e) => setCustomTherapyName(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Activities Performed</label>
                <div className="flex flex-wrap gap-2">
                  {availableActivities.map(act => (
                    <button
                      key={act}
                      onClick={() => toggleActivity(act)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activities.includes(act)
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              {/* Engagement Slider */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-neutral-700">Engagement Level</label>
                  <span className="font-bold text-primary-600">{engagement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={engagement}
                  onChange={(e) => setEngagement(e.target.value)}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Emotional Regulation */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Emotional State</label>
                <div className="flex gap-4">
                  {['Dysregulated', 'Neutral', 'Regulated'].map((state, idx) => (
                    <div
                      key={state}
                      onClick={() => setMood(state)}
                      className={`flex flex-col items-center cursor-pointer group p-2 rounded-lg transition-colors ${mood === state ? 'bg-primary-50 ring-2 ring-primary-200' : ''}`}
                    >
                      <div className="h-8 w-8 rounded-full flex items-center justify-center">
                        {state === 'Dysregulated' && <Frown className={`h-6 w-6 ${mood === state ? 'text-red-500' : 'text-neutral-400'}`} />}
                        {state === 'Neutral' && <Meh className={`h-6 w-6 ${mood === state ? 'text-yellow-500' : 'text-neutral-400'}`} />}
                        {state === 'Regulated' && <Smile className={`h-6 w-6 ${mood === state ? 'text-green-500' : 'text-neutral-400'}`} />}
                      </div>
                      <span className="text-xs mt-1 text-neutral-500">{state}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Clinical Notes (Optional)</label>
                <textarea
                  className="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:outline-none min-h-[100px] text-sm"
                  placeholder="Observed behaviors, milestones met, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Health Condition */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Health Condition / Physical Observations</label>
                <textarea
                  className="w-full p-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:outline-none min-h-[80px] text-sm bg-neutral-50"
                  placeholder="Example: Slight cough, low energy, skin rashes, seating discomfort..."
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
              >
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Session...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate AI Report</>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* RIGHT COLUMN: AI OUTPUT */}
          <div className="space-y-6">
            {aiSummary ? (
              <div className="space-y-6">
                {Object.entries(aiSummary).map(([type, summary], idx) => (
                  <Card key={type} className={`border-2 ${idx === 0 ? 'border-violet-200 bg-violet-50/50' : 'border-neutral-200 bg-neutral-50/30'}`}>
                    <CardHeader className="pb-2 border-b border-neutral-100">
                      <CardTitle className="flex items-center text-sm font-black uppercase tracking-wider text-neutral-800">
                        <Sparkles className="h-4 w-4 mr-2 text-violet-600" />
                        {type} Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">

                      {/* Parent Update */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Parent Summary (Draft)</label>
                        <div className="p-4 bg-white rounded-xl border border-neutral-100 shadow-sm">
                          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed italic">
                            "{summary.parentSummary}"
                          </p>
                        </div>
                      </div>

                      {/* Measurable vs Non-measurable */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary-500">Measurable Outcomes</label>
                          <div className="space-y-2">
                            {summary.measurableOutcomes?.map((m, i) => (
                              <input
                                key={i}
                                className="w-full p-2 text-xs border border-neutral-100 rounded-lg bg-white focus:border-primary-200 outline-none"
                                value={m}
                                onChange={(e) => {
                                  const newOutcomes = [...summary.measurableOutcomes];
                                  newOutcomes[i] = e.target.value;
                                  setAiSummary({
                                    ...aiSummary,
                                    [type]: { ...summary, measurableOutcomes: newOutcomes }
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-green-500">Non-Measurable Wins</label>
                          <div className="space-y-2">
                            {summary.nonMeasurableOutcomes?.map((nm, i) => (
                              <input
                                key={i}
                                className="w-full p-2 text-xs border border-neutral-100 rounded-lg bg-white focus:border-green-200 outline-none"
                                value={nm}
                                onChange={(e) => {
                                  const newOutcomes = [...summary.nonMeasurableOutcomes];
                                  newOutcomes[i] = e.target.value;
                                  setAiSummary({
                                    ...aiSummary,
                                    [type]: { ...summary, nonMeasurableOutcomes: newOutcomes }
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Universal Approval & Save */}
                <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-none shadow-xl overflow-hidden">
                  <CardContent className="p-6">
                    <div
                      className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${isApproved ? 'bg-success-600/20 border-success-500' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                      onClick={() => setIsApproved(!isApproved)}
                    >
                      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center mr-4 ${isApproved ? 'bg-success-500 border-success-500 text-white' : 'border-white/20'}`}>
                        {isApproved && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">Approve All Records</p>
                        <p className="text-[10px] text-neutral-400">This will fork the data into {Object.keys(aiSummary).length} separate clinical sessions for the Parent Portal.</p>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6 h-12 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20"
                      onClick={handleSave}
                      disabled={!isApproved || isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing Records...</>
                      ) : (
                        <><Save className="mr-2 h-5 w-5" /> Save & Fork to Parent Portal</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400">
                <Sparkles className="h-12 w-12 mb-4 text-neutral-300" />
                <p className="text-center font-medium">AI Insights Area</p>
                <p className="text-center text-sm mt-2 max-w-xs">Fill in clinical inputs and click "Generate" to see the magic happen.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Baseline Context Sidebar */}
      <aside className="w-full lg:w-80 space-y-4 h-fit sticky top-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-violet-600 text-white p-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Clinical Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Baseline Documents</p>
              <div className="space-y-2">
                {baselineDocs.length > 0 ? baselineDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-neutral-800 truncate pr-2">{doc.title}</p>
                      <ExternalLink className="h-3 w-3 text-neutral-300 group-hover:text-primary-600" />
                    </div>
                    <p className="text-[9px] text-neutral-400">Added on {new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <p className="text-xs text-neutral-400 italic">No baseline documents found.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Initial Goals (Jan 2025)</p>
              <ul className="space-y-1.5">
                {[
                  "Maintain eye contact for 5s",
                  "Use 2-word combinations",
                  "Reduce tactile defensiveness"
                ].map((goal, i) => (
                  <li key={i} className="text-[11px] text-neutral-600 flex gap-2">
                    <span className="text-violet-500 font-black">•</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 border-dashed">
              <p className="text-[10px] font-black text-primary-700 uppercase tracking-tight mb-1">💡 Clinical Tip</p>
              <p className="text-[10px] text-primary-600 leading-relaxed italic">
                Reference the initial assessment to track progress against core deficits.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

export default SessionLog;
