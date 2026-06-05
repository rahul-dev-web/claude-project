import React from 'react';
import '../styles/ServerSelector.css';

export default function ServerSelector({ servers, selectedServer, onSelectServer }) {
  return (
    <div className="server-selector">
      <h3>📋 Your Servers</h3>
      <div className="server-list">
        {servers.length === 0 ? (
          <p className="no-servers">No servers found</p>
        ) : (
          servers.map(server => (
            <button
              key={server.id}
              className={`server-item ${selectedServer?.id === server.id ? 'active' : ''}`}
              onClick={() => onSelectServer(server)}
            >
              {server.icon && (
                <img 
                  src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=40`}
                  alt={server.name}
                  className="server-icon"
                />
              )}
              <span className="server-name">{server.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}