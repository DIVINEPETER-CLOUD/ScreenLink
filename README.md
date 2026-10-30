# ScreenLink

A small, consent-based screen-sharing website prototype.

## Upload to GitHub
1. Download and extract `ScreenLink_Project.zip`.
2. In your GitHub repository, choose **Add file → Upload files**.
3. Upload `server.js`, `package.json`, `README.md`, and the `public` folder (including `index.html`).
4. Click **Commit changes**.

The repository root should contain `server.js`, `package.json`, `README.md`, and `public/index.html`.

## Deploy
This is a Node.js app. A typical host should use:
- Build/install command: `npm install`
- Start command: `npm start`

The host must provide HTTPS for browser screen capture. The app listens on `process.env.PORT`.

## Test locally
Install Node.js, open a terminal in this folder, then run:
```bash
npm install
npm start
```
Open `http://localhost:3000`.

## How it works
The sharer explicitly chooses a screen or window in the browser's screen-sharing prompt. The viewer can only see the stream after the sharer grants permission. The sharer can stop sharing at any time.

## Limitations and safety
- This is an early prototype, not a production-ready service.
- It supports one sharer and one viewer per room.
- Room links act like temporary access keys; only send them to the intended person.
- It uses a public STUN server. Some networks require a TURN server for reliable connections.
- There are no user accounts, waiting-room approval, or abuse-reporting tools yet.
- Never use screen sharing to view someone else's screen without their knowledge and permission.
