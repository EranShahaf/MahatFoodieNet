import axios from "axios";
import { Client } from "minio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MinIO client configuration
const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true" || false,
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
  });
  
const apiUrl = process.env.API_URL || "http://backend:5000";

// Helper function to generate random data
function randomString(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random user data
function generateRandomUser() {
  const adjectives = ["cool", "awesome", "amazing", "fantastic", "brilliant", "stellar", "epic", "radiant"];
  const nouns = ["chef", "foodie", "gourmet", "taster", "critic", "explorer", "adventurer", "enthusiast"];
  return {
    username: `${randomElement(adjectives)}_${randomElement(nouns)}_${randomInt(1000, 9999)}`,
    password: `Pass${randomString(10)}!`,
    roles: ["user"]
  };
}

// Generate random post data
function generateRandomPost() {
  const titles = [
    "Amazing Pizza Experience",
    "Best Burger in Town",
    "Delicious Pasta Night",
    "Incredible Sushi Adventure",
    "Perfect Steak Dinner",
    "Wonderful Brunch Spot",
    "Fantastic Coffee Shop",
    "Great Ice Cream Place"
  ];
  
  const bodies = [
    "This place exceeded all my expectations! The food was incredible and the service was top-notch.",
    "I've been here multiple times and it never disappoints. Highly recommend!",
    "The atmosphere was perfect and the flavors were out of this world.",
    "A hidden gem that everyone should know about. The quality is outstanding!",
    "From appetizers to dessert, everything was perfect. Will definitely come back!",
    "The chef really knows what they're doing. Every dish was a masterpiece.",
    "Great value for money. The portions were generous and the taste was amazing.",
    "I'm already planning my next visit. This place is a must-try!"
  ];
  
  const locations = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "San Francisco, CA",
    "Miami, FL",
    "Boston, MA",
    "Seattle, WA",
    "Austin, TX"
  ];
  
  const tagOptions = [
    ["italian", "pizza", "dinner"],
    ["burger", "american", "lunch"],
    ["pasta", "italian", "dinner"],
    ["sushi", "japanese", "dinner"],
    ["steak", "american", "dinner"],
    ["brunch", "breakfast", "cafe"],
    ["coffee", "cafe", "breakfast"],
    ["dessert", "ice-cream", "sweet"]
  ];
  
  return {
    title: randomElement(titles),
    body: randomElement(bodies),
    tags: randomElement(tagOptions),
    rating: randomInt(1, 5),
    location: randomElement(locations)
  };
}

// Generate random comment
function generateRandomComment() {
  const comments = [
    "Totally agree! This place is amazing!",
    "I need to try this place soon!",
    "Great review, thanks for sharing!",
    "The photos look incredible!",
    "Adding this to my must-visit list!",
    "Sounds like a perfect spot!",
    "I've been there too, can confirm it's great!",
    "Thanks for the recommendation!"
  ];
  return randomElement(comments);
}

// Upload a random image to MinIO
async function uploadRandomImageToMinIO(bucketName, userId) {
  try {
    // Get list of available images
    const imagesDir = path.join(__dirname, "init_images");
    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      file.endsWith('.jfif') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );
    
    if (imageFiles.length === 0) {
      console.log(`⚠️  No image files found in ${imagesDir}`);
      return null;
    }
    
    // Select a random image
    const randomImageFile = randomElement(imageFiles);
    const imagePath = path.join(imagesDir, randomImageFile);
    
    console.log(`   Selected random image: ${randomImageFile}`);
    console.log(`   Reading image from: ${imagePath}`);
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const fileExtension = path.extname(randomImageFile);
    
    // Generate a unique object name for the post
    const timestamp = Date.now();
    const randomSuffix = randomString(6);
    const objectName = `posts/${timestamp}-${randomSuffix}${fileExtension}`;
    
    console.log(`   Uploading to MinIO bucket: ${bucketName}, object: ${objectName}`);
    
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`   Creating bucket: ${bucketName}`);
      await minioClient.makeBucket(bucketName, "us-east-1");
    }
    
    // Upload the image
    await minioClient.putObject(bucketName, objectName, imageBuffer, {
      "Content-Type": `image/${fileExtension === '.jfif' ? 'jpeg' : fileExtension.slice(1)}`,
    });
    
    console.log(`✅ Image uploaded successfully!`);
    
    // Generate the MinIO file path/URL
    const useSSL = process.env.MINIO_USE_SSL === "true" || false;
    const protocol = useSSL ? "https" : "http";
    const endpoint = process.env.MINIO_ENDPOINT || "minio";
    const port = parseInt(process.env.MINIO_PORT || "9000");
    const imageUrl = `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
    
    console.log(`   Image URL: ${imageUrl}`);
    
    return imageUrl;
  } catch (error) {
    console.error(`❌ Error uploading image to MinIO:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Starting Full Flow Script");
    console.log("=" .repeat(60));
    
    // Step 1: Create a user
    console.log("\n📝 Step 1: Creating a new user...");
    const userData = generateRandomUser();
    console.log(`   Generated user data:`, {
      username: userData.username,
      password: "***hidden***",
      roles: userData.roles
    });
    
    let userResponse;
    try {
      userResponse = await axios.post(`${apiUrl}/api/users`, userData);
      console.log(`✅ User created successfully!`);
      console.log(`   User ID: ${userResponse.data.id}`);
      console.log(`   Username: ${userResponse.data.username}`);
      console.log(`   Roles: ${userResponse.data.roles?.join(", ") || "N/A"}`);
      console.log(`   Full user data:`, JSON.stringify(userResponse.data, null, 2));
    } catch (err) {
      if (err.response?.status === 409) {
        console.log(`⚠️  User ${userData.username} already exists`);
        console.log(`   Will proceed with authentication using existing user...`);
        // If user exists, we'll try to login with it
        userResponse = { data: { username: userData.username } };
      } else {
        console.error(`❌ Error creating user:`, err.response?.data || err.message);
        throw err;
      }
    }
    
    // Step 2: Authenticate with the user
    console.log("\n🔐 Step 2: Authenticating user...");
    console.log(`   Attempting login with username: ${userData.username}`);
    
    let token;
    try {
      const authResponse = await axios.post(`${apiUrl}/api/login`, {
        username: userData.username,
        password: userData.password
      });
      token = authResponse.data.token;
      console.log(`✅ Authentication successful!`);
      console.log(`   Token received: ${token.substring(0, 20)}...`);
      console.log(`   Full auth response:`, JSON.stringify(authResponse.data, null, 2));
    } catch (err) {
      console.error(`❌ Authentication failed:`, err.response?.data || err.message);
      throw new Error("Failed to authenticate user");
    }
    
    const authHeaders = {
      Authorization: `Bearer ${token}`
    };
    
    // Step 3: Upload a random image to MinIO
    console.log("\n🖼️  Step 3: Uploading a random image to MinIO...");
    const currentUserId = userResponse?.data?.id;
    const bucketName = userResponse?.data?.bucket || `user-${currentUserId}`;
    
    let imageUrl = null;
    if (currentUserId) {
      try {
        imageUrl = await uploadRandomImageToMinIO(bucketName, currentUserId);
        console.log(`✅ Image uploaded successfully!`);
        console.log(`   Image URL: ${imageUrl}`);
      } catch (err) {
        console.error(`⚠️  Failed to upload image:`, err.message);
        console.log(`   Continuing without image...`);
      }
    } else {
      console.log(`⚠️  User ID not available, skipping image upload...`);
    }
    
    // Step 4: Create a post
    console.log("\n📮 Step 4: Creating a new post...");
    const postData = generateRandomPost();
    if (imageUrl) {
      postData.image = imageUrl;
    }
    console.log(`   Generated post data:`, postData);
    
    const postResponse = await axios.post(
      `${apiUrl}/api/posts`,
      postData,
      { headers: authHeaders }
    );
    const post = postResponse.data;
    console.log(`✅ Post created successfully!`);
    console.log(`   Post ID: ${post.id}`);
    console.log(`   Title: ${post.title}`);
    console.log(`   Full post data:`, JSON.stringify(post, null, 2));
    
    // Step 5: Like the post
    console.log("\n❤️  Step 5: Liking the post...");
    console.log(`   Liking post ID: ${post.id}`);
    
    const likeResponse = await axios.post(
      `${apiUrl}/api/likes`,
      { post_id: post.id },
      { headers: authHeaders }
    );
    console.log(`✅ Post liked successfully!`);
    console.log(`   Like ID: ${likeResponse.data.id}`);
    console.log(`   Full like data:`, JSON.stringify(likeResponse.data, null, 2));
    
    // Step 6: Add a comment to the post
    console.log("\n💬 Step 6: Adding a comment to the post...");
    const commentText = generateRandomComment();
    console.log(`   Comment text: "${commentText}"`);
    console.log(`   Post ID: ${post.id}`);
    
    const commentResponse = await axios.post(
      `${apiUrl}/api/comments`,
      {
        post_id: post.id,
        message: commentText
      },
      { headers: authHeaders }
    );
    console.log(`✅ Comment added successfully!`);
    console.log(`   Comment ID: ${commentResponse.data.id}`);
    console.log(`   Full comment data:`, JSON.stringify(commentResponse.data, null, 2));
    
    // Step 7: Read the post and extract all info
    console.log("\n📖 Step 7: Reading the post and extracting all information...");
    console.log(`   Fetching all posts to find post ID: ${post.id}`);
    
    const postsResponse = await axios.get(`${apiUrl}/api/posts`);
    const allPosts = postsResponse.data;
    const foundPost = allPosts.find(p => p.id === post.id);
    
    if (!foundPost) {
      console.log(`⚠️  Post ${post.id} not found in the list. Fetching all posts data...`);
      console.log(`   Total posts found: ${allPosts.length}`);
    } else {
      console.log(`✅ Post found!`);
      console.log(`   Post ID: ${foundPost.id}`);
      console.log(`   Title: ${foundPost.title}`);
      console.log(`   Body: ${foundPost.body}`);
      console.log(`   Tags: ${foundPost.tags || "N/A"}`);
      console.log(`   Rating: ${foundPost.rating || "N/A"}`);
      console.log(`   Location: ${foundPost.location || "N/A"}`);
      console.log(`   Username: ${foundPost.username || "N/A"}`);
      console.log(`   Created at: ${foundPost.created_at || "N/A"}`);
      console.log(`   Image path: ${foundPost.image_path || "N/A"}`);
    }
    
    // Get all likes for this post
    console.log(`\n   Fetching likes for post ${post.id}...`);
    const likesResponse = await axios.get(`${apiUrl}/api/likes`);
    const postLikes = likesResponse.data.filter(l => l.post_id === post.id);
    console.log(`   Found ${postLikes.length} like(s) for this post`);
    if (postLikes.length > 0) {
      console.log(`   Likes data:`, JSON.stringify(postLikes, null, 2));
    }
    
    // Get all comments for this post
    console.log(`\n   Fetching comments for post ${post.id}...`);
    const commentsResponse = await axios.get(`${apiUrl}/api/comments`);
    const postComments = commentsResponse.data.filter(c => c.post_id === post.id);
    console.log(`   Found ${postComments.length} comment(s) for this post`);
    if (postComments.length > 0) {
      console.log(`   Comments data:`, JSON.stringify(postComments, null, 2));
    }
    
    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SUMMARY");
    console.log("=".repeat(60));
    const userId = userResponse?.data?.id || post?.user_id || foundPost?.user_id || "N/A";
    console.log(`✅ User: ${userData.username} (ID: ${userId})`);
    console.log(`✅ Authenticated: Token received`);
    if (imageUrl) {
      console.log(`✅ Image uploaded: ${imageUrl}`);
    }
    console.log(`✅ Post created: "${post.title}" (ID: ${post.id})`);
    console.log(`✅ Post liked: Like ID ${likeResponse.data.id}`);
    console.log(`✅ Comment added: "${commentText}" (ID: ${commentResponse.data.id})`);
    console.log(`✅ Post retrieved: Found with ${postLikes.length} like(s) and ${postComments.length} comment(s)`);
    console.log("\n🎉 Full flow completed successfully!");
    console.log("=".repeat(60));
    
  } catch (err) {
    console.error("\n❌ Error in full flow script:");
    if (err.response) {
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Message: ${err.response.data?.message || err.message}`);
      console.error(`   Response data:`, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(`   Error: ${err.message}`);
      console.error(`   Stack: ${err.stack}`);
    }
    process.exit(1);
  }
}

main();

