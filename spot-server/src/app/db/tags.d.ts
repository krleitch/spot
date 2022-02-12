declare const _default: {
    addTag: typeof addTag;
    getTagsByCommentId: typeof getTagsByCommentId;
    TaggedInCommentChain: typeof TaggedInCommentChain;
};
export default _default;
declare function addTag(accountId: string, commentId: string, offset: number): Promise<any>;
declare function getTagsByCommentId(commentId: string): Promise<any>;
declare function TaggedInCommentChain(commentId: string, accountId: string): Promise<boolean>;
