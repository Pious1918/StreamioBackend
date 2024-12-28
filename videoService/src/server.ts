import { Server } from 'socket.io';
import app from "./app";
import http from 'http';
import { createGRPCServer } from "./grpcServer/videoserver";
import { startWorker } from "./workers/videoworker";
import * as grpc from '@grpc/grpc-js';


const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('Client connected');

  // Join a video room for real-time updates
  socket.on('joinVideo', (videoId) => {
    socket.join(videoId);
    console.log(`Client joined video room: ${videoId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



const port = process.env.SERVER_PORT
const grpcServer = createGRPCServer()
const PORT = '50052'
grpcServer.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`videoservice grpc server running at http://0.0.0.0:${PORT}`);
  grpcServer;
});
grpcServer
startWorker().catch(console.error)
server.listen(port, () => {
  console.log(`videoService server running on ${port}`)
})