import React from 'react';
import { QrCode, Camera, Users, User, Home } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'HOME' as View, icon: Home, label: 'Home' },
    { id: 'QR' as View, icon: QrCode, label: 'My QR' },
    { id: 'SCAN' as View, icon: Camera, label: 'Scan' },
    { id: 'FRIENDS' as View, icon: Users, label: 'Friends' },
    { id: 'PROFILE' as View, icon: User, label: 'Me' },
  ];

  return (
    <nav className="glass-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 12px',
            borderRadius: '16px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundColor: currentView === item.id ? '#4F46E5' : 'transparent',
            color: currentView === item.id ? '#FFFFFF' : '#94A3B8',
            transform: currentView === item.id ? 'translateY(-4px)' : 'none',
            boxShadow: currentView === item.id ? '0 10px 15px -3px rgba(79, 70, 229, 0.4)' : 'none'
          }}
        >
          <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
          {currentView === item.id && (
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;