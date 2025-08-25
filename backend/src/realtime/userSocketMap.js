export class UserSocketMap {
  constructor() {
    this._users = new Map();
  }

  getOnlineUsers() {
    return Array.from(this._users.keys());
  }

  getOne(userId) {
    return this._users.get(userId);
  }

  has(userId) {
    return this._users.has(userId);
  }

  add(userId, socketId) {
    if (userId && socketId) {
      this._users.set(userId, socketId);
    }
  }

  remove(userId) {
    if (userId && this._users.has(userId)) {
      this._users.delete(userId);
    }
  }
}
