
const Hero = () => {
    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center py-15 space-y-6 max-w-3xl px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight py-10">
            Welcome to <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-500 antialiased" style={{ WebkitTextFillColor: 'transparent' }}>RKM Legacy League</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed px-4 pb-4">
            The ultimate football league organized by the students of RKM. Relive the glory, compete on the pitch, and celebrate our grand student reunion.
          </p>
        </div>
      </div>
    )
}

export default Hero