import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Tournament from './pages/Tournament'
import TournamentS1 from './pages/TournamentS1'
import TournamentShort from './components/TournamentShort'
import SignIn from './pages/SignIn'
import CreateAccount from './pages/CreateAccount'
import About from './pages/About'
import Players from './pages/Players'
import PlayerPreview from './components/PlayerPreview'
import RulesPreview from './components/RulesPreview'
import Rules from './pages/Rules'
import Footer from './pages/Footer'
import Error from './pages/Error'
import Admin from './pages/Admin'
import Lottery from './pages/Lottery'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'

const HomeDivider = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="w-[85%] h-[1.5px] bg-linear-to-r from-indigo-500 via-purple-500/50 to-transparent mr-auto opacity-80"></div>
  </div>
);

// Route protection component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const savedUser = localStorage.getItem('user');
  let user = null;
  if (savedUser) {
    try {
      user = JSON.parse(savedUser);
    } catch {
      user = null;
    }
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showNavbar = !['/signin', '/create-account'].includes(location.pathname)

  return (
    // REMOVED side paddings (px-2 sm:px-4, etc.) from this top-level container element
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 relative">
      {showNavbar && <Navbar />}
      
      {/* SHIFTED layout screen side padding safely onto this inner view page routing content panel */}
      <div className="grow relative z-10 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <HomeDivider />
              <TournamentShort />
              <HomeDivider />
              <PlayerPreview />
              <HomeDivider />
              <About />
              <HomeDivider />
              <RulesPreview />
            </>
          } />
          <Route path="/tournament" element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
          <Route path="/tournament/s1" element={<ProtectedRoute><TournamentS1 /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/players" element={<ProtectedRoute><Players /></ProtectedRoute>} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="/lottery" element={<ProtectedRoute><Lottery /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="*" element={<Error />} />
        </Routes>
      </div>
      {showNavbar && <Footer />}
    </div>
  )
}

export default App