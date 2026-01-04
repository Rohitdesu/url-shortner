import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaCopy, FaTrash, FaChartBar, FaCheck, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [originalUrl, setOriginalUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    // const { user } = useContext(AuthContext); // Unused

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        try {
            const res = await api.get('/url/all');
            setUrls(res.data.urls);
        } catch (error) {
            toast.error('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await api.post('/url/shorten', { originalUrl, customCode });
            toast.success('✨ Link created successfully');
            setOriginalUrl('');
            setCustomCode('');
            fetchUrls();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create URL');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) return;
        try {
            await api.delete(`/url/${id}`);
            toast.success('Link deleted successfully');
            setUrls(urls.filter(url => url._id !== id));
        } catch (error) {
            toast.error('Failed to delete URL');
        }
    };

    const CopyButton = ({ text }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        return (
            <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'hover:bg-blue-50 text-slate-400 hover:text-blue-600'}`}
                title="Copy Link"
            >
                {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
            </button>
        );
    };

    const getFullShortUrl = (code) => `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${code}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Creator Card */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <FaPlus />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Create Link</h2>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Destination URL</label>
                                <input
                                    type="url"
                                    required
                                    className="input-field"
                                    placeholder="https://super-long-url.com/..."
                                    value={originalUrl}
                                    onChange={(e) => setOriginalUrl(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Custom Alias (Optional)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                                        /
                                    </span>
                                    <input
                                        type="text"
                                        className="input-field rounded-l-none"
                                        placeholder="my-link"
                                        value={customCode}
                                        onChange={(e) => setCustomCode(e.target.value)}
                                        maxLength={20}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={createLoading}
                                className="btn btn-primary w-full flex justify-center py-3"
                            >
                                {createLoading ? 'Creating...' : 'Shorten Link'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Links List */}
                <div className="lg:col-span-2">
                    <div className="card overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">Your Links</h2>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{urls.length} Active</span>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-slate-400">Loading your links...</div>
                        ) : urls.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <FaPlus size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">No links yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">Create your first shortened link using the form on the left to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {urls.map((url) => (
                                    <div key={url._id} className="p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <a
                                                        href={getFullShortUrl(url.shortCode)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-lg font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                                                    >
                                                        /{url.shortCode}
                                                        <FaExternalLinkAlt size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                    <CopyButton text={getFullShortUrl(url.shortCode)} />
                                                    <span className="text-xs text-slate-400 px-2 py-1 bg-slate-100 rounded border border-slate-200">
                                                        {new Date(url.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm truncate" title={url.originalUrl}>
                                                    {url.originalUrl}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-2xl font-bold text-slate-800">{url.clicks}</div>
                                                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Clicks</div>
                                                </div>
                                                <div className="flex gap-2 pl-4 border-l border-slate-100">
                                                    <Link
                                                        to={`/analytics/${url.shortCode}`}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Analytics"
                                                    >
                                                        <FaChartBar size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(url._id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FaTrash size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
