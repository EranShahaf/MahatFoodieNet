export class Post {
    constructor({ image_path, title, body, tags, user_id, rating, location }) {
      this.image_path = image_path;
      this.title = title;
      this.body = body;
      this.tags = tags;
      this.user_id = user_id;
      this.rating = rating || 0;
      this.location = location;
    }
}