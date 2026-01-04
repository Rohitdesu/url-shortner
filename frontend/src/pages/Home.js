import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaCopy, FaCheck, FaRocket, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const Home = () => {
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setShortUrl('');

        try {
            const res = await api.post('/url/shorten', { originalUrl: longUrl });
            setShortUrl(res.data.shortUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const features = [
        { icon: <FaRocket />, title: "Lightning Fast", desc: "Redirects that happen in milliseconds." },
        { icon: <FaShieldAlt />, title: "Secure & Reliable", desc: "Enterprise-grade encryption and uptime." },
        { icon: <FaChartLine />, title: "Detailed Analytics", desc: "Track every click, location, and device." }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)]">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl opacity-60"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-8 border border-blue-100">
                        ✨ Shorten links in seconds
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                        Make every connection <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">count.</span>
                    </h1>

                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Transform long, ugly links into smart, trackable short URLs. Perfect for social media, marketing, and cleaner sharing.
                    </p>

                    <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-500/10 border border-slate-100 max-w-2xl mx-auto transition-transform hover:scale-[1.01] duration-300">
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="url"
                                required
                                className="flex-1 px-6 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder-slate-400 outline-none transition-all"
                                placeholder="Paste your long URL here..."
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary px-8 py-4 rounded-xl font-bold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Shortening...' : 'Shorten Now'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl max-w-2xl mx-auto border border-red-100 flex items-center justify-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {shortUrl && (
                        <div className="mt-8 p-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl max-w-2xl mx-auto shadow-lg animate-fade-in-up">
                            <div className="bg-white p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-left overflow-hidden">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Success! Here's your link:</p>
                                    <a href={shortUrl} target="_blank" rel="noreferrer" className="text-lg font-bold text-slate-800 hover:text-blue-600 truncate block">
                                        {shortUrl}
                                    </a>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {copied ? <FaCheck /> : <FaCopy />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-6">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
