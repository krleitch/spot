export interface Post {
    id: string;
    creation_date: string;
    creator: string;
    longitude: number;
    latitude: number;
    content: string;
    likes: number;
    dislikes: number;
}

export interface AddPostRequest {
    content: string
}
