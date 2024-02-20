import chokidar from "chokidar";
import { Server } from "socket.io";

export default (server, publicPath) => {
  const io = new Server(server);

  let roomIds = {};

  io.on("connection", (socket) => {
    console.log("New client connection");

    socket.on("disconnect", async () => {
      console.log("Client disconnected");
      io.emit("playerLost", roomIds[socket.id]);
      if (typeof roomIds[socket.id] !== "undefined") {
        delete roomIds[socket.id];
      }
    });

    socket.on("roomUpdate", (msg) => {
      console.log(socket.id);
      console.log(msg["id"] + ": " + msg["message"]);
      roomIds[socket.id] = msg["id"];
      io.emit("roomUpdate", msg);
    });
  });

  chokidar.watch(publicPath, {
    cwd: publicPath, ignoreInitial: true
  }).on("all", (type, path) => {
    if (type.endsWith("Dir")) return;
    if (path.endsWith(".css")) {
      io.emit("cssChange", path);
    } else {
      io.emit("reload");
    }
  });
};
