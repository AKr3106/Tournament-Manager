const TeamCard = ({ teams = [] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team, idx) => (
        <div key={idx} className="group relative rounded-2xl bg-slate-900/40 border border-white/5 p-6 hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 shadow-md">
          <div className={`h-1.5 w-full bg-linear-to-r ${team.color} rounded-full mb-4`}></div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">{team.name}</h4>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
              Players: {team.players ? `${team.players.length}/5` : '0/5'}
            </span>
          </div>
          
          <div className="space-y-2.5">
            {team.players ? (
              team.players.map((player, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    {/* Profile-like avatar icon */}
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      {player.name}
                      {player.isCaptain && (
                        <span className="text-[9px] font-extrabold tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25 uppercase">
                          Captain
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                    {player.position}
                  </span>
                </div>
              ))
            ) : (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-lg border border-dashed border-white/5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    {i + 1}
                  </div>
                  <span className="text-xs text-slate-500 italic">Lottery Pending...</span>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TeamCard