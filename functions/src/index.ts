import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import sharp from "sharp";

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger: When a new comment is created in posts/{postId}/comments/{commentId}
 * Goal: Send a notification to the author of the post.
 */
export const sendCommentNotification = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onCreate(async (snap, context) => {
    const { postId } = context.params;
    const commentData = snap.data();
    
    // 1. Fetch the parent Post to find who to notify
    const postRef = db.collection("posts").doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      console.log("Post does not exist, skipping notification.");
      return;
    }

    const postData = postSnap.data();
    const postAuthorId = postData?.authorId;
    const postTitle = postData?.title || "your post";

    // 2. Safety Check: Do not notify if the commenter is the post author
    if (commentData.authorId === postAuthorId) {
      console.log("User commented on their own post, skipping notification.");
      return;
    }

    // 3. Create the Notification Object
    const notificationPayload = {
      message: `${commentData.authorName} commented on: "${postTitle.substring(0, 30)}..."`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      link: `/post/${postId}`, // Deep link to the post
      type: "comment_reply"
    };

    // 4. Write to the user's notification subcollection
    try {
      await db
        .collection("users")
        .doc(postAuthorId)
        .collection("notifications")
        .add(notificationPayload);
        
      console.log(`Notification sent to user ${postAuthorId}`);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

/**
 * Trigger: When a comment is created OR deleted
 * Goal: Maintain an accurate 'commentsCount' on the parent post.
 */
export const updatePostCommentCount = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onWrite(async (change, context) => {
    const { postId } = context.params;
    const postRef = db.collection("posts").doc(postId);

    if (!change.before.exists && change.after.exists) {
      // Document Created
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(1)
      });
    } else if (change.before.exists && !change.after.exists) {
      // Document Deleted
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(-1)
      });
    }
  });

/**
 * Trigger: When a new message is added to chats/{chatId}/messages/{messageId}
 * Goal: Send a Push Notification (FCM) to the recipient(s).
 */
export const sendChatNotification = functions.firestore
  .document("chats/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const { chatId } = context.params;
    const messageData = snap.data();
    const senderId = messageData.senderId;
    const textContent = messageData.text || (messageData.imageUrl ? "📷 Sent an image" : "Sent a message");

    // 1. Get Chat Metadata
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();
    
    if (!chatSnap.exists) return;
    
    const chatData = chatSnap.data();
    const participantIds: string[] = chatData?.participantIds || [];

    // 2. Identify Recipients
    const recipientIds = participantIds.filter(uid => uid !== senderId);

    // 3. Get Sender Name
    const senderName = chatData?.participantNames?.[senderId] || "New Message";

    // 4. Send Notification to each recipient
    const sendPromises = recipientIds.map(async (recipientId) => {
      const userDoc = await db.collection("users").doc(recipientId).get();
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken; 

      if (!fcmToken) {
        console.log(`No FCM token found for user ${recipientId}`);
        return;
      }

      const message = {
        token: fcmToken,
        notification: {
          title: senderName,
          body: textContent,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK', // Keeping strictly as per your request
          type: 'CHAT_MESSAGE',
          chatId: chatId,
        }
      };

      try {
        await admin.messaging().send(message);
        console.log(`Notification sent to ${recipientId}`);
      } catch (error) {
        console.error(`Error sending to ${recipientId}:`, error);
      }
    });

    await Promise.all(sendPromises);
  });

/**
 * Trigger: When a file is uploaded to Storage
 * Goal: Resize profile images and update the User Firestore document.
 */
export const onProfileImageUpload = functions.storage.object().onFinalize(async (object) => {
  const fileBucket = object.bucket;
  const filePath = object.name; 
  const contentType = object.contentType; 

  // 1. Validation Checks
  if (!filePath || !contentType) return console.log("No file path or content type.");
  if (!contentType.startsWith("image/")) return console.log("This is not an image.");
  
  // Only process images in the "profile_images" folder
  if (!filePath.startsWith("profile_images/")) return console.log("Not a profile image.");

  // Avoid infinite loops: Don't process images that are already resized
  if (filePath.includes("resized")) return console.log("Already resized.");

  const fileName = path.basename(filePath);
  const bucket = admin.storage().bucket(fileBucket);

  // 2. Metadata Extraction
  // We need the userId attached in the frontend to know which doc to update
  const metadata = object.metadata;
  const userId = metadata?.userId;

  if (!userId) {
    return console.log("No userId found in metadata. Cannot update Firestore.");
  }

  // 3. Download the file to temp storage
  const tempFilePath = path.join(os.tmpdir(), fileName);
  await bucket.file(filePath).download({ destination: tempFilePath });
  
  // 4. Resize the Image (e.g., 200x200 thumbnail)
  const thumbFileName = `thumb_${fileName}`;
  const thumbFilePath = path.join(os.tmpdir(), thumbFileName);

  await sharp(tempFilePath)
    .resize(200, 200, { fit: 'cover' }) // Square crop for avatars
    .toFile(thumbFilePath);

  // 5. Upload the Resized Image
  // We store it in a 'resized' subfolder to keep things organized
  const thumbStoragePath = `profile_images/${userId}/resized/${thumbFileName}`;
  
  await bucket.upload(thumbFilePath, {
    destination: thumbStoragePath,
    metadata: {
      contentType: contentType, 
      metadata: { userId: userId } 
    }
  });

  // 6. Get the Public URL
  // We generate a long-lived signed URL for the avatar
  const fileRef = bucket.file(thumbStoragePath);
  
  const [downloadUrl] = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-01-2125' // Valid for ~100 years
  });

  // 7. Update Firestore
  await db.collection("users").doc(userId).update({
    avatarUrl: downloadUrl
  });

  // Cleanup temp files
  await fs.remove(tempFilePath);
  await fs.remove(thumbFilePath);

  console.log(`Avatar updated for user ${userId}`);
  return null;
});