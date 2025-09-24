import React from 'react';

interface DeviceCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'error';
  children?: React.ReactNode;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
  title, 
  value, 
  unit, 
  status = 'normal',
  children 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#10b981';
    }
  };

  return (
    <div style={{
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '200px'
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151'
      }}>
        {title}
      </h3>
      
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: getStatusColor(),
        marginBottom: '8px'
      }}>
        {value}{unit && <span style={{ fontSize: '16px', marginLeft: '4px' }}>{unit}</span>}
      </div>
      
      {children}
    </div>
  );
};
export default DeviceCard;
