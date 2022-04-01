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

io.on("connection", socket => {
  socket.join("room");
  socket.on("enter", msg => {
    console.log(msg);
    socket.to("room").emit("post", msg);
  });
});

server.listen(3030, () => {
  console.log("listening on *:3030");
});
