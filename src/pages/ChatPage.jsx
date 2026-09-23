import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow, { formatStatusLine } from '../components/ChatWindow';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupMembersPanel from '../components/GroupMembersPanel';
import {
  currentUser,
  users as initialUsers,
  groups as initialGroups,
  conversations as initialConversations,
  findUserById,
} from '../mockData';
import { socket } from '../mockSocket';
import '../styles/chat.css';

export default function ChatPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState(initialUsers);
  const [groups, setGroups] = useState(initialGroups);
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedChat, setSelectedChat] = useState(null); // { type: 'user'|'group', id }
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [typingUsers, setTypingUsers] = useState({}); // key: userId or `${groupId}:${userId}` -> true

  function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  }

  // --- Socket.IO practice: listening for events pushed by the "server" ---
  useEffect(() => {
    function handleUserOnline({ userId }) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: 'online', lastSeen: null } : u)));
    }
    function handleUserOffline({ userId }) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'offline', lastSeen: new Date().toISOString() } : u))
      );
    }
    function handlePrivateMessage(message) {
      setConversations((prev) => ({
        ...prev,
        [message.senderId]: [...(prev[message.senderId] || []), message],
      }));
    }
    function handleGroupMessage({ groupId, message }) {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, messages: [...g.messages, message] } : g))
      );
    }
    function handleTypingStart({ fromUserId, groupId }) {
      const key = groupId ? `${groupId}:${fromUserId}` : fromUserId;
      setTypingUsers((prev) => ({ ...prev, [key]: true }));
    }
    function handleTypingStop({ fromUserId, groupId }) {
      const key = groupId ? `${groupId}:${fromUserId}` : fromUserId;
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }

    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('private:message', handlePrivateMessage);
    socket.on('group:message', handleGroupMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('private:message', handlePrivateMessage);
      socket.off('group:message', handleGroupMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, []);

  const selectUser = useCallback((user) => {
    setSelectedChat({ type: 'user', id: user.id });
    setShowMembersPanel(false);
    setSidebarVisible(false);
  }, []);

  const selectGroup = useCallback((group) => {
    setSelectedChat({ type: 'group', id: group.id });
    setShowMembersPanel(false);
    setSidebarVisible(false);
  }, []);

  function handleSendPrivateMessage(text) {
    const toUserId = selectedChat.id;
    const message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setConversations((prev) => ({
      ...prev,
      [toUserId]: [...(prev[toUserId] || []), message],
    }));
    socket.emit('private:message', { toUserId, message });
  }

  function handleSendGroupMessage(text) {
    const group = groups.find((g) => g.id === selectedChat.id);
    const message = {
      id: `gm${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    };
    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, messages: [...g.messages, message] } : g))
    );
    const otherMemberIds = group.members.map((m) => m.userId).filter((id) => id !== currentUser.id);
    socket.emit('group:message', { groupId: group.id, senderIds: otherMemberIds });
  }

  function handleCreateGroup({ name, memberIds }) {
    const newGroup = {
      id: `g${Date.now()}`,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      members: [
        { userId: currentUser.id, role: 'admin' },
        ...memberIds.map((id) => ({ userId: id, role: 'member' })),
      ],
      messages: [],
    };
    setGroups((prev) => [...prev, newGroup]);
    setShowCreateGroup(false);
    selectGroup(newGroup);
  }

  function handleRemoveMember(userId) {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedChat.id ? { ...g, members: g.members.filter((m) => m.userId !== userId) } : g
      )
    );
  }

  function handleRenameGroup(newName) {
    setGroups((prev) => prev.map((g) => (g.id === selectedChat.id ? { ...g, name: newName } : g)));
  }

  function handleDeleteGroup() {
    setGroups((prev) => prev.filter((g) => g.id !== selectedChat.id));
    setSelectedChat(null);
    setShowMembersPanel(false);
    setSidebarVisible(true);
  }

  function handleLeaveGroup() {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedChat.id
          ? { ...g, members: g.members.filter((m) => m.userId !== currentUser.id) }
          : g
      )
    );
    setSelectedChat(null);
    setShowMembersPanel(false);
    setSidebarVisible(true);
  }

  function handleTyping(isTyping) {
    // In a real backend this would emit 'typing:start' / 'typing:stop' to the
    // other participant(s). The mock server only simulates the OTHER side
    // typing (see mockSocket.js), so there's nothing to emit here yet.
  }

  function handleBack() {
    setSelectedChat(null);
    setShowMembersPanel(false);
    setSidebarVisible(true);
  }

  const selectedUser = selectedChat?.type === 'user' ? findUserById(selectedChat.id) : null;
  const selectedGroup = selectedChat?.type === 'group' ? groups.find((g) => g.id === selectedChat.id) : null;

  let chatContent = <div className="chat-placeholder">Select a user or group to start chatting</div>;

  if (selectedUser) {
    const messages = conversations[selectedUser.id] || [];
    const isTyping = !!typingUsers[selectedUser.id];
    chatContent = (
      <ChatWindow
        title={selectedUser.name}
        avatar={selectedUser.avatar}
        statusLine={formatStatusLine(selectedUser.status, selectedUser.lastSeen)}
        messages={messages}
        currentUserId={currentUser.id}
        typingLabel={isTyping ? selectedUser.name : null}
        onSend={handleSendPrivateMessage}
        onTyping={handleTyping}
        onBack={handleBack}
      />
    );
  } else if (selectedGroup) {
    const membersWithUser = selectedGroup.members
      .map((m) => ({ ...m, user: findUserById(m.userId) }))
      .filter((m) => m.user);
    const isAdmin = selectedGroup.members.some((m) => m.userId === currentUser.id && m.role === 'admin');
    const typingMember = membersWithUser.find((m) => typingUsers[`${selectedGroup.id}:${m.userId}`]);

    chatContent = (
      <ChatWindow
        title={selectedGroup.name}
        avatar={selectedGroup.avatar}
        statusLine={`${membersWithUser.length} members`}
        messages={selectedGroup.messages}
        currentUserId={currentUser.id}
        getSenderName={(id) => findUserById(id)?.name}
        typingLabel={typingMember?.user.name}
        onSend={handleSendGroupMessage}
        onTyping={handleTyping}
        onBack={handleBack}
        headerAction={
          <button className="header-action" onClick={() => setShowMembersPanel((v) => !v)}>
            Members
          </button>
        }
      />
    );
  }

  return (
    <div className="chat-app">
      <Sidebar
        currentUser={currentUser}
        users={users}
        groups={groups.filter((g) => g.members.some((m) => m.userId === currentUser.id))}
        conversations={conversations}
        selectedChat={selectedChat}
        onSelectUser={selectUser}
        onSelectGroup={selectGroup}
        onCreateGroup={() => setShowCreateGroup(true)}
        onLogout={handleLogout}
        className={sidebarVisible ? '' : 'hidden'}
      />

      {chatContent}

      {showMembersPanel && selectedGroup && (
        <GroupMembersPanel
          group={selectedGroup}
          members={selectedGroup.members.map((m) => ({ ...m, user: findUserById(m.userId) })).filter((m) => m.user)}
          currentUserId={currentUser.id}
          isAdmin={selectedGroup.members.some((m) => m.userId === currentUser.id && m.role === 'admin')}
          onClose={() => setShowMembersPanel(false)}
          onRemoveMember={handleRemoveMember}
          onRenameGroup={handleRenameGroup}
          onDeleteGroup={handleDeleteGroup}
          onLeaveGroup={handleLeaveGroup}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal
          users={users}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}
