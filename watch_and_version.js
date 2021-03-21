#!/usr/bin/env node
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const zeropad = (number) => ("0000" + number).slice(-4);
const optionsArray = ["-c", "--copy-on-change", "-m", "--move-on-create"];
const showHelp = () => {
  console.log(`\n${path.basename(process.argv[1])} filename_to_watch.for\n\n
Will watch for creation or changes to "filename_to_watch.for".
On the corresponding action it will move or copy to "filename_to_watch[counter].for" counting up.
Example: filename_to_watch0001.for

Options:
========
-c / --copy-on-change Creates numbered copy on change of watched file
-m / --move-on-create (default) Move watched file to numbered copy
\n`);
};

if(process.argv.length < 3 || (process.argv.length >= 3 && (process.argv[2] === "-h" || process.argv[2] === "--help"))){
  showHelp();
  return 1;
}

const copy_on_change = process.argv.includes("-c") || process.argv.includes("--copy-on-change");

const watchedFilePath = process.argv[process.argv.length - 1];
// if only an option and no filename was given, show help
if(optionsArray.includes(watchedFilePath)){
  showHelp();
  return 1;
}
//get folder from param / call
let folderPath = "./";
if(watchedFilePath.indexOf("/") >= 0){
  folderPath = path.dirname(watchedFilePath) + "/";
}

// get file parts
const fileExtension = path.extname(watchedFilePath);
const filePrefix = watchedFilePath.replace(fileExtension, "");
const fileBasenamePrefix = path.basename(watchedFilePath).replace(fileExtension, "");

console.log(`${process.argv[1]} running on "${watchedFilePath}"\nPrefix:\t ${filePrefix}\nExt:\t ${fileExtension}`);
if(copy_on_change){
  console.log("Mode:\t copy on change to watched file\n");
}else{
  console.log("Mode:\t move on creation of watched file\n");
}
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
        if(!copy_on_change){
          const newFilenameMove = `${filePrefix}${zeropad(++counter)}${fileExtension}`;
          console.log(`Added watched file: ${path}\n\tmoved to: ${newFilenameMove}`);
          fs.renameSync(path,newFilenameMove);
        }
        break;
      case "change":
        if(copy_on_change){
          const newFilenameCopy = `${filePrefix}${zeropad(++counter)}${fileExtension}`;
          console.log(`Changed watched file: ${path} copied to ${newFilenameCopy}`);
          fs.copyFileSync(path,newFilenameCopy);
        }
        break;
      default:
        // ignore unlink for now
        // console.log(`Unhandled event: ${event}`);
        break;
    }
  }
});
