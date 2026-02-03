// ============================================================
// NeuroBridge™ - Parent Portal: Clinical Reports
// Secure View of Intake, Medical, and Assessment Reports
// ============================================================

import React from 'react';
import {
    FileText,
    Download,
    ShieldCheck,
    Clock,
    Lock,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

const Reports = () => {
    const { currentUser, childDocuments, kids } = useApp();

    // Get the child for this parent
    const child = kids.find(k => k.id === currentUser?.childId);

    // Filter documents for this specific child
    const reports = childDocuments.filter(doc => doc.childId === child?.id);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-800 tracking-tight">Clinical Reports</h2>
                    <p className="text-sm text-neutral-500">Official assessments and intake documents for {child?.name || 'your child'}.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
            </header>

            {/* Reports List */}
            <div className="space-y-4">
                {reports.length > 0 ? (
                    reports.map((doc) => (
                        <Card key={doc.id} className="group hover:shadow-lg transition-all border-none bg-white shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 flex items-center gap-4">
                                    <div className="h-14 w-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                        <FileText className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {doc.category || 'Clinical'}
                                            </span>
                                            <span className="text-[10px] font-bold text-neutral-400">• {doc.fileSize}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-neutral-800 truncate leading-tight">
                                            {doc.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-neutral-400 text-xs font-medium">
                                            <Clock className="h-3.5 w-3.5" />
                                            Added on {new Date(doc.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="h-10 px-4 rounded-xl border-neutral-200 hover:border-primary-500 hover:text-primary-600 gap-2">
                                            <Download className="h-4 w-4" />
                                            <span className="hidden sm:inline">Download</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="px-6 py-2 bg-neutral-50 flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                    <span>Verified by {doc.uploadedBy}</span>
                                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Digital Vault ID: {doc.id}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-neutral-100 italic text-neutral-400">
                        No official reports have been uploaded yet.
                    </div>
                )}
            </div>

            {/* Security Notice */}
            <div className="bg-primary-50/50 p-6 rounded-3xl border border-primary-100/50 flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-primary-600">
                    <Lock className="h-6 w-6" />
                </div>
                <div>
                    <h5 className="font-black text-primary-900 leading-tight">Your Privacy is Our Priority</h5>
                    <p className="text-xs text-primary-700/70 mt-1 leading-relaxed">
                        These reports contain sensitive developmental data. Access is restricted to you and your child's assigned clinical team.
                        If you notice any discrepancies, please contact your therapist immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
