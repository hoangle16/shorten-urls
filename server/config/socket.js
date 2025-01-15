const socketIO = require("socket.io");

let io = null;
const userSockets = new Map();

const initialize = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      method: ["GET", "POST"],
    },
  });

  setupEventHandlers();
  return io;
};

const setupEventHandlers = () => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("login", (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} logged in with socket ${socket.id}`);
    });

    socket.on("disconnect", () => {
      removeUserSocket(socket.id);
      console.log("Client disconnected:", socket.id);
    });
  });
};

const sendNotificationToUser = (userId, eventName, data) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(eventName, data);
    return true;
  }
  return false;
};

const broadcastNotification = (eventName, data) => {
  io.emit(eventName, data);
};

const removeUserSocket = (socketId) => {
  for (let [userId, id] of userSockets.entries()) {
    if (id === socketId) {
      userSockets.delete(userId);
      break;
    }
  }
};

const getUserSocketId = (userId) => {
  return userSockets.get(userId);
};

const getConnectedUsers = () => {
  return Array.from(userSockets.keys());
};

module.exports = {
  initialize,
  sendNotificationToUser,
  broadcastNotification,
  getUserSocketId,
  getConnectedUsers,
};
