const path = require("path");
const http = require("http");

const express = require("express");
const socketio = require("socket.io");

const Filter = require("bad-words");
const generateMessage = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, "../public");

app.use(express.static(publicDir));

// let count = 0;

io.on("connection", (socket) => {
  console.log("new web socket connection");
  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     //socket.emit("countUpdated", count); //will only emit to connection
  //     io.emit("countUpdated", count);
  //   });

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket
      .to(user.room)
      .broadcast.emit(
        "message",
        generateMessage(`${user.username} has joined`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed");
    }
    const sender = getUser(socket.id);
    io.to(sender.room).emit("message", generateMessage(sender.username, msg));
    callback();
  });

  socket.on("sendLocation", (mapURL, callback) => {
    const sender = getUser(socket.id);
    io.to(sender.room).emit(
      "locationMessage",
      generateMessage(sender.username, mapURL)
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log("server is up at ", PORT);
});
