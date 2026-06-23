import { Link } from 'react-router-dom'

const TournamentShort = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-slate-900/40 border border-white/10 p-8 md:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-indigo-400 font-semibold tracking-wider text-xs uppercase px-3 py-1 bg-indigo-500/10 rounded-full">
              Quick Overview
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              6 Teams. 30 Players. 1 Champion.
            </h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              Experience the excitement of the RKM Legacy League. Featuring a completely randomized **Lottery Draft System** to ensure balanced teams, fair play, and pure team chemistry. 30 players will be drawn live into 6 rosters to battle it out for ultimate glory.
            </p>
            <div>
              <Link 
                to="/tournament" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Explore Full Tournament Details
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl text-center">
              <span className="block text-3xl font-extrabold text-white">6</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">Contending Teams</span>
            </div>
            <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl text-center">
              <span className="block text-3xl font-extrabold text-white">5</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">Players / Team</span>
            </div>
            <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl text-center">
              <span className="block text-3xl font-extrabold text-white">30</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">Total Draft Pool</span>
            </div>
            <div className="bg-slate-950/60 border border-white/5 p-5 rounded-2xl text-center">
              <span className="block text-3xl font-extrabold text-white">100%</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">Lottery Drafted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TournamentShort
