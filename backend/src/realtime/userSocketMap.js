export class UserSocketMap {
  constructor() {
    this._users = new Map();
  }

  getOnlineUsers() {
    return Array.from(this._users.keys());
  }

  getOne(userId) {
    const userIdStr = userId.toString();
    const sockets = this._users.get(userIdStr);
    return sockets ? Array.from(sockets)[0] : undefined;
  }

  has(userId) {
    const userIdStr = userId.toString();
    const sockets = this._users.get(userIdStr);
    return sockets && sockets.size > 0;
  }

  add(userId, socketId) {
    if (userId && socketId) {
      const userIdStr = userId.toString();

      if (!this._users.has(userIdStr)) {
        this._users.set(userIdStr, new Set());
      }

      this._users.get(userIdStr).add(socketId);
    }
  }

  remove(userId, socketId) {
    const userIdStr = userId.toString();

    if (this._users.has(userIdStr)) {
      const userSockets = this._users.get(userIdStr);
      userSockets.delete(socketId);

      if (userSockets.size === 0) {
        this._users.delete(userIdStr);
      }
    }
  }
}
