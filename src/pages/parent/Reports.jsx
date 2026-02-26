// ============================================================
// NeuroBridge™ - Parent Portal: Clinical Reports
// Secure View of Intake, Medical, and Assessment Reports
// ============================================================

import React, { useState } from 'react';
import {
    FileText,
    Download,
    ShieldCheck,
    Clock,
    Lock,
    Eye,
    X,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

const Reports = () => {
    const { currentUser, childDocuments, kids, addNotification } = useApp();
    const [viewingDoc, setViewingDoc] = useState(null);

    // Get the child for this parent
    const child = kids.find(k => k.id === currentUser?.childId);

    // Filter documents for this specific child
    const reports = childDocuments.filter(doc => doc.childId === child?.id);

    // Handle viewing a document in overlay
    const handleViewDocument = (doc) => {
        if (!doc.url || doc.url === '#') {
            addNotification({
                type: 'error',
                title: 'View Failed',
                message: 'This document has no viewable content yet. Please ask your therapist to upload it.'
            });
            return;
        }
        setViewingDoc(doc);
    };

    // Handle downloading a document
    const handleDownloadDocument = (doc) => {
        if (!doc.url || doc.url === '#') {
            addNotification({
                type: 'error',
                title: 'Download Failed',
                message: 'This document has no downloadable file attached yet.'
            });
            return;
        }

        // Handle Data URLs by converting to Blob
        if (doc.url.startsWith('data:')) {
            try {
                const parts = doc.url.split(',');
                const type = parts[0].split(':')[1].split(';')[0];
                const base64 = parts[1];
                const binary = atob(base64);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([array], { type });
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `${doc.title || 'report'}.${doc.format || 'pdf'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            } catch (e) {
                console.error('Error downloading data URL:', e);
            }
        } else if (doc.url.startsWith('blob:')) {
            // Blob URLs from file uploads
            const a = document.createElement('a');
            a.href = doc.url;
            a.download = `${doc.title || 'report'}.${doc.format || 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Regular URLs
            const a = document.createElement('a');
            a.href = doc.url;
            a.download = `${doc.title || 'report'}.${doc.format || 'pdf'}`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        addNotification({
            type: 'success',
            title: 'Download Started',
            message: `Downloading "${doc.title}"...`
        });
    };

    // Open document in a new browser tab
    const handleOpenInNewTab = (doc) => {
        if (!doc.url || doc.url === '#') return;

        if (doc.url.startsWith('data:')) {
            try {
                const parts = doc.url.split(',');
                const type = parts[0].split(':')[1].split(';')[0];
                const base64 = parts[1];
                const binary = atob(base64);
                const array = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    array[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([array], { type });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } catch (e) {
                window.open(doc.url, '_blank');
            }
        } else {
            window.open(doc.url, '_blank');
        }
    };

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
                                        {/* Eye Icon - View Report */}
                                        <Button
                                            variant="outline"
                                            className="h-10 w-10 p-0 rounded-xl border-neutral-200 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-all"
                                            title="View Report"
                                            onClick={() => handleViewDocument(doc)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        {/* Download Button */}
                                        <Button
                                            variant="outline"
                                            className="h-10 px-4 rounded-xl border-neutral-200 hover:border-primary-500 hover:text-primary-600 gap-2 transition-all"
                                            onClick={() => handleDownloadDocument(doc)}
                                        >
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

            {/* Document Viewer Overlay */}
            {viewingDoc && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Overlay Header */}
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-neutral-800 tracking-tight">{viewingDoc.title}</h3>
                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                        {viewingDoc.category || 'Clinical'} • {viewingDoc.fileSize} • Uploaded by {viewingDoc.uploadedBy}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingDoc(null)}
                                className="h-10 w-10 bg-neutral-100 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-500" />
                            </button>
                        </div>

                        {/* Document Preview */}
                        <div className="flex-1 overflow-hidden bg-neutral-50 min-h-[400px]">
                            {viewingDoc.url && viewingDoc.url !== '#' ? (
                                <iframe
                                    src={viewingDoc.url}
                                    className="w-full h-full min-h-[400px]"
                                    title={viewingDoc.title}
                                    style={{ border: 'none' }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-neutral-400">
                                    <FileText className="h-16 w-16 mb-4 opacity-30" />
                                    <p className="font-bold text-lg">No Preview Available</p>
                                    <p className="text-sm mt-1">The therapist has not attached a viewable file yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Overlay Footer */}
                        <div className="p-6 border-t border-neutral-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                <ShieldCheck className="h-4 w-4" />
                                ENCRYPTED DOCUMENT
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-xl gap-2 font-bold border-neutral-200"
                                    onClick={() => handleOpenInNewTab(viewingDoc)}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Open in New Tab
                                </Button>
                                <Button
                                    className="rounded-xl gap-2 font-bold bg-neutral-900 hover:bg-black text-white"
                                    onClick={() => handleDownloadDocument(viewingDoc)}
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
