// Fake data standing in for what will eventually come from the backend API / database.

function avatarFor(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export const currentUser = {
  id: 'u0',
  name: 'You',
  email: 'you@example.com',
  avatar: avatarFor('You'),
};

export const users = [
  { id: 'u1', name: 'Ahmed', email: 'ahmed@example.com', avatar: avatarFor('Ahmed'), status: 'online', lastSeen: null },
  { id: 'u2', name: 'Sara', email: 'sara@example.com', avatar: avatarFor('Sara'), status: 'offline', lastSeen: '2026-09-22T09:15:00Z' },
  { id: 'u3', name: 'Bilal', email: 'bilal@example.com', avatar: avatarFor('Bilal'), status: 'online', lastSeen: null },
  { id: 'u4', name: 'Hina', email: 'hina@example.com', avatar: avatarFor('Hina'), status: 'offline', lastSeen: '2026-09-21T20:40:00Z' },
  { id: 'u5', name: 'Usman', email: 'usman@example.com', avatar: avatarFor('Usman'), status: 'online', lastSeen: null },
];

// userId -> array of messages exchanged with currentUser
export const conversations = {
  u1: [
    { id: 'm1', senderId: 'u1', text: 'Hey! Are you free to test the chat app?', timestamp: '2026-09-22T08:00:00Z' },
    { id: 'm2', senderId: 'u0', text: 'Yes, just opened it.', timestamp: '2026-09-22T08:01:00Z' },
    { id: 'm3', senderId: 'u1', text: 'Nice, looks great so far!', timestamp: '2026-09-22T08:01:30Z' },
  ],
  u2: [
    { id: 'm4', senderId: 'u2', text: 'Did you push the changes?', timestamp: '2026-09-21T18:20:00Z' },
  ],
  u3: [],
  u4: [],
  u5: [
    { id: 'm5', senderId: 'u0', text: 'Let’s catch up later today.', timestamp: '2026-09-22T07:45:00Z' },
  ],
};

export const groups = [
  {
    id: 'g1',
    name: 'Project Team',
    avatar: avatarFor('Project Team'),
    members: [
      { userId: 'u0', role: 'admin' },
      { userId: 'u1', role: 'member' },
      { userId: 'u3', role: 'member' },
    ],
    messages: [
      { id: 'gm1', senderId: 'u1', text: 'Welcome to the group!', timestamp: '2026-09-22T07:00:00Z' },
      { id: 'gm2', senderId: 'u0', text: 'Thanks, glad to be here.', timestamp: '2026-09-22T07:05:00Z' },
    ],
  },
  {
    id: 'g2',
    name: 'Friends',
    avatar: avatarFor('Friends'),
    members: [
      { userId: 'u0', role: 'member' },
      { userId: 'u2', role: 'admin' },
      { userId: 'u4', role: 'member' },
      { userId: 'u5', role: 'member' },
    ],
    messages: [
      { id: 'gm3', senderId: 'u2', text: 'Anyone up for a game tonight?', timestamp: '2026-09-21T19:00:00Z' },
    ],
  },
];

export function findUserById(id) {
  if (id === currentUser.id) return currentUser;
  return users.find((u) => u.id === id) || null;
}

const CANNED_REPLIES = [
  "Sounds good!",
  "Got it, thanks.",
  "Haha, true.",
  "Let me check and get back to you.",
  "Okay 👍",
  "That works for me.",
];

export function randomReply() {
  return CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
}
