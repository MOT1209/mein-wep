import { Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Clock, Library, Users } from 'lucide-react';
import React from 'react';

// Placeholder Components
const HomePage = () => (
  <div className="flex justify-center items-center" style={{ minHeight: '60vh' }}>
    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="text-green">Welcome to the Islamic Education Platform</h1>
      <p className="text-gray" style={{ fontSize: '1.2rem' }}>Empowering youth with authentic Islamic knowledge in a modern way.</p>
    </div>
  </div>
);
const QuranPage = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Interactive Quran Reader</h2><p>Coming soon...</p></div>;
const HadithPage = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Hadith Collection Library</h2><p>Coming soon...</p></div>;
const FiqhPage = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Simplified Fiqh Lessons</h2><p>Coming soon...</p></div>;
const SeerahPage = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Islamic History Timeline</h2><p>Coming soon...</p></div>;
const BeginnerPage = () => <div className="glass-panel" style={{ padding: '2rem' }}><h2>Islam for Beginners Hub</h2><p>Coming soon...</p></div>;

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div dir="ltr" className="app-layout">
      {/* Navigation Header */}
      <nav style={{ padding: '1.5rem 0', marginBottom: '2rem' }}>
        <div className="container flex justify-between items-center glass-panel" style={{ padding: '1rem 2rem' }}>

          <Link to="/" className="flex items-center gap-2">
            <Library className="text-green" size={28} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }} className="text-green">Islamic Platform</span>
          </Link>

          <div className="flex gap-4 items-center">
            <Link to="/quran" className="flex items-center gap-2 text-gray"><BookOpen size={18} /> Quran</Link>
            <Link to="/hadith" className="flex items-center gap-2 text-gray"><Library size={18} /> Hadith</Link>
            <Link to="/fiqh" className="flex items-center gap-2 text-gray"><BookOpen size={18} /> Fiqh</Link>
            <Link to="/seerah" className="flex items-center gap-2 text-gray"><Clock size={18} /> Seerah</Link>
            <Link to="/beginners" className="flex items-center gap-2 text-gray"><Users size={18} /> Beginners</Link>

            <button className="btn-primary" style={{ marginLeft: '1rem' }}>عربي</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container">
        {children}
      </main>

      <footer style={{ marginTop: '4rem', padding: '2rem 0', textAlign: 'center' }} className="text-gray glass-panel">
        <p>© 2026 Islamic Education Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quran" element={<QuranPage />} />
        <Route path="/hadith" element={<HadithPage />} />
        <Route path="/fiqh" element={<FiqhPage />} />
        <Route path="/seerah" element={<SeerahPage />} />
        <Route path="/beginners" element={<BeginnerPage />} />
      </Routes>
    </Layout>
  )
}

export default App
