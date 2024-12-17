



const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const usernames = [];
const userids = [];
const messages = []; // Mocking message persistence

io.on("connection", (socket) => {
  console.log("user connected");

  // Emit chat history when a user connects
  socket.emit("chatHistory", messages);

  socket.on("disconnect", () => {
    console.log("user disconnected");
    const index = userids.indexOf(socket.id);
    if (index !== -1) {
      const username = usernames[index];
      usernames.splice(index, 1);
      userids.splice(index, 1);
      io.emit("updateUserList", usernames);
    }
  });

  socket.on("userconnected", (name) => {
    usernames.push(name);
    userids.push(socket.id);
    io.emit("updateUserList", usernames);
  });

  // Handling typing indicator
  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("message", (message) => {
    const index = userids.indexOf(socket.id);
    const username = usernames[index];
    const timestamp = new Date().toLocaleTimeString();
    const messageDetails = { message: message.trim(), username, id: socket.id, timestamp };

    messages.push(messageDetails); // Persist message (mocked with an array)
    io.emit("message", messageDetails);
  });
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

server.listen(3000, () => {
  console.log("server is running on http://localhost:3000");
});
