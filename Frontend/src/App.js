import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WeeklyActivity from './components/WeeklyActivity';
import CompareWeeklyActivity from './components/CompareWeeklyActivity';
import DownloadReports from './components/DownloadReports';
import LandingPage from './components/LandingPage';
import Participations from './components/Participations';
import OtherActivity from './components/OtherActivity';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/landing-page" replace />} />
          <Route path="/landing-page" element={<LandingPage />} />
          <Route path="/weekly-activity" element={<WeeklyActivity />} />
          <Route path="/compare-weekly-activity" element={<CompareWeeklyActivity />} />
          <Route path="/download-reports" element={<DownloadReports />} />
          <Route path="/participations" element={<Participations />} />
          <Route path="/other-activity" element={<OtherActivity />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;