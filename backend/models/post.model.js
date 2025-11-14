export class Post {
    constructor({ id, image_path, title, body, tags, user_id, rating, location, created_at }) {
      this.id = id;
      this.image_path = image_path;
      this.title = title;
      this.body = body;
      this.tags = tags;
      this.user_id = user_id;
      this.rating = rating || 0;
      this.location = location;
      this.created_at = created_at;
    }
}