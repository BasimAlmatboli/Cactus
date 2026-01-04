import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Calculator,
    Settings as SettingsIcon,
    ClipboardList,
    BarChart3,
    Receipt,
    MessageSquare
} from 'lucide-react';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const NavLink = ({ to, icon, label, badge }: { to: string; icon: React.ReactNode; label: string; badge?: string }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                <div className={`transition-colors ${active ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                    {icon}
                </div>
                <span className="font-medium flex-1">{label}</span>
                {badge && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-[#0F1115] text-white overflow-hidden font-sans">
            {/* Main Sidebar */}
            <div className="w-64 bg-[#0F1115] flex-shrink-0 flex flex-col border-r border-gray-800">
                {/* Logo */}
                <div className="p-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white ring-4 ring-blue-500/30"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Cactus.</span>
                    </div>
                </div>

                {/* Scrollable Nav Area */}
                <div className="flex-1 overflow-y-auto px-4 space-y-8">
                    {/* Menu Section */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
                            Menu
                        </h3>
                        <div className="space-y-1">
                            <NavLink to="/" icon={<ClipboardList className="w-5 h-5" />} label="Orders" />
                            <NavLink to="/calculator" icon={<Calculator className="w-5 h-5" />} label="Calculator" />
                            <NavLink to="/reports" icon={<BarChart3 className="w-5 h-5" />} label="Reports" />
                            <NavLink to="/expenses" icon={<Receipt className="w-5 h-5" />} label="Expenses" />
                        </div>
                    </div>

                    {/* Account Section */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
                            System
                        </h3>
                        <div className="space-y-1">
                            <NavLink to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Settings" />
                        </div>
                    </div>
                </div>

                {/* User / Invite Card (Decorative for now matching reference) */}
                <div className="p-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 border border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=Admin&background=random`} alt="User" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Admin User</p>
                                <p className="text-xs text-gray-500 truncate">admin@cactus.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F1115] relative">
                {/* Top Header (Search, Notifies) - Optional, mimicking reference */}
                <div className="h-20 px-8 flex items-center justify-between flex-shrink-0 z-10">
                    <div className="w-96">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search or type"
                                className="w-full bg-gray-800/50 border border-gray-700/50 text-gray-300 text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-600 transition-all"
                            />
                            <svg className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1115]"></span>
                        </button>
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1115]"></span>
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto relative">
                    <div className="absolute inset-0 pb-8 px-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
