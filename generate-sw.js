// generate-sw.js
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Read the template
let content = fs.readFileSync('./firebase-messaging-sw.template.js', 'utf8');

// Replace placeholders with actual values from .env
content = content.replace('{{VITE_FIREBASE_API_KEY}}', process.env.VITE_FIREBASE_API_KEY);
content = content.replace('{{VITE_FIREBASE_AUTH_DOMAIN}}', process.env.VITE_FIREBASE_AUTH_DOMAIN);
content = content.replace('{{VITE_FIREBASE_PROJECT_ID}}', process.env.VITE_FIREBASE_PROJECT_ID);
content = content.replace('{{VITE_FIREBASE_STORAGE_BUCKET}}', process.env.VITE_FIREBASE_STORAGE_BUCKET);
content = content.replace('{{VITE_FIREBASE_MESSAGING_SENDER_ID}}', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
content = content.replace('{{VITE_FIREBASE_APP_ID}}', process.env.VITE_FIREBASE_APP_ID);

// Write the final file to the public folder
fs.writeFileSync('./public/firebase-messaging-sw.js', content);

console.log('✅ Service Worker generated successfully with env variables.');