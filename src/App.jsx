import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import StatsOverview from './components/StatsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import LoadingScreen from './components/LoadingScreen';
import { TaskProvider, useTasks } from './context/TaskContext';

import useScheduledNotifications, { requestNotificationPermission } from './hooks/useScheduledNotifications';

function App() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <TaskProvider>
      <InnerApp isDesktop={isDesktop} />
    </TaskProvider>
  );
}

const InnerApp = ({ isDesktop }) => {
  const { loading } = useTasks();
  useScheduledNotifications();

  const handleEnableNotifications = () => {
    requestNotificationPermission().then(granted => {
      if (granted) alert("Notifications enabled! You'll be reminded at your scheduled times.");
      else alert("Notifications blocked or denied.");
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="container"
      style={{
        maxWidth: isDesktop ? '1000px' : '480px',
        marginTop: '20px',
        padding: '20px'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '350px 1fr' : '1fr', gap: '40px' }}>

        {isDesktop && (
          <div style={{ order: 0 }}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <h2 className="text-sm text-muted uppercase tracking-wider" style={{ marginBottom: '20px' }}>Analytics</h2>
              <AnalyticsCharts />
            </div>
          </div>
        )}

        {/* Main Tracker */}
        <div style={{ order: 1 }}>
          <Header />
          <StatsOverview />

          <main>
            <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
              <h2 className="text-sm text-muted uppercase tracking-wider">Today's Tasks</h2>
            </div>

            <TaskList />

            <AddTaskForm />
          </main>

          {!isDesktop && (
            <div style={{ marginTop: '40px' }}>
              <h2 className="text-sm text-muted uppercase tracking-wider" style={{ marginBottom: '20px' }}>Analytics</h2>
              <AnalyticsCharts />
            </div>
          )}

          <footer className="text-center text-muted text-sm" style={{ marginTop: '40px', opacity: 0.5, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p>Consistency is key.</p>
            <button onClick={handleEnableNotifications} style={{ textDecoration: 'underline', fontSize: '0.8rem' }}>
              Enable Notifications
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
