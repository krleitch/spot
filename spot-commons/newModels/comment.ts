export enum CommentRatingType {
  NONE = "NONE",
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

export interface Comment {
  commentId: string;
  owner: string;
  spotId: string;
  parentCommentId: string;
  createdAt: Date;
  deletedAt: Date;
  content: string;
  imageSrc: string | null;
  imageNsfw: boolean | null;
  likes: number;
  dislikes: number;
  rated: number;
  link: string;
  profilePicture: number; // The enumeration of the image (colour)
  profilePictureSrc: number; // The image
  tag: CommentTag;
}

export interface CommentTag {
  owned: boolean;
  numTagged: number;
  tagged: boolean;
  tagger?: string;
  tags: any[];
}
