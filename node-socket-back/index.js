const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});
const members = new Map();
const rooms = [];

io.on("connection", socket => {
  // members.push({ id: socket.id, room: "" });
  members.set(socket.id, { room: "" });
  console.log(socket.id);
  socket.on("goRoom", room => {
    socket.join(room);
    // members[members.findIndex(member => member.id == socket.id)].room = room;
    members.set(socket.id, { room: room });
    console.log(`'${room}' 방에 입장함`);
    socket.to(room).emit("comeRoom", room);
  });
  socket.on("getOffer", offer => {
    console.log("##offer 받음##");
    socket.to(members.get(socket.id).room).emit("postOffer", offer);
    console.log(`## ${members.get(socket.id).room}방에 offer보냄##`);
  });
  socket.on("getAnswer", answer => {
    console.log("##answer 받음##");
    socket.to(members.get(socket.id).room).emit("postAnswer", answer);
    console.log(`## ${members.get(socket.id).room}방에 answer 보냄##`);
  });
  socket.on("getIce", ice => {
    // console.log("##ice 받음##");
    socket.to(members.get(socket.id).room).emit("postIce", ice);
    // console.log(`## ${members.get(socket.id).room}방에 ice 보냄##`);
  });

  socket.on("enter", data => {
    console.log(data.text, socket.id, data.room);
    socket.to(data.room).emit("post", data);
  });

  socket.on("disconnect", () => {
    // members.splice(
    //   members.findIndex(member => member.id == socket.id),
    //   1
    // );
    members.delete(socket.id);
  });
});

server.listen(3030, () => {
  console.log("listening on *:3030");
});
