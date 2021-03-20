const chokidar = require('chokidar');
const fs = require('fs');

// TODO get from param
const watchedFile = "test.raw";
// One-liner for current directory
chokidar.watch('./*').on('all', (event, path) => {
  
  if(path.indexOf(watchedFile) >= 0){
    switch (event) {
      case "add":
        console.log(`Added watched file: ${path}`);
        break;
      case "change":
        console.log(`Changed watched file: ${path}`);
        break;
      default:
        console.log(`Unhandled event: ${event}`);
        break;
    }
  }
});
