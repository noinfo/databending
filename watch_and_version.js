#!/usr/bin/env node
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const zeropad = (number) => ("0000" + number).slice(-4);

const showHelp = () => {
  console.log(`\n${path.basename(process.argv[1])} filename_to_watch.for\n\n
Will move "filename_to_watch.for" to "filename_to_watch[counter].for" whenever it is created counting up.
Example: filename_to_watch0001.for
\n`);
};

if(process.argv.length < 3 || (process.argv.length >= 3 && (process.argv[2] === "-h" || process.argv[2] === "--help"))){
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
const fileExtension = path.extname(watchedFilePath);
const filePrefix = watchedFilePath.replace(fileExtension, "");
const fileBasenamePrefix = path.basename(watchedFilePath).replace(fileExtension, "");
console.log(`Running on "${watchedFilePath}"\nPrefix: ${filePrefix}\nExtension: ${fileExtension}\n`);
// now go through the folder and determine the highest number
const folder = fs.readdirSync(folderPath);
let counter = 0;
folder.forEach(file => {
  if(file.startsWith(fileBasenamePrefix)){
    const numberString = file.replace(fileExtension, "").replace(fileBasenamePrefix, "");
    const number = parseInt(numberString, 10);
    if(!isNaN(number) && counter < number){
      counter = number;
    }
  }
})
console.log(`Counter starts at: ${counter} / zeropadded: ${zeropad(counter)}`);

// watch for events using chokidar
chokidar.watch(`${folderPath}*`).on('all', (event, path) => {
  
  if(path.indexOf(watchedFilePath) >= 0){
    switch (event) {
      case "add":
        const newfilename = `${filePrefix}${zeropad(++counter)}${fileExtension}`;
        console.log(`Added watched file: ${path}\n\tmoved to: ${newfilename}`);
        fs.renameSync(path,newfilename);
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
