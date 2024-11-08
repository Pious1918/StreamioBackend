// import * as grpc from '@grpc/grpc-js';
// import * as protoLoader from '@grpc/proto-loader';
// import path from 'path';

// // const PROTO_PATH = path.resolve(__dirname, '../../commentService/src/comment.proto');
// const PROTO_PATH = path.resolve(__dirname, '../../commentService/src/comment.proto');

// const packageDef = protoLoader.loadSync(PROTO_PATH, {});
// const commentProto = grpc.loadPackageDefinition(packageDef) as grpc.GrpcObject & {
//   CommentService: grpc.ServiceClientConstructor;
// };

// interface CommentServiceClient extends grpc.Client {
//   GetComments(
//     call: { videoId: string },
//     callback: (error: grpc.ServiceError | null, response: { comments: string[] }) => void
//   ): void;
// }

// export class CommentServiceClientWrapper {
//   private client: CommentServiceClient;

//   constructor() {
//     this.client = new commentProto.CommentService(
//       'localhost:50052', // Adjust the address as per your setup
//       grpc.credentials.createInsecure()
//     ) as unknown as CommentServiceClient;
//   }

//   public getAllComments(videoId: string): Promise<string[]> {
//     return new Promise((resolve, reject) => {
//       this.client.GetComments({ videoId }, (error, response) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(response.comments);
//         }
//       });
//     });
//   }
// }
