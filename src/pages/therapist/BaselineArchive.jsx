import React, { useState, useMemo, useRef } from 'react';
import {
    FileText,
    Search,
    Upload,
    Download,
    Eye,
    CheckCircle2,
    Calendar,
    Baby
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../lib/context';

const BaselineArchive = () => {
    const { kids, childDocuments, addDocument, addNotification, currentUser } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChild, setSelectedChild] = useState('All');
    const fileInputRef = useRef(null);

    const filteredDocuments = useMemo(() => {
        const safeDocs = Array.isArray(childDocuments) ? childDocuments : [];
        return safeDocs.filter(doc => {
            if (!doc) return false;
            const matchesSearch = (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesChild = selectedChild === 'All' || doc.childId === selectedChild;
            return matchesSearch && matchesChild;
        });
    }, [childDocuments, searchQuery, selectedChild]);

    const handleUploadClick = () => {
        if (selectedChild === 'All') {
            addNotification({
                type: 'error',
                title: 'Patient Required',
                message: 'Please select a child profile first from the dropdown.'
            });
            return;
        }
        fileInputRef.current.click();
    };

    const handleViewDocument = (doc) => {
        if (!doc.url || doc.url === '#') {
            addNotification({
                type: 'error',
                title: 'View Failed',
                message: 'This document has no viewable content.'
            });
            return;
        }

        // Handle Data URLs by converting to Blob to prevent blank pages
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
                console.error('Error opening data URL:', e);
                window.open(doc.url, '_blank');
            }
        } else {
            window.open(doc.url, '_blank');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const child = kids.find(k => k.id === selectedChild);

        addDocument({
            childId: selectedChild,
            title: file.name.replace(/\.[^/.]+$/, ""),
            category: 'Baseline',
            format: file.type.split('/')[1] || 'pdf',
            uploadedBy: currentUser?.name || 'Therapist',
            fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            url: URL.createObjectURL(file)
        });

        addNotification({
            type: 'success',
            title: 'Digital Archive Updated',
            message: `Successfully uploaded ${file.name} to ${child?.name}'s clinical vault.`
        });

        event.target.value = null;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.png"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-800 tracking-tight flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary-600" />
                        Clinical Repository
                    </h2>
                    <p className="text-sm text-neutral-500">Manage all intake reports and clinical assessments in one secure place.</p>
                </div>
                <Button onClick={handleUploadClick} className="bg-primary-600 hover:bg-primary-700 font-bold px-6 h-11 shadow-lg shadow-primary-200 gap-2 transition-all active:scale-95">
                    <Upload className="h-4 w-4" /> Select Real File
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by report name..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-1 shadow-sm">
                    <Baby className="h-4 w-4 text-neutral-400" />
                    <select
                        className="bg-transparent text-sm font-bold text-neutral-700 outline-none min-w-[150px]"
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                    >
                        <option value="All">All Children</option>
                        {(Array.isArray(kids) ? kids : []).map(k => <option key={k?.id} value={k?.id}>{k?.name || 'Unnamed'}</option>)}
                    </select>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-neutral-50 border-b border-neutral-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Report Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Patient</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Date Added</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {filteredDocuments.length > 0 ? filteredDocuments.map(doc => {
                                    const child = (Array.isArray(kids) ? kids : []).find(k => k.id === doc.childId);
                                    return (
                                        <tr
                                            key={doc.id}
                                            onClick={() => handleViewDocument(doc)}
                                            className={`hover:bg-neutral-50/50 transition-colors group ${doc.url && doc.url !== '#' ? 'cursor-pointer' : 'cursor-default'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-800 text-sm leading-tight">{doc.title || 'Untitled Report'}</p>
                                                        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">
                                                            {doc.fileSize || 'Unknown Size'} • {doc.format?.toUpperCase() || 'PDF'}
                                                            {doc.url?.startsWith('blob:') && <span className="ml-2 text-green-500 font-bold">• New Upload</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {child?.photoUrl ? (
                                                        <img src={child.photoUrl} className="h-6 w-6 rounded-full border border-neutral-100" alt="" />
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center"><Baby className="h-3 w-3 text-neutral-400" /></div>
                                                    )}
                                                    <span className="text-sm font-semibold text-neutral-600">{child?.name || 'Unknown Patient'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
                                                    <Calendar className="h-3.5 w-3.5 opacity-40" />
                                                    {doc.date ? new Date(doc.date).toLocaleDateString() : 'Unknown Date'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    {doc.url && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-neutral-400 hover:text-primary-600"
                                                                title="View Report"
                                                                onClick={(e) => { e.stopPropagation(); handleViewDocument(doc); }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <a href={doc.url} download={doc.title} onClick={(e) => e.stopPropagation()}>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-neutral-400 hover:text-secondary-600" title="Download">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-neutral-50 rounded-full mb-4">
                                                    <Search className="h-8 w-8 text-neutral-200" />
                                                </div>
                                                <h3 className="font-black text-neutral-800 tracking-tight">Empty Repository</h3>
                                                <p className="text-sm text-neutral-400 mt-1 max-w-[200px] mx-auto">Upload the child's joining documents to start their digital dossier.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] pt-4">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                HIPAA & SOC2 Compliant Cloud Storage
            </div>
        </div>
    );
};

export default BaselineArchive;
