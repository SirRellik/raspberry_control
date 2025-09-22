import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Overview } from './pages/Overview';
import { Controls } from './pages/Controls';
import { RoomsPanel } from './components/RoomsPanel';
import { LogPanel } from './components/LogPanel';
import { SocketsPanel } from './components/SocketsPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { apiService } from './services/api';
import { ApiStatus } from './types';

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { ws, isConnected, logs, data: wsData } = useWebSocket();

  const fetchStatus = async () => {
    try {
      const status = await apiService.getStatus();
      setApiStatus(status);
      console.log('Loaded initial status from backend:', status);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      // Při chybě nastavíme prázdný stav
      setApiStatus({
        grid_kw: 0,
        pv_kw: 0,
        tuv_c: 0,
        rooms: [],
        sockets: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Načteme počáteční stav z backendu
    fetchStatus();
  }, []);

  const navStyle = {
    display: 'flex',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    padding: '0 20px'
  };

  const linkStyle = {
    padding: '16px 24px',
    textDecoration: 'none',
    color: '#64748b',
    borderBottom: '2px solid transparent',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Načítání...
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
        {/* Header with connection status */}
        <header style={{
          backgroundColor: 'white',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: '0',
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            SES Control Dashboard
          </h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
              color: isConnected ? '#166534' : '#991b1b',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#16a34a' : '#dc2626'
              }} />
              WebSocket {isConnected ? 'Připojeno' : 'Odpojeno'}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav style={navStyle}>
          <NavLink 
            to="/" 
            style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
            end
          >
            Přehled
          </NavLink>
          <NavLink 
            to="/controls" 
            style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
          >
            Ovládání
          </NavLink>
          <NavLink 
            to="/rooms" 
            style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
          >
            Místnosti
          </NavLink>
          <NavLink 
            to="/log" 
            style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
          >
            Log / Telemetrie
          </NavLink>
          <NavLink 
            to="/sockets" 
            style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}
          >
            Zásuvky
          </NavLink>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<Overview apiStatus={apiStatus} wsData={wsData} />} 
            />
            <Route path="/controls" element={<Controls />} />
            <Route 
              path="/rooms" 
              element={
                <RoomsPanel 
                  rooms={apiStatus?.rooms || []} 
                  wsData={wsData} 
                />
              } 
            />
            <Route path="/log" element={<LogPanel logs={logs} />} />
            <Route 
              path="/sockets" 
              element={
                <SocketsPanel 
                  sockets={apiStatus?.sockets || []} 
                  wsData={wsData} 
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;