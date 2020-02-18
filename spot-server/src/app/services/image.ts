export { uploadImage }

const fs = require("fs");


const imageBase = "../images/posts/"

function uploadImage(image: File) {
    saveImage(image);
}

// this function will be replaced to sending to s3 bucket
function saveImage(image: File) {
    fs.writeFile(imageBase + '/test', image, (err: any) => {
        if (err) {
            console.log(err);
        }
    })
}