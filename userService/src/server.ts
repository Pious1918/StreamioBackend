// to start the server

import app from "./app";
import { createGRPCServer } from "./grpcServer/userserver";
import * as grpc from '@grpc/grpc-js';


const port = process.env.SERVER_PORT || 5002

const grpcServer = createGRPCServer()
const PORT = '50054'



grpcServer.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`userservice GRPC server running at http://0.0.0.0:${PORT}`);
    grpcServer;
});
grpcServer

app.listen(port, () => {
    console.log(`UserService server running on ${port}`)
})