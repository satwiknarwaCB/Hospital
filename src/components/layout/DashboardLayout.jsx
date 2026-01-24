import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, Bell, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useApp } from '../../lib/context';

const DashboardLayout = ({ children, title, sidebarItems, roleColor = "bg-primary-700", onLogout }) => {
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    const location = useLocation();
    const { notifications, removeNotification } = useApp();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            window.location.href = '/';
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
                    "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out bg-white border-r border-neutral-200 shadow-2xl lg:shadow-none",
                    !isSidebarOpen && "-translate-x-full",
                    "lg:relative lg:translate-x-0"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100">
                    <span className="text-xl font-bold text-primary-900 font-serif tracking-tight">NeuroBridge™</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-neutral-400 hover:text-neutral-600"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? `bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50`
                                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent"
                                )}
                            >
                                {item.icon && (
                                    <item.icon
                                        className={cn(
                                            "mr-3 h-5 w-5 transition-colors",
                                            isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
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

                <div className="absolute bottom-0 w-full p-4 border-t border-neutral-100">
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
                        <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-400">
                            NB
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto relative">
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
            </div>
        </div>
    );
};

export default DashboardLayout;
