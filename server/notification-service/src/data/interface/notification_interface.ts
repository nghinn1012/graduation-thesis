export enum NotificationType {
  Mention = 'mention',
  Follow = 'follow',
  Like = 'like',
  SuggestedPost = 'suggested_post'
}

export interface NotificationInfo {
  userIds: string[],
  message: string,
  type: NotificationType,
  link: string,
  reads: string[],
  createdAt: string
}

export interface NotificationToUser extends NotificationInfo {
  userId: string,
  read: boolean,
}
