// import { Injectable} from '@angular/core';

// import * as tf from '@tensorflow/tfjs'
// import { Observable } from 'rxjs';
// import * as nsfwjs from 'nsfwjs';

// import { environment } from 'src/environments/environment';

// // Uses tensorflowJS and nsfwJS to detect nsfw images and warn the user client side

// @Injectable({
//   providedIn: 'root'
// })
// export class ImageService {

//     modelSource = ''; //environment.baseUrl;
//     model: any;

//   constructor() {
//       if ( environment.production ) {
//         tf.enableProdMode();
//       }
//       this.loadModel();
//   }

//   public async loadModel() {

//     if ( this.modelSource ) {
//         this.model = await nsfwjs.load();
//     } else {
//         this.model = await nsfwjs.load();
//     }

//   }

//   public async predict(img: any) {
//     // Classify the image
//     const predictions = await this.model.classify(img);
//     console.log('Predictions: ', predictions);
//   }

// }
