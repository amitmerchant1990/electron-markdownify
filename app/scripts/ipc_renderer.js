// Handling file saving through IPCRenderer
var saveAs = () => {
  storage.get('markdown-savefile', (error, data) => {
    options = {};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }
    dialog.showSaveDialog(options, (fileName) => {
      if (fileName === undefined){
        console.log("You didn't save the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName}, (error) => { if (error) alert(error); });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, mdValue, (err) => {
        if(err){
          alert("An error ocurred creating the file "+ err.message)
        }
      });
      this.setClean();
      this.currentFile = fileName;
      this.updateWindowTitle(fileName);
    });
  });
}

ipc.on('file-new', () => {
  storage.set('markdown-savefile', {}, (error) => { if (error) alert(error); });
  currentFile = '';
  cm.getDoc().setValue("");
});

// Handling file saving through IPCRenderer
ipc.on('file-save', () => {
  storage.get('markdown-savefile', (error, data) => {
    if (error) {
      saveAs();
      return;
    }
    if ('filename' in data) {
      var fileName = data.filename;
      if (fileName === undefined){
        console.log("You didn't save the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName}, (error) => { if (error) alert(error); });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, mdValue, (err) => {
       if(err){
         alert("An error ocurred creating the file "+ err.message)
       }
      });
      this.setClean();
      this.currentFile = fileName;
      updateWindowTitle(fileName);
    } else {
      saveAs();
    }
  });
});

ipc.on('file-save-as', saveAs);

// Handling file opening through IPCRenderer
ipc.on('file-open', () => {
  storage.get('markdown-savefile', (error, data) => {
    if (error) alert(error);

    var options = {'properties' : ['openFile'], 'filters' : [{name: 'Markdown', 'extensions':['md']}]};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }

    dialog.showOpenDialog(options, (fileName) => {
      if (fileName === undefined){
        console.log("You didn't open the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName[0]}, (error) => { if (error) alert(error); });

      var mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.readFile(fileName[0], 'utf-8', (err, data) => {
        if(err){
          alert("An error ocurred while opening the file "+ err.message)
        }
        cm.getDoc().setValue(data);
      });
      this.isFileLoadedInitially = true;
      this.currentFile = fileName[0];
    });
  });
});

ipc.on('ctrl+b', () => {
  toggleFormat('bold');
});

ipc.on('ctrl+i', () => {
  toggleFormat('italic');
});

ipc.on('ctrl+/', () => {
  toggleFormat('strikethrough');
});

ipc.on('ctrl+l', () => {
  drawLink();
});

ipc.on('ctrl+h', () => {
  toggleHeadingSmaller();
});

ipc.on('ctrl+alt+i', () => {
  drawImage();
});

ipc.on('ctrl+shift+t', () => {
  drawTable();
});

ipc.on('ctrl+f', () => {
  cm.execCommand('find');
});

ipc.on('ctrl+shift+f', () => {
  cm.execCommand('replace');
});

ipc.on('file-pdf', () => {

  // Only save PDF files
  options = {
    filters: [
      {name: 'PDF', extensions: ['pdf']}
    ]
  };

  dialog.showSaveDialog(options, (fileName) => {
    ipc.send('print-to-pdf', fileName);
  });

});
