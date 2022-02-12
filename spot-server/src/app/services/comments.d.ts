export { addProfilePicture, getTags, addTagsToContent, generateLink, validContent, inRange };
declare function validContent(content: string): Error | null;
declare function addProfilePicture(comments: any, postCreator: string): Promise<any>;
declare function getTags(comments: any, accountId: string): Promise<any[]>;
declare function addTagsToContent(commentId: string, accountId: string, commentAccountId: string, commentContent: string): Promise<string>;
declare function generateLink(): Promise<string>;
declare function inRange(postId: string, latitude: number, longitude: number): Promise<boolean>;
