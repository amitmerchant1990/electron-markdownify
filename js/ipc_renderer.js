// Handling file saving through IPCRenderer
ipc.on('file-save', function() {
  dialog.showSaveDialog(function (fileName) {
    if (fileName === undefined){
        console.log("You didn't save the file");
        return;
    }

    var mdValue = cm.getValue();
    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.writeFile(fileName, mdValue, function (err) {
       if(err){
           alert("An error ocurred creating the file "+ err.message)
       }
       alert("The file has been succesfully saved", "Markdownify");
    });
  });
});

// Handling file opening through IPCRenderer
ipc.on('file-open', function() {
  dialog.showOpenDialog(function (fileName) {
    if (fileName === undefined){
        console.log("You didn't open the file");
        return;
    }

    var mdValue = cm.getValue();
    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.readFile(fileName[0], 'utf-8', function (err, data) {
       if(err){
           alert("An error ocurred while opening the file "+ err.message)
       }
       cm.getDoc().setValue(data);
    });
  });
});

ipc.on('ctrl+b', function() {
  toggleFormat('bold');
});

ipc.on('ctrl+i', function() {
  toggleFormat('italic');
});

ipc.on('ctrl+/', function() {
  toggleFormat('strikethrough');
});

ipc.on('ctrl+l', function() {
  drawLink();
});

ipc.on('ctrl+h', function() {
  toggleHeadingSmaller();
});

ipc.on('ctrl+alt+i', function() {
  drawImage();
});

ipc.on('ctrl+t', function() {
  drawTable();
});
