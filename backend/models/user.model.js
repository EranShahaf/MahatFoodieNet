// models/user.model.js
export class User {
    constructor(id, username, password, roles = []) {
      this.id = id;
      this.username = username;
      this.password = password;
      this.roles = roles;
    }
  }