export { addTag, getTagsByCommentId, TaggedInCommentChain };
declare function addTag(accountId: string, commentId: string, offset: number): Promise<any>;
declare function getTagsByCommentId(commentId: string): Promise<any>;
declare function TaggedInCommentChain(commentId: string, accountId: string): Promise<boolean>;
