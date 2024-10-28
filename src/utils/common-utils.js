export function forkJoin(promises) {
  // Return a new promise
  return new Promise((resolve, reject) => {
    // Array to hold the results of all promises
    const results = [];
    let completedPromises = 0;

    // Check if the input is an array of promises
    if (!Array.isArray(promises)) {
      reject(new Error("Input must be an array of promises"));
      return;
    }

    // Loop through each promise
    promises.forEach((promise, index) => {
      // Ensure each item is a promise
      Promise.resolve(promise)
        .then((result) => {
          // Store result at the corresponding index
          results[index] = result;
          completedPromises++;

          // If all promises are completed, resolve with the results array
          if (completedPromises === promises.length) {
            resolve(results);
          }
        })
        .catch((error) => {
          // Reject immediately if any promise fails
          reject(error);
        });
    });

    // Handle empty array case
    if (promises.length === 0) {
      resolve(results);
    }
  });
}
