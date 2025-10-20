import axios from "axios";

const apiUrl = process.env.API_URL || "http://backend:5000";

async function main() {
  try {
    console.log("🌱 Seeding users...");
    const users = [
      { username: "admin", password: "admin123", roles: ["user", "admin"] },
      { username: "user1", password: "userpass", roles: ["user"] },
    ];

    for (const user of users) {
      try {
        await axios.post(`${apiUrl}/api/users`, user);
        console.log(`✅ Created user: ${user.username}`);
      } catch (err) {
        if (err.response?.status === 409) {
          console.log(`⚠️ User ${user.username} already exists`);
        } else {
          console.error(`❌ Error creating user ${user.username}:`, err.message);
        }
      }
    }

    console.log("✅ Done seeding users!");
  } catch (err) {
    console.error("❌ Failed to seed users:", err);
    process.exit(1);
  }
}

main();
