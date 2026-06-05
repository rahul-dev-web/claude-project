import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import ServerSelector from '../components/ServerSelector';
import AIWorkspace from '../components/AIWorkspace';
import ActionHistory from '../components/ActionHistory';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    const guilds = localStorage.getItem('guilds');

    if (!userData) {
      window.location.href = '/';
      return;
    }

    setUser(JSON.parse(userData));
    if (guilds) {
      const guildList = JSON.parse(guilds);
      setServers(guildList);
      if (guildList.length > 0) {
        setSelectedServer(guildList[0]);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🤖 AI+ Server Bot</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="username">{user.username}</span>
            {user.avatar && (
              <img 
                src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=40`}
                alt="Avatar"
                className="avatar"
              />
            )}
          </div>
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <aside className="dashboard-sidebar">
          <ServerSelector 
            servers={servers}
            selectedServer={selectedServer}
            onSelectServer={setSelectedServer}
          />
        </aside>

        <section className="dashboard-content">
          {selectedServer ? (
            <>
              <AIWorkspace 
                server={selectedServer}
                user={user}
              />
              <ActionHistory 
                server={selectedServer}
              />
            </>
          ) : (
            <div className="no-server">
              <p>No servers available. Create a Discord server and try again!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}