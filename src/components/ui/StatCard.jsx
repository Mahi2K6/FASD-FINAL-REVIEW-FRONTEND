import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', trend: 'text-blue-500' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', trend: 'text-emerald-500' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-500', trend: 'text-amber-500' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', trend: 'text-red-500' },
    rose: { bg: 'bg-red-50', icon: 'text-red-500', trend: 'text-red-500' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-500', trend: 'text-violet-500' },
    purple: { bg: 'bg-violet-50', icon: 'text-violet-500', trend: 'text-violet-500' },
};

const StatCard = ({ icon: Icon, label, title, value, trend, color = 'blue', suffix = '' }) => {
    // If someone passes "from-blue-500..." it will fallback nicely to our default blue icon unless handled mapping.
    const palette = colorMap[color] || colorMap.blue;
    const isPositive = trend && !trend.startsWith('-');
    const displayLabel = label || title;

    return (
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{displayLabel}</p>
                <div className={`w-10 h-10 ${palette.bg} rounded-full flex items-center justify-center shrink-0`}>
                    {Icon && <Icon size={20} className={palette.icon} />}
                </div>
            </div>
            
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-800 font-[var(--font-display)] tabular-nums">{value}{suffix}</p>
                {trend && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
