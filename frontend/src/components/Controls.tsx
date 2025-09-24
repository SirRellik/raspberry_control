import React, { useState } from 'react';
import { apiService } from '../services/api';

export const BoilerControls: React.FC = () => {
  const [tempTarget, setTempTarget] = useState(60);
  const [deadline, setDeadline] = useState('19:00');

  const handleSubmit = async () => {
    try {
      await apiService.sendOverride({
        type: 'boiler',
        payload: { temp_target: tempTarget, deadline }
      });
      alert('Boiler nastaven');
    } catch (error) {
      alert('Chyba při nastavování boileru');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
        Boiler
      </h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          Cílová teplota (°C):
        </label>
        <input
          type="number"
          value={tempTarget}
          onChange={(e) => setTempTarget(Number(e.target.value))}
          style={{
            width: '100px',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
          min="40"
          max="80"
        />
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          Deadline:
        </label>
        <input
          type="time"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Nastavit
      </button>
    </div>
  );
};

export const EVControls: React.FC = () => {
  const [mode, setMode] = useState('pv-only');

  const handleSubmit = async () => {
    try {
      await apiService.sendOverride({
        type: 'ev',
        payload: { mode }
      });
      alert('EV režim nastaven');
    } catch (error) {
      alert('Chyba při nastavování EV');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
        EV Nabíjení
      </h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          Režim:
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            width: '150px'
          }}
        >
          <option value="pv-only">PV Only</option>
          <option value="cheap">Levná elektřina</option>
          <option value="off">Vypnuto</option>
        </select>
      </div>
      
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Nastavit
      </button>
    </div>
  );
};

export const RRCRControls: React.FC = () => {
  const handleLevelSet = async (level: number) => {
    try {
      await apiService.sendOverride({
        type: 'rrcr',
        payload: { level }
      });
      alert(`RRCR úroveň nastavena na ${level}`);
    } catch (error) {
      alert('Chyba při nastavování RRCR');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
        RRCR
      </h3>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => handleLevelSet(level)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export const KotelControls: React.FC = () => {
  const handleStageSet = async (stage: number) => {
    try {
      await apiService.sendOverride({
        type: 'kotel',
        payload: { stage }
      });
      alert(`Kotel stupeň nastaven na ${stage}`);
    } catch (error) {
      alert('Chyba při nastavování kotle');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
        Kotel
      </h3>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((stage) => (
          <button
            key={stage}
            onClick={() => handleStageSet(stage)}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {stage}
          </button>
        ))}
      </div>
    </div>
  );
};

export const PresenceControls: React.FC = () => {
  const [mode, setMode] = useState('auto');

  const handleSubmit = async () => {
    try {
      await apiService.sendOverride({
        type: 'presence',
        payload: { mode }
      });
      alert('Přítomnost nastavena');
    } catch (error) {
      alert('Chyba při nastavování přítomnosti');
    }
  };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      marginBottom: '16px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
        Přítomnost
      </h3>
      
      <div style={{ marginBottom: '12px' }}>
        {['auto', 'home', 'away', 'vacation'].map((modeOption) => (
          <label key={modeOption} style={{ display: 'block', marginBottom: '8px' }}>
            <input
              type="radio"
              value={modeOption}
              checked={mode === modeOption}
              onChange={(e) => setMode(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            {modeOption === 'auto' ? 'Auto' :
             modeOption === 'home' ? 'Doma' :
             modeOption === 'away' ? 'Pryč' : 'Dovolená'}
          </label>
        ))}
      </div>
      
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Nastavit
      </button>
    </div>
  );
};