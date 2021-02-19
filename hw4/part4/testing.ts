var promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Async is done!");
      resolve();
    }, 1500);
});