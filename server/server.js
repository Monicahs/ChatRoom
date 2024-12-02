const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

// Store users in each room
const roomUsers = {};

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    if (!roomUsers[room]) {
      roomUsers[room] = [];
    }
    roomUsers[room].push({ username, socketId: socket.id });

    console.log(`${username} joined room ${room}`);

    socket.emit('message', `Welcome ${username} to the room!`);
    socket.to(room).emit('message', `${username} has joined the room.`);
  });

  socket.on('chatMessage', ({ room, username, message }) => {
    io.to(room).emit('message', `${username}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter(
        (user) => user.socketId !== socket.id
      );
      if (roomUsers[room].length === 0) {
        delete roomUsers[room];
      }
    }
  });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
