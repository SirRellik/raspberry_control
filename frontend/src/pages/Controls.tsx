import React from 'react';
import { 
  BoilerControls, 
  EVControls, 
  RRCRControls, 
  KotelControls, 
  PresenceControls 
} from '../components/Controls';

export const Controls: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '600',
        color: '#374151'
      }}>
        Ovládání
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '16px'
      }}>
        <BoilerControls />
        <EVControls />
        <RRCRControls />
        <KotelControls />
        <PresenceControls />
      </div>
    </div>
  );
};