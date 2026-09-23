import { useState } from 'react';
import Avatar from './Avatar';

export default function CreateGroupModal({ users, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  function toggleUser(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleCreate() {
    if (!name.trim() || selectedIds.length === 0) return;
    onCreate({ name: name.trim(), memberIds: selectedIds });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Create Group</h2>

        <div className="field">
          <label htmlFor="group-name">Group Name</label>
          <input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Study Buddies"
          />
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '12px 0 8px' }}>
          Select members
        </p>
        <div className="member-picker-list">
          {users.map((u) => (
            <label key={u.id} className="member-picker-item">
              <input
                type="checkbox"
                checked={selectedIds.includes(u.id)}
                onChange={() => toggleUser(u.id)}
              />
              <Avatar src={u.avatar} alt={u.name} size={30} />
              <span className="name">{u.name}</span>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            style={{ width: 'auto' }}
            disabled={!name.trim() || selectedIds.length === 0}
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
