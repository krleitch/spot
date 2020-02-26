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
