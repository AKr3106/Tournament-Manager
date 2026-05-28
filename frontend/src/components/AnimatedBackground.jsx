
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Large slow-drifting orb - top left */}
      <div
        className="absolute w-125 h-125 rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
          top: '-5%',
          left: '-8%',
          animation: 'drift1 25s ease-in-out infinite',
        }}
      />

      {/* Medium orb - top right */}
      <div
        className="absolute w-100 h-100 rounded-full opacity-[0.035]"
        style={{
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
          top: '10%',
          right: '-5%',
          animation: 'drift2 30s ease-in-out infinite',
        }}
      />

      {/* Small accent orb - center */}
      <div
        className="absolute w-75 h-75 rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
          top: '40%',
          left: '30%',
          animation: 'drift3 20s ease-in-out infinite',
        }}
      />

      {/* Deep orb - bottom left */}
      <div
        className="absolute w-112.5 h-112.5 rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          bottom: '5%',
          left: '10%',
          animation: 'drift4 28s ease-in-out infinite',
        }}
      />

      {/* Subtle pink orb - bottom right */}
      <div
        className="absolute w-87.5 h-87.5 rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
          bottom: '15%',
          right: '5%',
          animation: 'drift5 22s ease-in-out infinite',
        }}
      />

      {/* Tiny floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-indigo-400"
          style={{
            opacity: 0.12 + (i * 0.02),
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
            animation: `particle${i + 1} ${18 + i * 4}s ease-in-out infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, 30px) scale(1.05); }
          66% { transform: translate(-20px, 50px) scale(0.95); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 40px) scale(1.08); }
          66% { transform: translate(25px, -30px) scale(0.92); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, -20px) scale(1.1); }
          50% { transform: translate(20px, 40px) scale(0.9); }
          75% { transform: translate(-30px, 10px) scale(1.05); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-40px, -30px) scale(1.06); }
          70% { transform: translate(30px, 20px) scale(0.94); }
        }
        @keyframes drift5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          35% { transform: translate(35px, -25px) scale(1.04); }
          65% { transform: translate(-20px, 35px) scale(0.96); }
        }
        @keyframes particle1 {
          0%, 100% { transform: translate(0, 0); opacity: 0.12; }
          50% { transform: translate(60px, -40px); opacity: 0.25; }
        }
        @keyframes particle2 {
          0%, 100% { transform: translate(0, 0); opacity: 0.14; }
          50% { transform: translate(-50px, 50px); opacity: 0.28; }
        }
        @keyframes particle3 {
          0%, 100% { transform: translate(0, 0); opacity: 0.16; }
          50% { transform: translate(40px, 60px); opacity: 0.22; }
        }
        @keyframes particle4 {
          0%, 100% { transform: translate(0, 0); opacity: 0.18; }
          50% { transform: translate(-70px, -30px); opacity: 0.3; }
        }
        @keyframes particle5 {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          50% { transform: translate(55px, 45px); opacity: 0.26; }
        }
        @keyframes particle6 {
          0%, 100% { transform: translate(0, 0); opacity: 0.22; }
          50% { transform: translate(-45px, -55px); opacity: 0.32; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
