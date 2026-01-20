import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

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
    // This matches your 'Notification' interface in types.ts
    const notificationPayload = {
      message: `${commentData.authorName} commented on: "${postTitle.substring(0, 30)}..."`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      link: `/post/${postId}`, // Deep link to the post
      type: "comment_reply" // Optional: helpful for icon logic on frontend
    };

    // 4. Write to the user's notification subcollection
    // Target: users/{postAuthorId}/notifications
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
 * Note: This replaces the client-side 'increment(1)' in PostDetail.tsx
 */
export const updatePostCommentCount = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onWrite(async (change, context) => {
    const { postId } = context.params;
    const postRef = db.collection("posts").doc(postId);

    // Determine if this was a create, delete, or update operation
    if (!change.before.exists && change.after.exists) {
      // Document Created: Increment count
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(1)
      });
    } else if (change.before.exists && !change.after.exists) {
      // Document Deleted: Decrement count
      await postRef.update({
        commentsCount: admin.firestore.FieldValue.increment(-1)
      });
    }
  });