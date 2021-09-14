const express = require("express");
const app = express();
path = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cors = require("cors");
app.use(cors());
let socket_to_settings = {};
let socket_to_signal = {};
let waiting_dict = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("requestSettings", function (callUrl) {
    if (socket_to_settings[callUrl]) {
      socket.emit("clientReceiveSettings", socket_to_settings[callUrl]);
    } else if (socket_to_signal[callUrl]) {
      socket.emit("clientReceiveSettings", false);
    } else {
      waiting_dict[callUrl] = socket.id.toString();
    }
  });

  socket.on("newSignal", function (call, data, settings) {
    if (call !== "") {
      io.to(call).emit("connectToPeer", data);
    } else {
      socket_to_signal[socket.id.toString()] = data;
      socket_to_settings[socket.id.toString()] = settings;
      if (waiting_dict[socket.id.toString()]) {
        io.to(waiting_dict[socket.id.toString()]).emit(
          "clientReceiveSettings",
          settings
        );
        delete waiting_dict[socket.id.toString()];
      }
    }
  });
  socket.on("requestConnection", function (callUrl) {
    if (socket_to_signal[callUrl]) {
      socket.emit("connectToPeer", socket_to_signal[callUrl]);
    }
  });
  socket.on("disconnect", function (reason) {
    console.log("user disconnected", reason);
    if (socket_to_signal[socket.id]) {
      console.log("Disconnect, deleting: " + socket.id.toString());
      delete socket_to_signal[socket.id];
    }
    if (socket_to_settings[socket.id]) {
      delete socket_to_settings[socket.id];
    }
  });
});

http.listen(8888, () => {
  console.log("listening on *:8888");
});
