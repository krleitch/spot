declare const _default: {
    addProfilePicture: typeof addProfilePicture;
    getTags: typeof getTags;
    addTagsToContent: typeof addTagsToContent;
    generateLink: typeof generateLink;
    validContent: typeof validContent;
    inRange: typeof inRange;
};
export default _default;
declare function validContent(content: string): Error | null;
declare function addProfilePicture(comments: any, postCreator: string): Promise<any>;
declare function getTags(comments: any, accountId: string): Promise<any[]>;
declare function addTagsToContent(commentId: string, accountId: string, commentAccountId: string, commentContent: string): Promise<string>;
declare function generateLink(): Promise<string>;
declare function inRange(postId: string, latitude: number, longitude: number): Promise<boolean>;
