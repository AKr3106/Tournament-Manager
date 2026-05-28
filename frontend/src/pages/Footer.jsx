import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Brand and Info */}
        <div className="text-center md:text-left">
          <span className="font-bold text-lg bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-500 tracking-wide antialiased" style={{ WebkitTextFillColor: 'transparent' }}>
            RKM Legacy League
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Organized by the students of RKM. A grand reunion football tournament.
          </p>
        </div>

        {/* Middle Side: Quick Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <Link to="/about" className="hover:text-white transition-colors duration-200">About</Link>
          <Link to="/tournament" className="hover:text-white transition-colors duration-200">Tournament</Link>
          <Link to="/players" className="hover:text-white transition-colors duration-200">Players</Link>
          <Link to="/rules" className="hover:text-white transition-colors duration-200">Rules</Link>
        </div>

        {/* Right Side: Copyright */}
        <div className="text-xs text-slate-600 text-center md:text-right">
          &copy; {new Date().getFullYear()} RKM Legacy League. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;