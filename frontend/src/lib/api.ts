/// <reference types="vite/client" />
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getHeaders = () => {
  const sessionString = localStorage.getItem("foodienet-session");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      if (session.token) {
        headers["Authorization"] = `Bearer ${session.token}`;
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }
  return headers;
};

// Helper to fetch and automatically replace internal minio hostnames with localhost
const fetchJson = async (input: RequestInfo | URL, init?: RequestInit) => {
  const res = await fetch(input, init);
  const text = await res.text();
  
  if (!res.ok) throw new Error(text);
  if (!text) return null;

  // Replace internal docker minio hostname to localhost for frontend access
  const replacedText = text.replace(/:\/\/minio:9000/g, '://localhost:9000').replace(/:\/\/minio\b/g, '://localhost');
  
  try {
    return JSON.parse(replacedText);
  } catch (e) {
    return replacedText;
  }
};

export const api = {
  // Auth
  async login(username, password) {
    return fetchJson(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },
  
  async getProfile() {
    return fetchJson(`${API_URL}/api/profile`, { headers: getHeaders() });
  },

  // Users
  async register(username, password) {
    return fetchJson(`${API_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, roles: ["user"] }),
    });
  },

  async getUsers() {
    return fetchJson(`${API_URL}/api/users`, { headers: getHeaders() });
  },

  // Posts
  async getPosts(locationStr?: string) {
    const url = locationStr ? `${API_URL}/api/posts?location=${encodeURIComponent(locationStr)}` : `${API_URL}/api/posts`;
    return fetchJson(url, { headers: getHeaders() });
  },

  async getPresignedUrl(filename: string) {
    return fetchJson(`${API_URL}/api/posts/presigned-url?filename=${encodeURIComponent(filename)}`, { 
      headers: getHeaders() 
    });
  },

  async uploadToMinIO(uploadUrl: string, file: File) {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Failed to upload image to MinIO");
  },

  async createPost(data: any) {
    return fetchJson(`${API_URL}/api/posts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: string) {
    return fetchJson(`${API_URL}/api/posts/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  },

  // Likes
  async getLikes() {
    return fetchJson(`${API_URL}/api/likes`, { headers: getHeaders() });
  },
  
  async likePost(postId: string) {
    return fetchJson(`${API_URL}/api/likes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ post_id: parseInt(postId) }),
    });
  },

  async unlikePost(postId: string) {
    return fetchJson(`${API_URL}/api/likes/${postId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
  },

  // Comments
  async getComments() {
    return fetchJson(`${API_URL}/api/comments`, { headers: getHeaders() });
  },

  async addComment(postId: string, message: string) {
    return fetchJson(`${API_URL}/api/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ post_id: parseInt(postId), message }),
    });
  },

  async search(query: string) {
    return fetchJson(`${API_URL}/api/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
  }
};

