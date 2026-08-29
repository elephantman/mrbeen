import React from 'react';
import { TravelProvider, useTravel } from './context/TravelContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { WorldMap } from './components/map/WorldMap';
import { WorldGlobe } from './components/map/WorldGlobe';
import { CountriesListView } from './components/views/CountriesListView';
import { CitiesListView } from './components/views/CitiesListView';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { BadgeGallery } from './components/stats/BadgeGallery';
import { QuickSearchModal } from './components/search/QuickSearchModal';
import { CountryDetailDrawer } from './components/search/CountryDetailDrawer';
import { AddCustomCityModal } from './components/search/AddCustomCityModal';
import { ShareStudioModal } from './components/social/ShareStudioModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { CloudBackupPrompt } from './components/auth/CloudBackupPrompt';
import { FirebaseSetupModal } from './components/auth/FirebaseSetupModal';
import { useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { activeTab, mapMode } = useTravel();
  const { isFirebaseSetupOpen, setIsFirebaseSetupOpen } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Viewport */}
        <main className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950 pb-16 md:pb-0 relative">
          {activeTab === 'map' && (
            <div className="w-full h-full">
              {mapMode === '2d' ? <WorldMap /> : <WorldGlobe />}
            </div>
          )}

          {activeTab === 'countries' && <CountriesListView />}
          {activeTab === 'cities' && <CitiesListView />}
          {activeTab === 'badges' && <BadgeGallery />}
          {activeTab === 'stats' && <StatsDashboard />}
        </main>
      </div>

      {/* Modals and Overlays */}
      <QuickSearchModal />
      <CountryDetailDrawer />
      <AddCustomCityModal />
      <ShareStudioModal />
      <SettingsModal />
      <CloudBackupPrompt />
      <FirebaseSetupModal
        isOpen={isFirebaseSetupOpen}
        onClose={() => setIsFirebaseSetupOpen(false)}
      />

      {/* Mobile Navigation */}
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <TravelProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TravelProvider>
  );
}

export default App;
