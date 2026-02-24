import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, Bell, MessageSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useApp } from '../../lib/context';
import ProfileEditModal from './ProfileEditModal';
import { parentAuthAPI, doctorAuthAPI } from '../../lib/api';

const DashboardLayout = ({ children, title, sidebarItems, roleColor = "bg-primary-700", onLogout }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const location = useLocation();
    const { notifications, removeNotification, currentUser, addDocument } = useApp();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            window.location.href = '/';
        }
    };

    const handleProfileSave = async (updatedData) => {
        try {
            // Determine user role and update accordingly
            // Remove large fields like document and avatar before storing in localStorage
            // We keep the full updatedData for the API call, but sanitize for local storage
            // We keep the full updatedData for the API call, but include basic fields for local storage
            const { document, documentName, ...sanitizedData } = updatedData;

            if (currentUser?.role === 'parent') {
                const parentToken = localStorage.getItem('parent_token');
                if (parentToken) {
                    // Update parent profile via API
                    try {
                        const freshProfile = await parentAuthAPI.updateProfile(updatedData);
                        // Update localStorage with fresh data from server
                        localStorage.setItem('parent_data', JSON.stringify(freshProfile));
                    } catch (apiError) {
                        console.warn('Backend update failed, saving locally only:', apiError);
                        // Update localStorage with sanitized local data
                        const updatedUser = { ...currentUser, ...sanitizedData };
                        localStorage.setItem('parent_data', JSON.stringify(updatedUser));
                    }

                    // Link document to child if uploaded
                    if (updatedData.document && updatedData.documentName && currentUser.childId) {
                        addDocument({
                            childId: currentUser.childId,
                            title: updatedData.documentName,
                            type: 'Parent Upload',
                            category: 'Parent Documents',
                            format: updatedData.documentName.split('.').pop() || 'pdf',
                            uploadedBy: currentUser.name,
                            fileSize: 'Managed via Profile',
                            url: updatedData.document
                        });
                    }

                    // Trigger auth-change event to refresh context
                    window.dispatchEvent(new Event('auth-change'));
                }
            } else if (currentUser?.role === 'therapist' || currentUser?.role === 'doctor') {
                const doctorToken = localStorage.getItem('doctor_token');
                if (doctorToken) {
                    // Update doctor/therapist profile via API
                    try {
                        const freshProfile = await doctorAuthAPI.updateProfile(updatedData);
                        // Update localStorage with fresh data from server
                        localStorage.setItem('doctor_data', JSON.stringify(freshProfile));
                    } catch (apiError) {
                        console.warn('Backend update failed, saving locally only:', apiError);
                        // Update localStorage with sanitized local data
                        const updatedUser = { ...currentUser, ...sanitizedData };
                        try {
                            localStorage.setItem('doctor_data', JSON.stringify(updatedUser));
                        } catch (e) {
                            console.warn('Local storage full, skipping doctor_data update');
                        }
                    }
                    window.dispatchEvent(new Event('auth-change'));
                }
            } else if (currentUser?.role === 'admin') {
                const adminToken = localStorage.getItem('admin_token');
                if (adminToken) {
                    // Update admin profile
                    const updatedUser = { ...currentUser, ...sanitizedData };
                    try {
                        localStorage.setItem('admin_data', JSON.stringify(updatedUser));
                    } catch (e) {
                        console.warn('Local storage full, skipping admin_data update');
                    }
                    window.dispatchEvent(new Event('auth-change'));
                }
            }

            alert('✅ Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Only throw if it's not a handled API error
            if (error.name !== 'AxiosError' || error.code !== 'ERR_NETWORK') {
                throw error;
            }
            alert('⚠️ Profile saved locally (Server connection lost)');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out bg-white border-r border-neutral-200 shadow-2xl lg:shadow-none flex flex-col",
                    !isSidebarOpen && "-translate-x-full",
                    "lg:relative lg:translate-x-0"
                )}
            >
                <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-100 shrink-0">
                    <img src="/logo.svg" alt="NeuroBridge Logo" className="h-8 w-8" />
                    <span className="text-xl font-bold text-primary-900 font-serif tracking-tight">NeuroBridge™</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-neutral-400 hover:text-neutral-600 ml-auto"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const roleColorText = roleColor ? roleColor.replace('bg-', 'text-') : 'text-primary-600';
                        const roleColorBg = roleColor ? roleColor.replace(/-\d+$/, '-50') : 'bg-primary-50';

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? `${roleColorBg} ${roleColorText} shadow-sm border border-neutral-100`
                                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent"
                                )}
                            >
                                {item.icon && (
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 transition-colors",
                                            isActive ? roleColorText : "text-neutral-400 group-hover:text-neutral-600"
                                        )}
                                    />
                                )}
                                <span className="flex-1">{item.label}</span>
                                {item.badge > 0 && (
                                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-primary-500 text-white rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-100 shrink-0">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* Header */}
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden hover:bg-neutral-50 rounded-xl"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-neutral-600" />
                        </Button>
                        <h2 className="text-lg font-bold text-neutral-800 tracking-tight">{title}</h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* User Profile Avatar */}
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="group relative"
                            title="Edit Profile"
                        >
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-neutral-200 group-hover:border-primary-500 transition-all shadow-md group-hover:shadow-lg">
                                {currentUser?.avatar ? (
                                    <img
                                        src={currentUser.avatar}
                                        alt={currentUser.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-auto relative">
                    {children || <Outlet />}

                    {/* Global Notifications Toast Stack */}
                    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-sm w-full">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={cn(
                                    "bg-white rounded-xl shadow-2xl border-l-4 p-4 flex gap-4 items-start animate-in slide-in-from-right duration-300",
                                    notif.type === 'success' ? 'border-l-green-500' :
                                        notif.type === 'error' ? 'border-l-red-500' : 'border-l-primary-500'
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    notif.type === 'success' ? 'bg-green-50 text-green-600' :
                                        notif.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                                )}>
                                    {notif.type === 'message' || notif.title?.includes('message') ? (
                                        <MessageSquare className="h-5 w-5" />
                                    ) : (
                                        <Bell className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-neutral-900">{notif.title}</h4>
                                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{notif.message || notif.content}</p>
                                </div>
                                <button
                                    onClick={() => removeNotification(notif.id)}
                                    className="text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Mobile Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-neutral-100 px-6 py-4 flex items-center justify-between lg:hidden z-[60] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
                    {sidebarItems.slice(0, 4).map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 transition-all duration-300",
                                    isActive ? "text-primary-600 scale-110" : "text-neutral-400 hover:text-neutral-600"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive && "bg-primary-50 shadow-sm ring-1 ring-primary-100"
                                )}>
                                    {item.icon && <item.icon className="h-5 w-5" />}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.15em]">{item.label.split(' ')[0]}</span>
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-black bg-rose-500 text-white rounded-full border-2 border-white">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                    {/* More Button to trigger full sidebar */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="relative flex flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600"
                    >
                        <div className="p-1.5 rounded-xl">
                            <Menu className="h-5 w-5" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-[0.15em]">More</span>
                    </button>
                </nav>
            </div>

            {/* Profile Edit Modal */}
            {isProfileModalOpen && (
                <ProfileEditModal
                    user={currentUser}
                    onClose={() => setIsProfileModalOpen(false)}
                    onSave={handleProfileSave}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
