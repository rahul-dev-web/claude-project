import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AIWorkspace.css';

export default function AIWorkspace({ server, user }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const result = await axios.post(
        `${backendUrl}/api/ai/process`,
        {
          prompt: prompt,
          guildId: server.id,
          userId: user.id
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setResponse(result.data);
      setPendingAction(result.data);
      setShowConfirm(true);
      setPrompt('');
    } catch (error) {
      setResponse({
        error: true,
        message: error.response?.data?.error || 'Failed to process request'
      });
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async () => {
    // In real implementation, call Discord bot endpoint
    console.log('Executing action:', pendingAction);
    setShowConfirm(false);
    setPendingAction(null);
  };

  return (
    <div className="ai-workspace">
      <h2>💬 AI Workspace</h2>
      <p className="workspace-hint">Server: <strong>{server.name}</strong></p>
      
      <form onSubmit={handleSubmit} className="ai-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., Create Moderator Role, Set permissions for #general..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            maxLength="500"
            className="prompt-input"
          />
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="submit-btn"
          >
            {loading ? '⏳ Processing...' : '📤 Send'}
          </button>
        </div>
        <div className="char-count">
          {prompt.length}/500
        </div>
      </form>

      {response && (
        <div className="response-box">
          {response.error ? (
            <div className="error-response">
              <h3>❌ Error</h3>
              <p>{response.message}</p>
            </div>
          ) : (
            <div className="success-response">
              <h3>✅ AI Response</h3>
              <div className="action-details">
                <div className="detail-row">
                  <label>Action:</label>
                  <code>{response.action}</code>
                </div>
                <div className="detail-row">
                  <label>Parameters:</label>
                  <pre>{JSON.stringify(response.parameters, null, 2)}</pre>
                </div>
                {response.reason && (
                  <div className="detail-row">
                    <label>Reason:</label>
                    <p>{response.reason}</p>
                  </div>
                )}
                <div className="detail-row">
                  <label>Tokens Used:</label>
                  <span>{response.tokensUsed}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showConfirm && pendingAction && (
        <div className="confirm-modal">
          <div className="confirm-content">
            <h3>⚠️ Confirm Action</h3>
            <p>Are you sure you want to execute this action?</p>
            <div className="action-preview">
              <p><strong>Action:</strong> {pendingAction.action}</p>
              <p><strong>Parameters:</strong> {JSON.stringify(pendingAction.parameters)}</p>
            </div>
            <div className="confirm-buttons">
              <button className="btn-confirm" onClick={executeAction}>
                ✅ Confirm
              </button>
              <button className="btn-cancel" onClick={() => setShowConfirm(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}