import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../images/rkm_legacy_league_logo.svg';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('rkm_theme');
        return saved ? saved : 'dark';
    });

    // Update user state when location changes (i.e. redirects after login/logout)
    useEffect(() => {
        Promise.resolve().then(() => {
            try {
                const savedUser = localStorage.getItem('user');
                setUser(savedUser ? JSON.parse(savedUser) : null);
            } catch {
                setUser(null);
            }
        });
    }, [location]);

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
        localStorage.setItem('rkm_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (err) {
            console.error("Logout API call failed:", err);
        }
        localStorage.removeItem('user');
        setUser(null);
        alert("Logged out successfully");
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-slate-950/50 backdrop-blur-md border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <img
                            src={logo}
                            alt="RKM Legacy League Logo"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-300 transform group-hover:scale-105"
                        />
                        <span className="font-bold text-lg sm:text-2xl bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-500 tracking-wide whitespace-nowrap antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
                            RKM Legacy League
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm tracking-wide">Home</Link>
                        <Link to="/about" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm tracking-wide">About</Link>
                        <Link to="/tournament" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm tracking-wide">Tournament</Link>
                        <Link to="/players" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm tracking-wide">Players</Link>
                        <Link to="/rules" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm tracking-wide">Rules</Link>
                        {user && user.role === 'admin' && (
                            <Link to="/admin" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium text-sm tracking-wide">Admin</Link>
                        )}
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-slate-300 hover:text-white cursor-pointer mr-2"
                            aria-label="Toggle theme"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636a9 9 0 0112.728 12.728z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/profile"
                                    className="px-4 py-2 rounded-full border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 hover:text-white transition-all duration-300 font-semibold text-sm cursor-pointer flex items-center gap-2 shadow-inner"
                                >
                                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Hello, {user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-slate-300 hover:text-white font-medium text-sm cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link to="/signin" className="px-5 py-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 text-center">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white focus:outline-none transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Home</Link>
                        <Link to="/tournament" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Tournaments</Link>
                        <Link to="/players" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Players</Link>
                        <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Leaderboard</Link>
                        <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">About</Link>
                        {user && user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Admin</Link>
                        )}
                        <Link to="/lottery" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Lottery</Link>
                        {/* Mobile Theme Toggle */}
                        <button
                            onClick={() => {
                                toggleTheme();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <span>Theme: {theme === 'dark' ? 'Dark/Night' : 'Light/Day'}</span>
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636a9 9 0 0112.728 12.728z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {user ? (
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-semibold text-indigo-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Hello, {user.name} (View Profile)
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="w-full px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-slate-300 hover:text-white font-medium text-sm block text-center cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link to="/signin" onClick={() => setIsOpen(false)} className="w-full mt-4 px-5 py-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 block text-center">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;