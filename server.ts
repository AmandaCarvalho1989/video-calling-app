import express from "express";
import http from "http";
import { Socket } from "socket.io";
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: Socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log("callUser: ", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log("answerCall: ", {
      to: data.to,
      signal: data.signal,
    });
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(5001, () => console.log("server is running on port 5001"));
export default server;
