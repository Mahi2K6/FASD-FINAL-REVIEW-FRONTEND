import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {Icon && <Icon className="w-10 h-10 text-slate-300 mb-3" />}
            <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
                {description && <p className="text-xs text-slate-400 max-w-sm mx-auto">{description}</p>}
            </div>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};

export default EmptyState;
