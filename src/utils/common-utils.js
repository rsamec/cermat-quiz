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

export const unique = (value, index, array) => array.indexOf(value) === index;

export function download(value, name = "untitled", label = "Save") {
  const a = document.createElement("a");
  const b = a.appendChild(document.createElement("button"));
  b.textContent = label;
  a.download = name;

  async function reset() {
    await new Promise(requestAnimationFrame);
    URL.revokeObjectURL(a.href);
    a.removeAttribute("href");
    b.textContent = label;
    b.disabled = false;
  }

  a.onclick = async (event) => {
    b.disabled = true;
    if (a.href) return reset(); // Already saved.
    b.textContent = "Saving…";
    try {
      const object = await (typeof value === "function" ? value() : value);
      const blob = new Blob([object], { type: "application/octet-stream" });
      b.textContent = "Download";
      a.href = URL.createObjectURL(blob); // eslint-disable-line require-atomic-updates
      if (event.eventPhase) return reset(); // Already downloaded.
      a.click(); // Trigger the download
    } catch (error) {
      console.error("Download error:", error);
      b.textContent = label;
    }
    b.disabled = false;
  };

  return a;
}

export function partionArray(array, predicate){
  return array.reduce((acc, d) => {
    if (predicate(d)){
      acc[0].push(d)
    }
    else {
      acc[1].push(d)
    }
    return acc    
  }, [[],[]])
}