export class Comment {
    constructor({ id, user_id, post_id, message, created_at }) {
      this.id = id;
      this.user_id = user_id;
      this.post_id = post_id;
      this.message = message;
      this.created_at = created_at;
    }
  }
  