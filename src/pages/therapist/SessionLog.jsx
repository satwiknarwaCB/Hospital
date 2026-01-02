import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Activity, Frown, Meh, Smile, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { generateSessionSummary } from '../../lib/aiService';
import { useApp } from '../../lib/context';

const SessionLog = () => {
  const { kids, addSession } = useApp();
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(kids && kids[0] ? kids[0].id : '');
  const [engagement, setEngagement] = useState(50);
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState('Neutral');

  // AI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  const availableActivities = [
    "Picture Exchange", "Sound Imitation", "Blocks Stacking", "Sensory Play", "Social Story"
  ];

  const handleGenerateAI = async () => {
    if (activities.length === 0) {
      alert("Please select at least one activity first.");
      return;
    }

    setIsGenerating(true);
    const child = kids.find(c => c.id === selectedChild);

    try {
      const data = {
        childName: child.name,
        activities,
        engagement,
        mood,
        rawNotes: notes
      };

      const result = await generateSessionSummary(data);
      setAiSummary(result);
      // Auto-fill clinical notes if empty
      if (!notes) setNotes(result.clinicalNote);
    } catch (error) {
      console.error("AI Error", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (aiSummary && !isApproved) {
      alert("Please review and approve the AI summary before saving.");
      return;
    }

    addSession({
      childId: selectedChild,
      type: "Therapy Session",
      engagement: parseInt(engagement),
      activities,
      notes,
      aiSummary: aiSummary?.parentSummary,
      wins: aiSummary?.wins,
      mood: mood
    });

    alert("Session Saved & Published to Parent Portal!");
    navigate('/therapist/dashboard');
  };

  const toggleActivity = (activity) => {
    if (activities.includes(activity)) {
      setActivities(activities.filter(a => a !== activity));
    } else {
      setActivities([...activities, activity]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-800">Log New Session</h2>
        <Button variant="ghost" onClick={() => navigate(-1)}><X className="h-6 w-6" /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: INPUTS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinical Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Child Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Patient</label>
              <select
                className="w-full p-2 border border-neutral-200 rounded-lg bg-neutral-50"
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
              >
                {kids.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.diagnosis}</option>
                ))}
              </select>
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
            <Card className="border-2 border-violet-100 bg-violet-50/50">
              <CardHeader className="pb-2 border-b border-violet-100">
                <CardTitle className="flex items-center text-violet-900">
                  <Sparkles className="h-5 w-5 mr-2 text-violet-600" />
                  AI Suggested Outputs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">

                {/* Parent Update */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-violet-500">Parent-Friendly Update</label>
                  <div className="p-4 bg-white rounded-lg border border-violet-100 shadow-sm">
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                      {aiSummary.parentSummary}
                    </p>
                  </div>
                </div>

                {/* Wins */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-violet-500">Identified Wins</label>
                  <div className="flex flex-wrap gap-2">
                    {aiSummary.wins.map((win, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {win}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Approval */}
                <div className="pt-4 border-t border-violet-200">
                  <div
                    className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${isApproved ? 'bg-green-50 border-green-200' : 'bg-white border-neutral-200 hover:border-violet-300'}`}
                    onClick={() => setIsApproved(!isApproved)}
                  >
                    <div className={`h-5 w-5 rounded border flex items-center justify-center mr-3 ${isApproved ? 'bg-green-500 border-green-500 text-white' : 'border-neutral-300'}`}>
                      {isApproved && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">I approve this content</p>
                      <p className="text-xs text-neutral-500">Validates content for encryption & publishing</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={handleSave} disabled={!isApproved}>
                  <Save className="mr-2 h-4 w-4" /> Save & Publish Session
                </Button>

              </CardContent>
            </Card>
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
  );
};

export default SessionLog;
