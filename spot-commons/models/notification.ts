
export enum NotificationType {
  INFO = "INFO",
  TAG = "TAG",
  ALERT = "ALERT",
}

// Todo, organize fields for types better, data: type
export interface Notification {
    notificationId: string;
    spotId: string | null; // is a spot id associated?
    commentId: string | null; // is a comment id associated?
    replyId: string | null; // is a reply id associated?
    createdAt: Date;
    username?: string;
    imageSrc?: string;
    imageNsfw?: boolean;
    content: string | null; // is there content?
    seen: boolean;
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
// Get 
export interface GetNotificationsRequest {
    before?: string;
    after?: string;
    initialLoad: boolean;
    limit: number;
}
export interface GetNotificationsResponse {
    notifications: Notification[];
    cursor: {
        before: string | undefined
        after: string | undefined
    };
}

// Create a notification
export interface CreateTagNotificationRequest {
    receiver: string; // username
    spotId: string;
    commentId?: string;
    replyId?: string;
}
export interface CreateTagNotificationResponse {
    notification: Notification;
}

// Delete
export interface DeleteNotificationRequest {
    notificationId: string;
}
export interface DeleteNotificationResponse {}
export interface DeleteAllNotificationsRequest {}
export interface DeleteAllNotificationsResponse {}

// Set notification Seen
export interface SetNotificationSeenRequest {
    notificationId: string;
}
export interface SetNotificationSeenResponse {}
export interface SetAllNotificationsSeenRequest {}
export interface SetAllNotificationsSeenResponse {}

// Get unseen notifications
export interface GetUnseenNotificationsRequest {}
export interface GetUnseenNotificationsResponse {
    totalUnseen: number;
}


// Tags
// Tag is only used on the front end / Converted to notifcation request
export interface NotificationTag {
    username: string;
    spotLink: string;
    offset: number;
}
