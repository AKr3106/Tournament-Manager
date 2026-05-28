import { Link } from 'react-router-dom';

const SeasonButton = ({ activeSeason }) => {
  return (
    <div className="flex justify-center md:justify-start mb-8">
      <div className="relative p-1 bg-slate-900/85 border border-white/10 rounded-full flex gap-1 shadow-lg backdrop-blur-md">
        <Link
          to="/tournament/s1"
          className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 block ${
            activeSeason === 's1'
              ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Season 1
        </Link>
        <Link
          to="/tournament"
          className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 block ${
            activeSeason === 's2'
              ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Season 2
        </Link>
      </div>
    </div>
  );
};

export default SeasonButton;
