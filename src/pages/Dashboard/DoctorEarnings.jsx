import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { useAppContext } from '../../AppContext';
import API from '../../api';
import { DollarSign, Activity, FileText, Loader2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';

const DoctorEarnings = () => {
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('earnings');
    const [earningsData, setEarningsData] = useState({ total_earnings: 0, history: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.id) return;

        API.get(`/doctor/earnings/${currentUser.id}`)
            .then(res => {
                const data = res.data || { total_earnings: 0, history: [] };
                setEarningsData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load earnings", err);
                setLoading(false);
            });
    }, [currentUser?.id]);

    const processChartData = (history) => {
        if (!history || history.length === 0) return [];
        return history.slice(0, 7).reverse().map(c => {
            const date = new Date(c.consultation_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return { name: date, fee: c.fee || 0 };
        });
    };

    const chartData = processChartData(earningsData.history);

    return (
        <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="text-blue-600 animate-spin" />
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Total Earnings Card */}
                        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center py-10">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <DollarSign size={32} />
                            </div>
                            <p className="text-[var(--color-text-secondary)] font-semibold text-xs uppercase tracking-wider mb-2">Total Lifetime Earnings</p>
                            <h3 className="text-4xl font-bold text-[var(--color-text-primary)]">₹{earningsData.total_earnings?.toLocaleString() || '0'}</h3>
                        </Card>

                        {/* Bar Chart */}
                        <Card className="lg:col-span-2">
                            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                                <Activity size={16} className="text-blue-500" /> Recent Consultations
                            </h3>
                            <div className="h-64">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                            <Bar dataKey="fee" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-[var(--color-text-secondary)]">
                                        No recent earnings data available.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* History Table */}
                    <Card>
                        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" /> Consultation History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm">Date</th>
                                        <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm">Patient</th>
                                        <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm">Notes</th>
                                        <th className="py-3 px-4 text-[var(--color-text-secondary)] font-medium text-sm text-right">Fee Earned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {earningsData.history && earningsData.history.length > 0 ? (
                                        earningsData.history.map((record, index) => (
                                            <tr key={index} className="border-b last:border-0 border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 text-[var(--color-text-primary)] text-sm">
                                                    {new Date(record.consultation_date).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-4 text-[var(--color-text-secondary)] text-sm">{record.patient_name || 'Unknown'}</td>
                                                <td className="py-4 px-4 text-[var(--color-text-secondary)] text-sm max-w-xs truncate">{record.notes || 'N/A'}</td>
                                                <td className="py-4 px-4 text-blue-600 font-bold text-sm text-right">₹{record.fee || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-[var(--color-text-secondary)]">No consultation history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AppLayout>
    );
};

export default DoctorEarnings;
