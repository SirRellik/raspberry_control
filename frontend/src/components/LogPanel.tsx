import React, { useState, useMemo } from 'react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const [filter, setFilter] = useState('');
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([]);
  
  const prefixes = ['home/intent/', 'home/tele/', 'home/status/', 'home/plan/'];
  
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Text filter
      if (filter && !log.topic.toLowerCase().includes(filter.toLowerCase()) && 
          !log.payload.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
      
      // Prefix filter
      if (selectedPrefixes.length > 0) {
        return selectedPrefixes.some(prefix => log.topic.startsWith(prefix));
      }
      
      return true;
    });
  }, [logs, filter, selectedPrefixes]);
  
  const togglePrefix = (prefix: string) => {
    setSelectedPrefixes(prev => 
      prev.includes(prefix) 
        ? prev.filter(p => p !== prefix)
        : [...prev, prefix]
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151'
      }}>
        Log / Telemetrie
      </h2>
      
      {/* Filters */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'white',
        marginBottom: '16px'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Textový filtr:
          </label>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Hledej v topic nebo payload..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Filtr podle prefixů:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {prefixes.map(prefix => (
              <button
                key={prefix}
                onClick={() => togglePrefix(prefix)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: selectedPrefixes.includes(prefix) ? '#3b82f6' : 'white',
                  color: selectedPrefixes.includes(prefix) ? 'white' : '#374151',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {prefix}
              </button>
            ))}
            <button
              onClick={() => setSelectedPrefixes([])}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#6b7280',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Vymazat filtry
            </button>
          </div>
        </div>
      </div>
      
      {/* Logs */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        maxHeight: '600px',
        overflow: 'auto'
      }}>
        {filteredLogs.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            {logs.length === 0 ? 'Zatím žádné zprávy' : 'Žádné zprávy neodpovídají filtru'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  {log.topic}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#374151',
                backgroundColor: '#f9fafb',
                padding: '8px',
                borderRadius: '4px',
                margin: '0',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {log.payload.length > 500 ? 
                  log.payload.substring(0, 500) + '...' : 
                  log.payload
                }
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};