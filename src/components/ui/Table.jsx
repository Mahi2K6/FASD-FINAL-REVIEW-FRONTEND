import React from 'react';

const Table = ({ columns, data, emptyMessage = 'No data found', emptyIcon: EmptyIcon, onRowClick, rowClassName }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                {EmptyIcon && <EmptyIcon size={40} className="w-10 h-10 text-slate-300 mb-3" />}
                <p className="text-sm font-semibold text-slate-500 mb-1">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] ${col.align === 'right' ? 'text-right' : ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => {
                        const customClasses = rowClassName ? rowClassName(row) : '';
                        return (
                        <tr
                            key={row.id || rowIndex}
                            onClick={() => onRowClick?.(row)}
                            className={`border-b border-slate-50 last:border-0 hover:bg-blue-50/40 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''} ${customClasses}`}
                        >
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`px-5 py-3.5 text-sm text-slate-700 ${col.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
