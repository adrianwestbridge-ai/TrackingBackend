import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Search,
  PhoneCall,
  Users,
  BarChart3,
  Activity,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'sessions', label: 'Sessions', icon: Search },
  { id: 'call-logs', label: 'Call Logs', icon: PhoneCall },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <Activity className="logo-icon" />
          <span>INBOUND TRACKING SYSTEM</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="item-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot"></span>
          <span>Pixel v2.4 Active</span>
        </div>
        <ShieldCheck size={16} color="#475569" />
      </div>
    </aside>
  );
}
