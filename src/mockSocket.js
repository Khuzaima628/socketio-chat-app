// Fake stand-in for a socket.io-client connection.
//
// Exposes the same shape you'd get from `io(URL)`: on / off / emit.
// Internally it just uses timers to simulate events a real Socket.IO
// server would push. When the real backend is ready, replace the
// contents of this file with an actual `socket.io-client` instance -
// every component that imports `socket` from here can stay unchanged.

import { users, randomReply } from './mockData';

class MockSocket {
  constructor() {
    this.listeners = {}; // eventName -> Set of callbacks
    this._startPresenceSimulation();
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(callback);
  }

  off(event, callback) {
    this.listeners[event]?.delete(callback);
  }

  _emitLocal(event, payload) {
    this.listeners[event]?.forEach((cb) => cb(payload));
  }

  // Mimics the client calling socket.emit(...) to send something to the "server".
  emit(event, payload) {
    if (event === 'private:message') {
      // Simulate the other user seeing it, typing, then replying.
      const { toUserId } = payload;
      this._emitLocal('typing:start', { fromUserId: toUserId });
      setTimeout(() => {
        this._emitLocal('typing:stop', { fromUserId: toUserId });
        this._emitLocal('private:message', {
          id: `m${Date.now()}`,
          senderId: toUserId,
          text: randomReply(),
          timestamp: new Date().toISOString(),
        });
      }, 1500 + Math.random() * 1000);
    }

    if (event === 'group:message') {
      const { groupId, senderIds } = payload;
      if (!senderIds || senderIds.length === 0) return;
      const replierId = senderIds[Math.floor(Math.random() * senderIds.length)];
      this._emitLocal('typing:start', { fromUserId: replierId, groupId });
      setTimeout(() => {
        this._emitLocal('typing:stop', { fromUserId: replierId, groupId });
        this._emitLocal('group:message', {
          groupId,
          message: {
            id: `gm${Date.now()}`,
            senderId: replierId,
            text: randomReply(),
            timestamp: new Date().toISOString(),
          },
        });
      }, 1500 + Math.random() * 1000);
    }

    // 'typing:start' / 'typing:stop' emitted by the local user are not
    // echoed back to themselves - a real server would broadcast them to
    // the other participant(s), which is out of scope for this mock.
  }

  // Randomly flips users online/offline every few seconds, like a real
  // presence system would broadcast 'user:online' / 'user:offline'.
  _startPresenceSimulation() {
    this._presenceTimer = setInterval(() => {
      const candidate = users[Math.floor(Math.random() * users.length)];
      const nextStatus = candidate.status === 'online' ? 'offline' : 'online';
      candidate.status = nextStatus;
      candidate.lastSeen = nextStatus === 'offline' ? new Date().toISOString() : null;
      this._emitLocal(nextStatus === 'online' ? 'user:online' : 'user:offline', {
        userId: candidate.id,
      });
    }, 8000);
  }

  destroy() {
    clearInterval(this._presenceTimer);
    this.listeners = {};
  }
}

export const socket = new MockSocket();
