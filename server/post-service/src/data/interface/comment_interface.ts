export interface Comment {
  _id: string;
  userId: string;
  postId: string;
  content: string;
  parentCommentId: string;
  userMention: string[];
  replies: Comment[];
  likes: string[];
  createdAt: Date;
}

export interface createComment {
  content: string;
  parentCommentId: string;
  userMention: string[];
}
