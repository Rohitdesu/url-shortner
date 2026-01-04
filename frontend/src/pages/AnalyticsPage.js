import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AnalyticsPage = () => {
    const { shortCode } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shortCode]);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get(`/url/analytics/${shortCode}`);
            setData(res.data);
        } catch (error) {
            toast.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading analytics...</div>;
    if (!data) return <div className="p-10 text-center">Analytics not found</div>;

    // Prepare Chart Data
    const chartData = {
        labels: Object.keys(data.clicksByDate),
        datasets: [
            {
                label: 'Clicks',
                data: Object.values(data.clicksByDate),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Clicks Over Time',
            },
        },
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics for {data.shortCode}</h1>
                    <p className="text-gray-500 truncate max-w-xl">{data.originalUrl}</p>
                </div>
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-gray-500 font-medium">Total Clicks</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{data.totalClicks}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-gray-500 font-medium">Created</p>
                    <p className="text-xl font-semibold text-gray-800 mt-2">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
                {/* Placeholder for more stats */}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="h-64 sm:h-80 w-full">
                    <Line options={options} data={chartData} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Agent</th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th> */}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.clickHistory.slice(-10).reverse().map((click, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(click.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {click.ipAddress || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate" title={click.userAgent}>
                                        {click.userAgent || 'Unknown'}
                                    </td>
                                    {/* <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {click.referrer || 'Direct'}
                                </td> */}
                                </tr>
                            ))}
                            {data.clickHistory.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No clicks yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
