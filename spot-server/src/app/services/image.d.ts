export { upload, predictNsfw, predictNsfwLambda };
declare const upload: any;
declare function predictNsfw(imgUrl: string): Promise<boolean>;
declare function predictNsfwLambda(imgUrl: string): Promise<any>;
