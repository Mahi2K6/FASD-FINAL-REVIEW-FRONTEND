import React from 'react';

// ─────────────────────────────────────────────
// Skeleton primitives
// ─────────────────────────────────────────────

/** Generic shimmer rectangle */
const SkeletonBox = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-100/80 rounded-3xl ${className}`} />
);

/** Full stat card skeleton — matches GlassCard stat layout */
const SkeletonStatCard = () => (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-5 flex flex-col gap-3 shadow-sm">
        <SkeletonBox className="h-3 w-24 rounded-full" />
        <SkeletonBox className="h-8 w-16 rounded-2xl" />
    </div>
);

/** Row skeleton — for tables and list items */
const SkeletonRow = ({ cols = 4 }) => (
    <div className="flex items-center gap-4 py-4 border-b border-slate-50">
        <SkeletonBox className="h-10 w-10 rounded-full flex-shrink-0" />
        {Array.from({ length: cols - 1 }).map((_, i) => (
            <SkeletonBox
                key={i}
                className={`h-3 rounded-full flex-1 ${i === cols - 2 ? 'max-w-[80px]' : ''}`}
            />
        ))}
    </div>
);

/** Card-level skeleton — matching full GlassCard proportions */
const SkeletonCard = ({ lines = 3, hasAvatar = false, className = '' }) => (
    <div className={`bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-6 flex flex-col gap-4 shadow-sm ${className}`}>
        {hasAvatar && (
            <div className="flex items-center gap-4 mb-2">
                <SkeletonBox className="h-14 w-14 rounded-3xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                    <SkeletonBox className="h-4 w-32 rounded-full" />
                    <SkeletonBox className="h-3 w-20 rounded-full" />
                </div>
            </div>
        )}
        <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBox
                    key={i}
                    className={`h-3.5 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
                />
            ))}
        </div>
    </div>
);

/** Specialized Doctor profile skeleton */
const SkeletonDoctorCard = () => (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex items-center gap-6">
            <SkeletonBox className="h-20 w-20 rounded-3xl flex-shrink-0" />
            <div className="space-y-3 flex-1">
                <SkeletonBox className="h-6 w-48 rounded-full" />
                <SkeletonBox className="h-3 w-32 rounded-full" />
                <SkeletonBox className="h-2.5 w-24 rounded-full" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
            <SkeletonBox className="h-12 rounded-3xl" />
            <SkeletonBox className="h-12 rounded-3xl" />
        </div>
    </div>
);

/** Entry point for all skeleton variants */
const SkeletonLoader = ({ type = 'card', count = 1, className = '', ...props }) => {
    const items = Array.from({ length: count });
    
    const renderSkeleton = () => {
        switch (type) {
            case 'stat': return <SkeletonStatCard {...props} />;
            case 'row': return <SkeletonRow {...props} />;
            case 'card': return <SkeletonCard {...props} />;
            case 'doctor': return <SkeletonDoctorCard {...props} />;
            case 'table': return <div className="space-y-2"><SkeletonRow cols={5} /></div>;
            case 'grid': return (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
                </div>
            );
            default: return <SkeletonBox className="h-24 w-full" />;
        }
    };

    if (count > 1) {
        return (
            <div className={type === 'stat' ? 'grid grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-6'}>
                {items.map((_, i) => <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>)}
            </div>
        );
    }

    return renderSkeleton();
};

export default SkeletonLoader;
