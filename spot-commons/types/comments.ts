export interface Comment {
    Id: string;
    PostId: string;
    UserId: string;
    CreationDate: string;
    Content: string;
    Likes: number;
    Dislikes: number;
}

export interface CommentsHash {
    [postId: string] : Comment[];
}
  
export interface AddCommentRequest {
    Content: string;
}

  