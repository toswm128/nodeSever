const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

io.on("connection", socket => {
  socket.on("enter", (msg, done) => {
    console.log(msg);
    done();
  });

  socket.on("disconnect", () => {
    console.log("she's gone");
  });

  console.log("a user connected");
});

server.listen(3030, () => {
  console.log("listening on *:3030");
});
