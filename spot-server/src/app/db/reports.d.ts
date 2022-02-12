export { addPostReport, addCommentReport };
declare function addPostReport(postId: string, accountId: string, content: string, category: number): Promise<any>;
declare function addCommentReport(postId: string, commentId: string, accountId: string, content: string, category: number): Promise<any>;
