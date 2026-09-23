import { useState } from 'react';
import Avatar from './Avatar';
import { formatTime } from '../utils/format';

function lastMessagePreview(messages) {
  if (!messages || messages.length === 0) return { text: 'No messages yet', time: '' };
  const last = messages[messages.length - 1];
  return { text: last.text, time: formatTime(last.timestamp) };
}

export default function Sidebar({
  currentUser,
  users,
  groups,
  conversations,
  selectedChat,
  onSelectUser,
  onSelectGroup,
  onCreateGroup,
  onLogout,
  className = '',
}) {
  const [tab, setTab] = useState('direct');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-header">
        <Avatar src={currentUser.avatar} alt={currentUser.name} status="online" />
        <div className="info">
          <div className="name">{currentUser.name}</div>
          <div className="status-label">Online</div>
        </div>
      </div>

      <div className="sidebar-search">
        <input
          placeholder="Search users or groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="sidebar-tabs">
        <button className={tab === 'direct' ? 'active' : ''} onClick={() => setTab('direct')}>
          Direct
        </button>
        <button className={tab === 'groups' ? 'active' : ''} onClick={() => setTab('groups')}>
          Groups
        </button>
      </div>

      <div className="sidebar-list">
        {tab === 'direct' &&
          (filteredUsers.length === 0 ? (
            <p className="empty-hint">No users found.</p>
          ) : (
            filteredUsers.map((u) => {
              const preview = lastMessagePreview(conversations[u.id]);
              return (
                <div
                  key={u.id}
                  className={`sidebar-item ${selectedChat?.type === 'user' && selectedChat.id === u.id ? 'active' : ''}`}
                  onClick={() => onSelectUser(u)}
                >
                  <Avatar src={u.avatar} alt={u.name} status={u.status} />
                  <div className="info">
                    <div className="name">{u.name}</div>
                    <div className="sub">{preview.text}</div>
                  </div>
                  {preview.time && <div className="item-time">{preview.time}</div>}
                </div>
              );
            })
          ))}

        {tab === 'groups' && (
          <>
            {filteredGroups.length === 0 ? (
              <p className="empty-hint">No groups yet.</p>
            ) : (
              filteredGroups.map((g) => {
                const preview = lastMessagePreview(g.messages);
                return (
                  <div
                    key={g.id}
                    className={`sidebar-item ${selectedChat?.type === 'group' && selectedChat.id === g.id ? 'active' : ''}`}
                    onClick={() => onSelectGroup(g)}
                  >
                    <Avatar src={g.avatar} alt={g.name} />
                    <div className="info">
                      <div className="name">{g.name}</div>
                      <div className="sub">{preview.text}</div>
                    </div>
                    {preview.time && <div className="item-time">{preview.time}</div>}
                  </div>
                );
              })
            )}
            <button className="create-group-btn" onClick={onCreateGroup}>
              + Create Group
            </button>
          </>
        )}
      </div>

      {onLogout && (
        <button className="logout-btn" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      )}
    </aside>
  );
}
