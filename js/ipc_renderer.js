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
       alert("The file has been succesfully saved");
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
