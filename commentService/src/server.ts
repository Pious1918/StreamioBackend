import app from "./app";
import {createGRPCServer} from "../src/grpcServer/commentServer"
import * as grpc from '@grpc/grpc-js';

const port = process.env.SERVER_PORT 

const grpcServer = createGRPCServer()
const PORT = '50051';
grpcServer.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  grpcServer;
});
grpcServer

app.listen(port , ()=>{
    console.log(`commentService server running on ${port}`)
})