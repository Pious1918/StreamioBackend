import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { CommentServiceClient as _CommentServiceClient, CommentServiceDefinition as _CommentServiceDefinition } from './CommentService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  CommentRequest: MessageTypeDefinition
  CommentResponse: MessageTypeDefinition
  CommentService: SubtypeConstructor<typeof grpc.Client, _CommentServiceClient> & { service: _CommentServiceDefinition }
  GetCommentsRequest: MessageTypeDefinition
  GetCommentsResponse: MessageTypeDefinition
}

