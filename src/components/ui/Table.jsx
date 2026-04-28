import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ columns, data, emptyMessage = 'No data found', emptyIcon: EmptyIcon }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                {EmptyIcon && (
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 shadow-inner border border-slate-100/60">
                        <EmptyIcon className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                    </div>
                )}
                <p className="text-sm font-medium text-slate-400">{emptyMessage}</p>
                <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 bg-slate-50/60 first:rounded-tl-xl last:rounded-tr-xl border-b border-slate-100/60 ${col.align === 'right' ? 'text-right' : ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <motion.tr
                            key={row.id || rowIdx}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: rowIdx * 0.025, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="border-b border-slate-50/80 last:border-b-0 hover:bg-blue-50/20 transition-colors duration-100 group"
                        >
                            {columns.map((col, colIdx) => (
                                <td
                                    key={colIdx}
                                    className={`px-5 py-3.5 text-sm text-slate-600 ${colIdx === 0 ? 'font-medium' : 'font-normal'} ${col.align === 'right' ? 'text-right' : ''}`}
                                >
                                    {col.render ? col.render(row) : (col.accessor ? row[col.accessor] : '')}
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
