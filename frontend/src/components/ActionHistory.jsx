import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ActionHistory.css';

export default function ActionHistory({ server }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [server.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await axios.get(
        `${backendUrl}/api/ai/history/${server.id}?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setActions(response.data.requests);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-history">
      <h2>📋 Recent Actions</h2>
      
      {loading ? (
        <div className="loading">Loading history...</div>
      ) : actions.length === 0 ? (
        <div className="empty-state">
          <p>No actions yet. Try creating one!</p>
        </div>
      ) : (
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Prompt</th>
                <th>Action</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody>
              {actions.map(action => (
                <tr key={action.id}>
                  <td>{new Date(action.created_at).toLocaleString()}</td>
                  <td>{action.prompt.substring(0, 30)}...</td>
                  <td>
                    <code>{action.response.action}</code>
                  </td>
                  <td>{action.tokens_used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="refresh-btn" onClick={loadHistory}>
        🔄 Refresh
      </button>
    </div>
  );
}