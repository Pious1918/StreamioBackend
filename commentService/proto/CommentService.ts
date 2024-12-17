// Original file: proto/comment.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CommentRequest as _CommentRequest, CommentRequest__Output as _CommentRequest__Output } from './CommentRequest';
import type { CommentResponse as _CommentResponse, CommentResponse__Output as _CommentResponse__Output } from './CommentResponse';
import type { GetCommentsRequest as _GetCommentsRequest, GetCommentsRequest__Output as _GetCommentsRequest__Output } from './GetCommentsRequest';
import type { GetCommentsResponse as _GetCommentsResponse, GetCommentsResponse__Output as _GetCommentsResponse__Output } from './GetCommentsResponse';

export interface CommentServiceClient extends grpc.Client {
  GetComments(argument: _GetCommentsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  GetComments(argument: _GetCommentsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  GetComments(argument: _GetCommentsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  GetComments(argument: _GetCommentsRequest, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  getComments(argument: _GetCommentsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  getComments(argument: _GetCommentsRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  getComments(argument: _GetCommentsRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  getComments(argument: _GetCommentsRequest, callback: grpc.requestCallback<_GetCommentsResponse__Output>): grpc.ClientUnaryCall;
  
  PostComment(argument: _CommentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  PostComment(argument: _CommentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  PostComment(argument: _CommentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  PostComment(argument: _CommentRequest, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  postComment(argument: _CommentRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  postComment(argument: _CommentRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  postComment(argument: _CommentRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  postComment(argument: _CommentRequest, callback: grpc.requestCallback<_CommentResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface CommentServiceHandlers extends grpc.UntypedServiceImplementation {
  GetComments: grpc.handleUnaryCall<_GetCommentsRequest__Output, _GetCommentsResponse>;
  
  PostComment: grpc.handleUnaryCall<_CommentRequest__Output, _CommentResponse>;
  
}

export interface CommentServiceDefinition extends grpc.ServiceDefinition {
  GetComments: MethodDefinition<_GetCommentsRequest, _GetCommentsResponse, _GetCommentsRequest__Output, _GetCommentsResponse__Output>
  PostComment: MethodDefinition<_CommentRequest, _CommentResponse, _CommentRequest__Output, _CommentResponse__Output>
}
