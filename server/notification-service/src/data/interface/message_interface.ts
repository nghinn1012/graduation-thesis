export interface createGroupChat {
  groupName: string,
  members: string[],
  createdBy: string,
  isPrivate: boolean
}

export interface ChatGroupDocument {
  _id: string;
  groupName: string;
  members: string[];
  createdBy: string;
  isPrivate: boolean;
  lastMessage: string;
  createdAt: Date;
  avatarUrl: string;
}

export interface PaginatedChatGroups {
  chatGroups: ChatGroupDocument[];
  totalCount: number;
  hasMore: boolean;
}

export interface ChatGroupQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  searchTerm?: string;
  lastCreatedAt?: Date;
  lastId?: string;
}
