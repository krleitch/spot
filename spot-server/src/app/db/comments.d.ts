export { addComment, deleteCommentById, deleteReplyByParentId, getCommentByPostId, getNumberOfRepliesForCommentAfterDate, getNumberOfRepliesForComment, addReply, getRepliesByCommentId, getNumberOfCommentsForPost, getRepliesUpToDate, likeComment, dislikeComment, getCommentsActivity, getCommentById, getCommentByLink, getNumberOfCommentsForPostAfterDate, getNumberOfCommentsForPostBeforeDate, getCommentByPostIdNoAccount, getCommentByIdNoAccount, linkExists, unratedComment, checkOwned, updateNsfw };
declare function getCommentById(commentId: string, accountId: string): Promise<any>;
declare function getCommentByIdNoAccount(commentId: string): Promise<any>;
declare function getCommentByPostId(postId: string, date: string, limit: number, type: string, accountId: string): Promise<any>;
declare function getCommentByPostIdNoAccount(postId: string, date: string, limit: number, type: string): Promise<any>;
declare function addComment(commentId: string, postId: string, accountId: string, content: string, image: string, imageNsfw: boolean, link: string, commentParentId: string): Promise<any>;
declare function deleteCommentById(commentId: string): Promise<any>;
declare function deleteReplyByParentId(parentId: string): Promise<any>;
declare function addReply(replyId: string, postId: string, commentId: string, commentParentId: string, accountId: string, content: string, image: string, imageNsfw: boolean, link: string): Promise<any>;
declare function getRepliesByCommentId(postId: string, commentId: string, date: string, limit: number, accountId?: string): Promise<any>;
declare function getRepliesUpToDate(postId: string, commentId: string, date: string, accountId?: string): Promise<any>;
declare function getNumberOfCommentsForPost(postId: string): Promise<any>;
declare function getNumberOfCommentsForPostBeforeDate(postId: string, date: string): Promise<any>;
declare function getNumberOfCommentsForPostAfterDate(postId: string, date: string): Promise<any>;
declare function getNumberOfRepliesForCommentAfterDate(postId: string, commentId: string, date: string): Promise<any>;
declare function getNumberOfRepliesForComment(postId: string, commentId: string): Promise<any>;
declare function likeComment(commentId: string, accountId: string): Promise<any>;
declare function dislikeComment(commentId: string, accountId: string): Promise<any>;
declare function unratedComment(commentId: string, accountId: string): Promise<any>;
declare function getCommentsActivity(accountId: string, before: Date, after: Date, limit: number): any;
declare function getCommentByLink(link: string, accountId?: string): any;
declare function linkExists(link: string): any;
declare function checkOwned(postId: string, accountId: string): any;
declare function updateNsfw(commentId: string, nsfw: boolean): any;
