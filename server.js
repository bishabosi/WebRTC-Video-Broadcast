const express = require("express");
const app = express();
var http = require("http").createServer(app);
var port = process.env.PORT || 3000;
var io = require("socket.io")(http);

let broadcaster;

app.use(express.static("public"));
app.use("*", checkHttps)

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/cast", (request, response) => {
  response.sendFile(__dirname + "/views/broadcast.html");
});

function checkHttps(req, res, next) {
  if (req.get("X-Forwarded-Proto").indexOf("https") != -1) {
    return next();
  } else {
    res.redirect("https://" + req.hostname + req.url);
  }
}

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
http.listen(port, () => {
  console.log("listening on *:" + port);
});
