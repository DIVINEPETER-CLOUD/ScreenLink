const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 1e6 });

app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();

app.get("/new-room", (_req, res) => {
  const room = crypto.randomBytes(16).toString("hex");
  res.set("Cache-Control", "no-store");
  res.json({ room });
});

io.on("connection", socket => {
  socket.on("join-room", ({ room, role } = {}) => {
    if (typeof room !== "string" || !/^[a-f0-9]{32}$/.test(room)) return;
    if (!["host", "viewer"].includes(role)) return;

    const members = rooms.get(room) || { host: null, viewer: null };

    if (role === "host" && members.host && members.host !== socket.id) {
      socket.emit("room-error", "A screen sharer is already connected to this room.");
      return;
    }
    if (role === "viewer" && members.viewer && members.viewer !== socket.id) {
      socket.emit("room-error", "This demo room already has a viewer.");
      return;
    }

    members[role] = socket.id;
    rooms.set(room, members);
    socket.data.room = room;
    socket.data.role = role;
    socket.join(room);
    socket.emit("room-ready", { role });

    if (members.host && members.viewer) {
      io.to(members.host).emit("viewer-available");
    }
  });

  // The viewer creates the offer; the host answers it.
  socket.on("webrtc-offer", offer => {
    if (socket.data.role !== "viewer" || !socket.data.room) return;
    const members = rooms.get(socket.data.room);
    if (members?.host) io.to(members.host).emit("webrtc-offer", offer);
  });

  socket.on("webrtc-answer", answer => {
    if (socket.data.role !== "host" || !socket.data.room) return;
    const members = rooms.get(socket.data.room);
    if (members?.viewer) io.to(members.viewer).emit("webrtc-answer", answer);
  });

  socket.on("webrtc-ice", candidate => {
    if (!socket.data.room || !["host", "viewer"].includes(socket.data.role)) return;
    socket.to(socket.data.room).emit("webrtc-ice", candidate);
  });

  socket.on("stop-sharing", () => {
    if (socket.data.room) socket.to(socket.data.room).emit("sharing-stopped");
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.room;
    const members = rooms.get(roomId);
    if (!members) return;
    if (members.host === socket.id) {
      members.host = null;
      socket.to(roomId).emit("sharing-stopped");
    }
    if (members.viewer === socket.id) members.viewer = null;
    if (!members.host && !members.viewer) rooms.delete(roomId);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`ScreenLink running on port ${port}`));
