export interface Notification {
    id: string;
    post_id: string;
    comment_id: string;
    reply_id: string;
    creation_date: string;
    username: string;
    image_src: string;
    image_nsfw: boolean;
    content: string;
    seen: number;
    link: string;
    comment_link: string;
    comment_image_src: string;
    comment_image_nsfw: boolean;
    comment_content: string;
    reply_image_src: string;
    reply_image_nsfw: boolean;
    reply_content: string;
}

// Get notifications
export interface GetNotificationsRequest {
    before?: string; // Date
    after?: string; // Date
    initialLoad: boolean;
    limit: number;
}
export interface GetNotificationsSuccess {
    notifications: Notification[];
    initialLoad: boolean;
    cursor: {
        before: string // Date
        after: string // Date
    };
}

// Add a notification
export interface AddNotificationRequest {
    receiver: string;
    postId: string;
    commentId?: string;
}

export interface AddNotificationSuccess {
    notification: Notification;
}

// Delete notifications
export interface DeleteNotificationRequest {
    notificationId: string;
}

export interface DeleteNotificationSuccess {
    notificationId: string;
}

export interface DeleteAllNotificationsRequest {

}

export interface DeleteAllNotificationsSuccess {

}

// Set notification Seen
export interface SetNotificationSeenRequest {
    notificationId: string;
}

export interface SetNotificationSeenSuccess {
    notificationId: string;
}

export interface SetAllNotificationsSeenRequest {

}

export interface SetAllNotificationsSeenSuccess {

}

// get unread notifications
export interface GetNotificationsUnreadRequest {

}

export interface GetNotificationsUnreadSuccess {
    unread: number;
}


// Tags
// Tag is only used on the front end / Converted to notifcation request
export interface Tag {
    username: string;
    postLink: string;
    offset: number;
}
