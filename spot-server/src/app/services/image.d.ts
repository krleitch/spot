import multer from 'multer';
declare function predictNsfw(imgUrl: string): Promise<boolean>;
declare function predictNsfwLambda(imgUrl: string): Promise<any>;
declare const _default: {
    upload: multer.Multer;
    predictNsfw: typeof predictNsfw;
    predictNsfwLambda: typeof predictNsfwLambda;
};
export default _default;
