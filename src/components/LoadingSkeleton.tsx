import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header */}
                <div className="bg-gray-200 h-12 flex items-center px-4 gap-4">
                    <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                </div>

                {/* Rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="border-t border-gray-200 h-16 flex items-center px-4 gap-4">
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        </div>
    );
};

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    );
};
