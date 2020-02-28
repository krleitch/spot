export interface Notification {
    // id: string;
    // creation_date: string;
    // seen: boolean;
    // post_id: string;
    // username: string;
    id: string;
    post_id: string;
    creation_date: string;
    username: string;
    image_src: string;
    content: string;
    seen: boolean;
}

// Get notifications
export interface GetNotificationsRequest {

}

export interface GetNotificationsSuccess {
    notifications: Notification[];
}

// Add a notification
export interface AddNotificationRequest {
    receiver: string;
    postId: string
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
