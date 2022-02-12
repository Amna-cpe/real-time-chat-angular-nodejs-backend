const express = require("express");
const cors = require("cors");

const app = express();
const http = require("http");
const server = http.createServer(app);

const socketIO = require("socket.io")(server, {
  cors: {  
    origin:"*",    
  },
});

app.get("/", (req, res) => {
  res.send("hrlpp world");
});

let usersList = new Map();

socketIO.on("connection", (socket) => {
  // socket contains usersname , basic info about clients
  let username = socket.handshake.query.username;
  addUser(username, socket.id);

  socket.broadcast.emit("user-list", [...usersList.keys()]);
  socket.emit("user-list", [...usersList.keys()]);

  socket.on("message", (msg) => {
    socket.broadcast.emit("message-broadcast", {
      message: msg,
      username: username,
    });
  });

  socket.on("disconnect", (reason) => {
    removeUser(username, socket.id);
  });
});

const addUser = (username, id) => {
  if (!usersList.has(username)) {
    usersList.set(username, new Set(id));
  } else {
    usersList.get(username).add(id);
  }
};

const removeUser = (username, id) => {
  if (usersList.has(username)) {
    let userIds = usersList.get(username);
    if (userIds.size === 0) {
      usersList.delete(username);
    }
  }
};
// app.use(express.json());

server.listen(process.env.PORT || 3000, async () => {
  console.log("connected to server on 3000");
});
