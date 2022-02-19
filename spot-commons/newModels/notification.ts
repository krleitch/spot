
export enum NotificationType {
  INFO = "INFO",
  TAG = "TAG",
  ALERT = "ALERT",
}

// Todo, organize fields for types better, data: type
export interface Notification {
    notificationId: string;
    spotId?: string;
    commentId?: string;
    replyId?: string;
    createdAt: string;
    username?: string;
    imageSrc?: string;
    imageNsfw?: boolean;
    content: string;
    seen: number;
    link?: string;
    type: NotificationType;
    commentLink?: string;
    commentImageSrc?: string;
    commentImageNsfw?: boolean;
    commentContent?: string;
    replyImageSrc?: string;
    replyImageNsfw?: boolean;
    replyContent?: string;
    replyLink?: string;
}