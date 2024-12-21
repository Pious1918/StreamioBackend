import { Server } from 'socket.io';
import app from './app'
import http from 'http';



const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  path: '/live-service',  // Ensure this path matches the frontend
});





// ******************************************************************
const roomviewerCount: any = {};



//when client is connecting a connection event is triggered 
io.on('connection', (socket) => {
  console.log("New client connected");

  ///here when the streamer emits the event start-streaming with socket.emit("start-streaming") from the frontend::: in the backend it listens with socket.on()
  socket.on('start-streaming', (roomId, streamerId) => {
    console.log(`Streamer started streaming: Room ID:${roomId} , Streamer ID:${streamerId}`);
    roomviewerCount[roomId] = roomviewerCount[roomId] || 0;

    //here it is emitting an event globally to inform all the client about the new stream
    io.emit('new-stream', { roomId, streamerId });

    // Join the streamer to the room
    socket.join(roomId);
    socket.to(roomId).emit('stream-start', { roomId, streamerId });
  });




  ///this is for viewers to join the stream. This event is emitted from the frontend when a viewer tries to join a room
  socket.on('join-stream', (roomId, viewerId) => {
    console.log(`Viewer joined. Room ID:${roomId} , Viewer ID: ${viewerId}`);
    roomviewerCount[roomId] = (roomviewerCount[roomId] || 0) + 1;
  
    // Notify the streamer that a viewer has joined
    socket.to(roomId).emit('new-viewer', viewerId);
  
    // Notify the viewer with the stream's information
    socket.to(roomId).emit('viewer-joined', { viewerId, roomId });
  
    // Join the viewer to the room
    socket.join(roomId);
  });



  socket.on('chat-message', (message) => {
    const { roomId, user, text } = message;

    // Logging a message to the console indicating who sent the message in which room
    console.log(`User ${user} sent a message in room ${roomId}: ${text}`);

    // Broadcasting  the message to everyone in the room, including the sender
    io.in(roomId).emit('chat-message', { user, text });
  });
  
  

  // Handling WebRTC signaling messages
  socket.on('signal', ({ roomId, signalData, fromPeerId, toPeerId }) => {
    io.to(roomId).emit('signal', { signalData, fromPeerId, toPeerId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


// ******************************************************************************
const port = process.env.SERVER_PORT

server.listen(port, () => {
  console.log(`liveService server running on ${port}`)
})

