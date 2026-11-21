# Poké Pack Lab: Set up the two-person private chat

**For a parent/guardian to set up.** The pack game works without these steps; only the Chat tab needs internet.

The Chat tab is designed for exactly two approved Firebase accounts. It does NOT use the public GitHub issue, and messages cannot be read by people outside those accounts when the Firestore security rules are installed. This is a privately access-controlled chat, **not end-to-end encrypted**.

## One-time setup

1. Visit https://console.firebase.google.com/ and create a Firebase project. The free Spark plan is sufficient for modest family messages (subject to provider limits). Register a **Web app** and copy its `firebaseConfig` values. Do not put personal passwords in code.
2. In **Authentication → Sign-in method**, enable **Email/Password**. In **Authentication → Users**, make exactly two parent-managed logins, one for the parent and one for the player. Copy each account's **UID** from the Users page. Use strong, different passwords known only to the intended users. A parent should manage accounts for younger children.
3. In **Firestore Database**, create a database in **Production mode**. Select **Rules**, paste the contents of `docs/firestore.rules`, replace `REPLACE_WITH_DADS_FIREBASE_UID` and `REPLACE_WITH_PLAYERS_FIREBASE_UID` with the actual two UIDs, then **Publish**. These rules only permit those accounts to read or send chat messages.
4. In GitHub, edit `docs/chat-config.js` in the game's repository. Replace `null` with your Firebase Web app config, for example:
   ```js
   window.POKE_PRIVATE_CHAT_CONFIG = {
     apiKey: "YOUR_WEB_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT",
     appId: "YOUR_APP_ID"
   };
   ```
   Firebase web app config is not a secret; **the Firestore rules are essential**. Never add email/password logins, service-account keys, or secret credentials to the public GitHub repository.
5. Open the game on both devices, go to **Chat**, and log in using the respective two accounts. Check that they can send messages to each other. You can optionally test a third unauthorised Firebase user: it must see *Permission denied*, not the conversation.

## How the chat works

- Chat uses Cloud Firestore with realtime updates. It displays the last 100 messages, and only the two allowed UIDs can read or write.
- Chat history is kept in your own Firebase project, not in the repository.
- The message bubble shows **You** or **Other player**, not email addresses.
- Messages cannot be edited or deleted through the game. The parent can manage data in Firebase Console when needed.
- Chat is unavailable offline; packs, coin wallet, and binder still work offline (subject to their existing artwork behaviour).
- Browser storage on each device retains the login where supported. Sign out from within the Chat tab to switch accounts.
- If the game is opened in a restricted HTML viewer, online chat connections may be blocked. Use a regular browser or a properly hosted PWA.

## Important

Keep the Firestore rules restrictive. Using rules such as `allow read, write: if true;` would make the conversation publicly accessible. Use a domain, hosting platform, or app settings appropriate for your family and comply with provider age and privacy requirements.
