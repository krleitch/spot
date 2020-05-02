export interface Notification {
    id: string;
    post_id: string;
    creation_date: string;
    username: string;
    image_src: string;
    content: string;
    seen: number;
    link: string;
}

// Get notifications
export interface GetNotificationsRequest {
    offset: number;
    limit: number;
}

export interface GetNotificationsSuccess {
    notifications: Notification[];
    offset: number;
}

// Add a notification
export interface AddNotificationRequest {
    receiver: string;
    postLink: string
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
export interface Tag {
    receiver: string;
    username: string;
    postLink: string;
}
