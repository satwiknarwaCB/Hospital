import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

const DashboardLayout = ({ title, sidebarItems, roleColor = "bg-primary-700", onLogout }) => {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out bg-white border-r border-neutral-200",
                    !isSidebarOpen && "-translate-x-full",
                    "lg:relative lg:translate-x-0"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-neutral-100">
                    <span className="text-xl font-bold text-primary-900">NeuroBridge™</span>
                </div>

                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? `bg-primary-50 text-primary-700`
                                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                )}
                            >
                                {item.icon && <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary-600" : "text-neutral-400")} />}
                                {item.label}
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
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>

                    <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>

                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-neutral-200" />
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
