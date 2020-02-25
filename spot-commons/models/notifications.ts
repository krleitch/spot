export interface Notification {
    id: string;
    creation_date: string;
    seen: boolean;
    from: string;
    post: string;
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

// Delete a notification
export interface DeleteNotificationRequest {

}

export interface DeleteNotificationSuccess {

}
