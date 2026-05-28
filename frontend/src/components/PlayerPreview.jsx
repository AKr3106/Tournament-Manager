import React from 'react'
import { Link } from 'react-router-dom'
import playersData from '../assets/team_list.json'
import PlayerCard from './PlayerCard'

const PlayerPreview = () => {
  return (
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-indigo-400 font-semibold tracking-wider text-sm uppercase">Draft Pool Preview</span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2 text-white">Meet the Players</h2>
                <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
                  A preview of some of the elite players registered in the common draft pool awaiting selection.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {playersData.slice(0, 4).map((player) => (
                  <PlayerCard key={player.index} player={player} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/players" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold text-sm transition-all duration-300 transform hover:-translate-y-0.5">
                  View All 30 Players
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </section>
  )
}

export default PlayerPreview