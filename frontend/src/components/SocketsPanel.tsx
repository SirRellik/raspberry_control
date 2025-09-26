import React from 'react';
import { Socket } from '../types';
import { apiService } from '../services/api';

interface SocketsPanelProps {
  sockets: Socket[];
  wsData: any;
}

export const SocketsPanel: React.FC<SocketsPanelProps> = ({ sockets, wsData }) => {
  const handleToggle = async (socketId: string, currentStatus: boolean) => {
    try {
      await apiService.sendOverride({
        type: 'plug',
        payload: { id: socketId, on: !currentStatus }
      });
      alert(`Zásuvka ${socketId} ${!currentStatus ? 'zapnuta' : 'vypnuta'}`);
    } catch (error) {
      alert(`Chyba při ovládání zásuvky ${socketId}`);
    }
  };

  const getSocketData = (socketId: string) => {
    // Prioritně používáme data z MQTT telemetrie
    const statusTopic = `home/status/${socketId}`;
    const loadsTopic = `home/tele/loads`;
    
    let status = false;
    let power = 0;
    
    // WebSocket MQTT data
    if (wsData[statusTopic]) {
      const statusData = wsData[statusTopic];
      if (typeof statusData === 'string') {
        status = statusData === 'online';
      } else if (typeof statusData === 'object') {
        status = statusData.status || false;
      }
    }
    
    if (wsData[loadsTopic]?.[socketId]) {
      power = wsData[loadsTopic][socketId].power_w || 0;
    }
    
    // Fallback na bootstrap data
    if (!status && !power) {
      const bootstrapSocket = wsData.bootstrap?.sockets?.find((s: any) => s.id === socketId);
      if (bootstrapSocket) {
        status = bootstrapSocket.status || false;
        power = bootstrapSocket.power_w || 0;
      }
    }
    
    // Fallback na počáteční API data
    if (!status && !power) {
      const apiSocket = sockets.find(s => s.id === socketId);
      if (apiSocket) {
        status = apiSocket.status;
        power = apiSocket.power_w;
      }
    }
    
    return { status, power };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151'
      }}>
        Zásuvky
      </h2>
      
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '1px solid #e5e7eb'
              }}>
                ID
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Název
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Stav
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'right', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Příkon (W)
              </th>
              <th style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: '1px solid #e5e7eb'
              }}>
                Akce
              </th>
            </tr>
          </thead>
          <tbody>
            {sockets.map((socket) => {
              const { status, power } = getSocketData(socket.id);
              
              return (
                <tr key={socket.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {socket.id}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {socket.name}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <span style={{ 
                      color: status ? '#10b981' : '#6b7280',
                      backgroundColor: status ? '#dcfce7' : '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {status ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {power.toFixed(1)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggle(socket.id, status)}
                      style={{
                        backgroundColor: status ? '#ef4444' : '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {status ? 'OFF' : 'ON'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {sockets.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Žádné zásuvky nenalezeny
          </div>
        )}
      </div>
    </div>
  );
};