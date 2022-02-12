declare const _default: {
    getPosts: typeof getPosts;
    getPostById: typeof getPostById;
    addPost: typeof addPost;
    likePost: typeof likePost;
    dislikePost: typeof dislikePost;
    deletePost: typeof deletePost;
    getPostCreator: typeof getPostCreator;
    getPostByLink: typeof getPostByLink;
    getPostsActivity: typeof getPostsActivity;
    getPostByIdNoAccount: typeof getPostByIdNoAccount;
    linkExists: typeof linkExists;
    unratedPost: typeof unratedPost;
    checkOwned: typeof checkOwned;
    updateNsfw: typeof updateNsfw;
};
export default _default;
declare function getPosts(accountId: string, sort: string, location: string, latitude: number, longitude: number, offset: number, limit: number, date: string): Promise<any>;
declare function getPostById(postId: string, accountId: string): Promise<any>;
declare function getPostByIdNoAccount(postId: string): Promise<any>;
declare function addPost(postId: string, content: string, location: any, imageSrc: string, imageNsfw: boolean, link: string, accountId: string, geolocation: string): Promise<any>;
declare function likePost(postId: string, accountId: string): Promise<any>;
declare function dislikePost(postId: string, accountId: string): Promise<any>;
declare function unratedPost(postId: string, accountId: string): Promise<any>;
declare function deletePost(id: string): Promise<any>;
declare function getPostCreator(postId: string): any;
declare function getPostByLink(link: string, accountId?: string): any;
declare function getPostsActivity(accountId: string, before: Date | null, after: Date | null, limit: number): any;
declare function linkExists(link: string): any;
declare function checkOwned(postId: string, accountId: string): any;
declare function updateNsfw(postId: string, nsfw: boolean): any;
