const chokidar = require('chokidar');
const fs = require('fs');
const zeropad = (number) => ("0000" + number).slice(-4);
// TODO get from param
const watchedFilePath = "test.raw";
// TODO get folder from param / call
const folderPath = "./";
// get file parts
const watchedFileArray = watchedFilePath.split(".");
const fileExtension = watchedFileArray[watchedFileArray.length - 1];
const filePrefix = watchedFilePath.replace("." + fileExtension, "");
console.log(`Running on "${watchedFilePath}"\nPrefix: ${filePrefix}\nExtension: ${fileExtension}\n`);
// now go through the folder and determine the highest number
const folder = fs.readdirSync("./");
let counter = 0;
folder.forEach(file => {
  if(file.startsWith(filePrefix)){
    const numberString = file.replace("." + fileExtension, "").replace(filePrefix, "");
    const number = parseInt(numberString, 10);
    if(!isNaN(number) && counter < number){
      counter = number;
    }
  }
})
console.log(`found files and calculated counter to be: ${counter} / zeropadded: ${zeropad(counter)}`);

// watch for events using chokidar
chokidar.watch(`${folderPath}*`).on('all', (event, path) => {
  
  if(path.indexOf(watchedFilePath) >= 0){
    switch (event) {
      case "add":
        console.log(`Added watched file: ${path}`);
        fs.renameSync(path,`${filePrefix}${zeropad(++counter)}.${fileExtension}`);
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
