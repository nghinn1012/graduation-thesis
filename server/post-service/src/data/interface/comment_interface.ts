export interface Comment {
  _id: string;
  userId: string;
  postId: string;
  comment: string;
  parentCommentId: string;
  userMention: string[];
  createdAt: Date;
}

export interface createComment {
  comment: string;
  parentCommentId: string;
  userMention: string[];
}
