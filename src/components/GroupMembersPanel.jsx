import { useState } from 'react';
import Avatar from './Avatar';

export default function GroupMembersPanel({
  group,
  members,
  currentUserId,
  isAdmin,
  onClose,
  onRemoveMember,
  onRenameGroup,
  onDeleteGroup,
  onLeaveGroup,
}) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(group.name);

  function handleRenameSubmit(e) {
    e.preventDefault();
    if (newName.trim()) {
      onRenameGroup(newName.trim());
      setRenaming(false);
    }
  }

  return (
    <aside className="members-panel">
      <button className="back-btn" onClick={onClose} aria-label="Close">×</button>

      {renaming ? (
        <form onSubmit={handleRenameSubmit} className="field">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={() => setRenaming(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
              Save
            </button>
          </div>
        </form>
      ) : (
        <h3>{group.name} · {members.length} members</h3>
      )}

      {members.map((m) => (
        <div key={m.userId} className="member-row">
          <Avatar src={m.user.avatar} alt={m.user.name} size={32} status={m.user.status} />
          <span className="name">{m.user.name}{m.userId === currentUserId ? ' (you)' : ''}</span>
          <span className={`role-badge ${m.role}`}>{m.role}</span>
          {isAdmin && m.userId !== currentUserId && (
            <button className="remove-member-btn" onClick={() => onRemoveMember(m.userId)}>
              Remove
            </button>
          )}
        </div>
      ))}

      <div className="panel-actions">
        {isAdmin ? (
          <>
            <button className="btn-secondary" onClick={() => setRenaming(true)}>
              Change group name
            </button>
            <button className="btn-danger" onClick={onDeleteGroup}>
              Delete group
            </button>
          </>
        ) : (
          <button className="btn-danger" onClick={onLeaveGroup}>
            Leave group
          </button>
        )}
      </div>
    </aside>
  );
}
