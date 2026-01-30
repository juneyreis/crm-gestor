// src/components/prospects/ProspectSkeleton.jsx
import React from 'react';

export default function ProspectSkeleton() {
    return (
        <div className="w-full animate-pulse overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-1/4"></div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                        <div className="w-24 h-6 bg-gray-100 dark:bg-slate-700 rounded-full"></div>
                        <div className="w-32 ml-8 space-y-2">
                            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-full"></div>
                            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-2/3"></div>
                        </div>
                        <div className="w-20 ml-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
