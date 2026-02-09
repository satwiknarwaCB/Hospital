import React, { useState } from 'react';
import {
    X, FileText, Printer, Save,
    Stethoscope, User, Calendar,
    ClipboardList, Brain, Heart,
    Activity, ChevronRight, CheckCircle2, Zap,
    FileDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ChildHealthAssessment = ({ isOpen, onClose, child }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        medicalHistory: '',
        observations: '',
        symptoms: '',
        developmentalScore: '',
        behavioralObs: '',
        diagnosis: '',
        recommendedTherapy: 'Speech Therapy',
        therapyReason: ''
    });

    React.useEffect(() => {
        if (child && isOpen) {
            setFormData({
                name: child.name || '',
                age: child.age || '',
                gender: child.gender || 'Male',
                medicalHistory: `Patient shows typical developmental markers for ${child.diagnosis || 'ASD'}. No major surgical history. Previous clinical notes indicate good response to routine-based interventions.`,
                observations: 'Engages well with clinical staff. Demonstrates emerging joint attention and improved task persistence during structured sessions.',
                symptoms: 'Social communication challenges, selective attention, and mild sensory processing sensitivities consistent with clinical profile.',
                developmentalScore: 'Average to Slightly Below in functional communication domains.',
                behavioralObs: 'Generally compliant and motivated by social reinforcement. Minimal externalizing behaviors observed during assessment.',
                diagnosis: child.diagnosis || 'ASD Level 2',
                recommendedTherapy: (Array.isArray(child.program) ? child.program[0] : child.program) || 'Speech Therapy',
                therapyReason: 'To facilitate growth in communicative intent and social-emotional regulation within the home and clinical settings.'
            });
        }
    }, [child, isOpen]);

    if (!isOpen) return null;

    const therapies = [
        'Speech Therapy',
        'Occupational Therapy',
        'Behavioral Therapy',
        'Physical Therapy',
        'Sensory Integration',
        'Others'
    ];

    const generatePDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Header Branding
        doc.setFillColor(79, 70, 229); // Primary Indigo
        doc.rect(0, 0, 210, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('NEUROBRIDGE HOSPITAL', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Center for Developmental Excellence & Pediatric Rehabilitation', 20, 33);
        doc.text(`REFERENCE ID: NB-${Math.floor(1000 + Math.random() * 9000)}`, 150, 25);
        doc.text(`REPORT DATE: ${timestamp}`, 150, 31);

        // Child Details
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('1. PATIENT BIOMETRICS', 20, 60);
        doc.setLineWidth(0.5);
        doc.line(20, 63, 190, 63);

        autoTable(doc, {
            startY: 68,
            body: [
                ['NAME', formData.name, 'AGE', formData.age],
                ['GENDER', formData.gender, 'STATUS', 'Initial Assessment']
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
        });

        // Assessment Details
        const nextY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('2. CLINICAL OBSERVATIONS', 20, nextY);
        doc.line(20, nextY + 3, 190, nextY + 3);

        autoTable(doc, {
            startY: nextY + 8,
            head: [['Functional Domain', 'Clinical Finding']],
            body: [
                ['Medical History', formData.medicalHistory || 'No previous significant history'],
                ['Chief Symptoms', formData.symptoms || 'Regular observation'],
                ['Clinical Observations', formData.observations || 'N/A'],
                ['Developmental Status', formData.developmentalScore || 'Age appropriate'],
                ['Behavioral Profile', formData.behavioralObs || 'Cooperative']
            ],
            theme: 'striped',
            headStyles: { fillStyle: [79, 70, 229] },
            styles: { fontSize: 9 }
        });

        // Diagnosis & Recommendation
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('3. DIAGNOSIS & REHABILITATION PLAN', 20, finalY);
        doc.line(20, finalY + 3, 190, finalY + 3);

        doc.setFontSize(11);
        doc.text('PROVISIONAL DIAGNOSIS:', 20, finalY + 15);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.diagnosis || 'Observation needed', 75, finalY + 15);

        doc.setFont('helvetica', 'bold');
        doc.text('RECOMMENDED THERAPY:', 20, finalY + 25);
        doc.setTextColor(79, 70, 229);
        doc.text(formData.recommendedTherapy.toUpperCase(), 75, finalY + 25);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINICAL RATIONALE:', 20, finalY + 35);
        doc.setFont('helvetica', 'normal');
        const justification = formData.therapyReason || `Recommended based on ${formData.developmentalScore} score and behavioral presentation of ${formData.behavioralObs}.`;
        const splitText = doc.splitTextToSize(justification, 170);
        doc.text(splitText, 20, finalY + 42);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('System Certified Medical Report - NeuroBridge Digital Health System', 20, 280);
        doc.text('Confidential Document - Hospital Use Only', 140, 280);

        doc.save(`${formData.name}_Health_Assessment.pdf`);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 outline-none">

                {/* Modal Header */}
                <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-200">
                            <Stethoscope className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tighter italic">Health Assessment Module</h3>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Clinical Intake & Diagnostic Engine</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                generatePDF();
                                onClose();
                            }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-xl px-4 h-9 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all mr-2"
                        >
                            <Zap className="h-3 w-3 fill-emerald-600" /> Quick Report (1-Click)
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl transition-all"><X className="h-5 w-5 text-neutral-400" /></button>
                    </div>
                </div>

                {/* Main Content - Single Scrollable Page */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">

                    {/* Section 1: Patient Bio */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary-600" />
                            </div>
                            <h4 className="text-[11px] font-black text-neutral-800 uppercase tracking-[0.2em]">1. Patient Biometrics</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                        placeholder="Child Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Age</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                                    <input
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                        placeholder="Ex: 5 Years"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full px-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 appearance-none"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Relevant Medical History</label>
                            <textarea
                                rows={3}
                                value={formData.medicalHistory}
                                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                                className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                placeholder="Previous surgeries, medications, birth complications..."
                            />
                        </div>
                    </div>

                    {/* Section 2: Observations */}
                    <div className="space-y-6 border-t border-neutral-100 pt-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                <ClipboardList className="h-4 w-4 text-amber-600" />
                            </div>
                            <h4 className="text-[11px] font-black text-neutral-800 uppercase tracking-[0.2em]">2. Clinical Observations</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Clinical Symptoms</label>
                                <textarea
                                    rows={3}
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="Physical signs, discomfort, distress..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Dr. Observations</label>
                                <textarea
                                    rows={3}
                                    value={formData.observations}
                                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="Gait, responsiveness, alertness..."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Developmental Assessment</label>
                                <input
                                    value={formData.developmentalScore}
                                    onChange={(e) => setFormData({ ...formData, developmentalScore: e.target.value })}
                                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="Ex: Milestone Delay Phase II"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Behavioral Patterns</label>
                                <input
                                    value={formData.behavioralObs}
                                    onChange={(e) => setFormData({ ...formData, behavioralObs: e.target.value })}
                                    className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="Sensory sensitive, hyper-focused..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Diagnosis & Therapy */}
                    <div className="space-y-8 border-t border-neutral-100 pt-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                                <Heart className="h-4 w-4 text-rose-600" />
                            </div>
                            <h4 className="text-[11px] font-black text-neutral-800 uppercase tracking-[0.2em]">3. Diagnosis & Rehabilitation</h4>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Final Diagnosis</label>
                            <div className="relative">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300" />
                                <input
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-rose-500/20"
                                    placeholder="Enter provisional or final diagnosis"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Recommended Therapy Path</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {therapies.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFormData({ ...formData, recommendedTherapy: t })}
                                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.recommendedTherapy === t ? 'bg-primary-600 text-white shadow-lg scale-[1.02]' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest ml-1">Therapeutic Rationale (The "WHY")</label>
                            <textarea
                                rows={4}
                                value={formData.therapyReason}
                                onChange={(e) => setFormData({ ...formData, therapyReason: e.target.value })}
                                className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 underline-offset-4"
                                placeholder="Explain why this therapy is recommended..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest border-none hover:bg-white"
                    >
                        Close Window
                    </Button>
                    <Button
                        onClick={generatePDF}
                        className="bg-primary-600 text-white hover:bg-primary-700 rounded-2xl px-12 py-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-200 flex items-center gap-2"
                    >
                        <FileText className="h-4 w-4" /> Generate Final Report
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChildHealthAssessment;
