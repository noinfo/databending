const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const zeropad = (number) => ("0000" + number).slice(-4);
const showHelp = () => {
  // TODO write comprehensive help
  console.log(`\nThis is the help`);
};

if(process.argv.length < 3){
  showHelp();
  return 1;
}
const watchedFilePath = process.argv[2];
//get folder from param / call
let folderPath = "./";
if(watchedFilePath.indexOf("/") >= 0){
  folderPath = path.dirname(watchedFilePath) + "/";
}

// get file parts
const watchedFileArray = watchedFilePath.split(".");
const fileExtension = watchedFileArray[watchedFileArray.length - 1];
const filePrefix = watchedFilePath.replace("." + fileExtension, "");
console.log(`Running on "${watchedFilePath}"\nPrefix: ${filePrefix}\nExtension: ${fileExtension}\n`);
// now go through the folder and determine the highest number
const folder = fs.readdirSync(folderPath);
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
        // TODO add option to "react & copy" instead of "move on create"
        console.log(`Changed watched file: ${path}`);
        break;
      default:
        // ignore unlink for now
        // console.log(`Unhandled event: ${event}`);
        break;
    }
  }
});
