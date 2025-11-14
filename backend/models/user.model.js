// models/user.model.js
export class User {
    constructor({ id, username, password_hash, roles = [] }) {
      this.id = id;
      this.username = username;
      this.password_hash = password_hash;
      this.roles = roles;
    }
  }