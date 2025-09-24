import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { apiService } from '../services/api';

interface RoomsPanelProps {
  rooms: Room[];
  wsData: any;
}

export const RoomsPanel: React.FC<RoomsPanelProps> = ({ rooms, wsData }) => {
  const [roomTargets, setRoomTargets] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize targets from rooms data
    const targets: Record<string, number> = {};
    rooms.forEach(room => {
      targets[room.name] = room.target_temp;
    });
    setRoomTargets(targets);
  }, [rooms]);

  const handleTargetChange = (roomName: string, target: number) => {
    setRoomTargets(prev => ({
      ...prev,
      [roomName]: target
    }));
  };

  const handleSetTarget = async (roomName: string) => {
    try {
      await apiService.sendOverride({
        type: 'room',
        payload: { name: roomName, target: roomTargets[roomName] }
      });
      alert(`Cílová teplota pro ${roomName} nastavena`);
    } catch (error) {
      alert(`Chyba při nastavování teploty pro ${roomName}`);
    }
  };

  const getRoomCurrentTemp = (roomName: string) => {
    // Prioritně používáme telemetrická data z MQTT
    const tempTopic = `home/tele/room/${roomName}/temp`;
    if (wsData[tempTopic]?.t !== undefined) {
      return wsData[tempTopic].t;
    }
    
    // Fallback na bootstrap data nebo počáteční API data
    const bootstrapRoom = wsData.bootstrap?.rooms?.find((r: any) => r.name === roomName);
    if (bootstrapRoom?.current_temp !== undefined) {
      return bootstrapRoom.current_temp;
    }
    
    return rooms.find(r => r.name === roomName)?.current_temp;
  };
  
  const getRoomMotion = (roomName: string) => {
    const motionTopic = `home/tele/room/${roomName}/motion`;
    if (wsData[motionTopic]?.active !== undefined) {
      return wsData[motionTopic].active;
    }
    
    const bootstrapRoom = wsData.bootstrap?.rooms?.find((r: any) => r.name === roomName);
    if (bootstrapRoom?.motion !== undefined) {
      return bootstrapRoom.motion;
    }
    
    return rooms.find(r => r.name === roomName)?.motion || false;
  };
  
  const getRoomContact = (roomName: string) => {
    const contactTopic = `home/tele/room/${roomName}/contact`;
    if (wsData[contactTopic]?.open !== undefined) {
      return wsData[contactTopic].open;
    }
    
    const bootstrapRoom = wsData.bootstrap?.rooms?.find((r: any) => r.name === roomName);
    if (bootstrapRoom?.contact !== undefined) {
      return bootstrapRoom.contact;
    }
    
    return rooms.find(r => r.name === roomName)?.contact || false;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151'
      }}>
        Místnosti
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '16px'
      }}>
        {rooms.map((room) => {
          const currentTemp = getRoomCurrentTemp(room.name);
          const motion = getRoomMotion(room.name);
          const contact = getRoomContact(room.name);
          const target = roomTargets[room.name] || room.target_temp;
          
          return (
            <div
              key={room.name}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'white'
              }}
            >
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                {room.name}
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Aktuální teplota:</span>
                  <span style={{ fontWeight: '600' }}>
                    {currentTemp !== undefined ? `${currentTemp.toFixed(1)}°C` : 'N/A'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Okno:</span>
                  <span style={{ 
                    color: contact ? '#ef4444' : '#10b981',
                    fontWeight: '600'
                  }}>
                    {contact ? 'Otevřené' : 'Zavřené'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Pohyb:</span>
                  <span style={{ 
                    color: motion ? '#10b981' : '#6b7280',
                    fontWeight: '600'
                  }}>
                    {motion ? 'Detekován' : 'Nedetekován'}
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Cílová teplota: {target}°C
                </label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="0.5"
                  value={target}
                  onChange={(e) => handleTargetChange(room.name, Number(e.target.value))}
                  style={{
                    width: '100%',
                    marginBottom: '8px'
                  }}
                />
              </div>
              
              <button
                onClick={() => handleSetTarget(room.name)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Nastavit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};