import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaLink, FaChartPie, FaSignOutAlt, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="glass-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <FaLink className="h-5 w-5" />
                            </div>
                            <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                                Linkly
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${isActive('/dashboard')
                                            ? 'bg-blue-50 text-blue-600 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <FaChartPie className={isActive('/dashboard') ? 'text-blue-500' : 'text-slate-400'} />
                                    <span>Dashboard</span>
                                </Link>

                                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                                <div className="flex items-center space-x-3 pl-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                                        <span className="text-xs text-slate-400">Pro Plan</span>
                                    </div>
                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
                                        <FaUser size={14} />
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <FaSignOutAlt size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2"
                                >
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn btn-primary rounded-full px-8 shadow-blue-500/25 shadow-lg">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                        >
                            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 shadow-lg absolute w-full left-0 z-40 transition-all duration-300 ease-in-out">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user ? (
                            <>
                                <div className="px-3 py-2 border-b border-slate-50 mb-2">
                                    <p className="text-sm font-medium text-slate-800">Signed in as {user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                                <Link
                                    to="/dashboard"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <div
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50 cursor-pointer"
                                >
                                    Sign out
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
