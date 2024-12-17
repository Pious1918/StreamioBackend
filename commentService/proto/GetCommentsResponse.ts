// Original file: proto/comment.proto

import type { Comment as _Comment, Comment__Output as _Comment__Output } from './Comment';

export interface GetCommentsResponse {
  'status'?: (string);
  'comments'?: (_Comment)[];
}

export interface GetCommentsResponse__Output {
  'status'?: (string);
  'comments'?: (_Comment__Output)[];
}
