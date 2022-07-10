import app from './app.js';

const port = process.env.PORT || 3000;


app
  .listen(port, () => {
    console.log(`Spot Server is listening on port ${port}`);
  })
  .on('error', (err: Error) => {
    console.log(`Error listening`, err);
  });

// Make this a module
export {};
