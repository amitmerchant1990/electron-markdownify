
const alertIfError = (error) => {
  if(error) alert(error);
};

const saveAs = () => {
  storage.get('markdown-savefile', (error, data) => {
    options = {};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }
    dialog.showSaveDialog(options, (fileName) => {
      if (fileName === undefined) {
        console.log('You didn\'t save the file');
        return;
      }

      storage.set('markdown-savefile', {'filename': fileName}, alertIfError);

      const mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, mdValue, (err) => {
        if (err) {
          alert(`An error occurred creating the file ${err.message}`)
        }
      });
      this.setClean();
      this.currentFile = fileName;
      this.updateWindowTitle(fileName);
    });
  });
};

const saveFile = () => {
  storage.get('markdown-savefile', (error, data) => {
    if (error) {
      saveAs();
      return;
    }
    if ('filename' in data) {
      const fileName = data.filename;
      if (fileName === undefined) {
        console.log('You didn\'t save the file');
        return;
      }

      storage.set('markdown-savefile', {'filename': fileName}, alertIfError);

      const mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.writeFile(fileName, mdValue, (err) => {
        if (err) {
          alert(`An error occurred creating the file ${err.message}`)
        }
      });
      this.setClean();
      this.currentFile = fileName;
      updateWindowTitle(fileName);
    } else {
      saveAs();
    }
  });
};

const resetFile = () => {
  storage.set('markdown-savefile', {}, alertIfError);
  setClean();
  this.currentFile = '';
  updateWindowTitle();
  cm.getDoc().setValue('');
};

const saveAsAndReset = () => {
  dialog.showSaveDialog({}, (fileName) => {
    if (fileName === undefined) {
      console.log('You didn\'t save the file');
      return;
    }

    storage.set('markdown-savefile', {'filename': fileName}, alertIfError);

    const mdValue = cm.getValue();
    // fileName is a string that contains the path and filename created in the save file dialog.
    fs.writeFile(fileName, mdValue, (err) => {
      if (err) {
        alert(`An error occurred creating the file ${err.message}`);
      }
    });
    resetFile();
  });
};

const newFile = () => {
  if (!isClean()) { // File is modified
    const options = {
      title: 'You made some changes',
      type: 'question',
      message: 'Do you want to save the file?',
      buttons: ['Save', 'Don\'t Save', 'Cancel']
    };
    dialog.showMessageBox(options, (buttonIndex) => {
      if (buttonIndex === 0) { // If Save is pressed
        storage.get('markdown-savefile', (error, data) => {
          if (error) {
            saveAsAndReset();
            return;
          }
          if ('filename' in data) {
            const fileName = data.filename;
            if (fileName === undefined) {
              console.log('You didn\'t save the file');
              return;
            }

            storage.set('markdown-savefile', {'filename': fileName}, alertIfError);

            const mdValue = cm.getValue();
            // fileName is a string that contains the path and filename created in the save file dialog.
            fs.writeFile(fileName, mdValue, (err) => {
              if (err) {
                alert(`An error occurred creating the file ${err.message}`);
              }
            });
            resetFile();
          } else { // if filename not in data show the save file dialog
            saveAsAndReset();
          }
        });
      } else if (buttonIndex === 1) { // if Don't save is pressed
        resetFile();
      }
    });
  } else { // if file is clean
    resetFile();
  }
};

// Handling new file creation through IPCRenderer
ipc.on('file-new', newFile);

// Handling file saving through IPCRenderer
ipc.on('file-save', saveFile);

// Handling file saving through IPCRenderer
ipc.on('file-save-as', saveAs);

// Handling file opening through IPCRenderer
ipc.on('file-open', () => {
  storage.get('markdown-savefile', (error, data) => {
    if (error) alert(error);

    const options = {'properties' : ['openFile'], 'filters' : [{name: 'Markdown', 'extensions':['md']}]};
    if ('filename' in data) {
      options.defaultPath = data.filename;
    }

    dialog.showOpenDialog(options, (fileName) => {
      if (fileName === undefined){
        console.log("You didn't open the file");
        return;
      }

      storage.set('markdown-savefile', {'filename' : fileName[0]}, alertIfError);

      const mdValue = cm.getValue();
      // fileName is a string that contains the path and filename created in the save file dialog.
      fs.readFile(fileName[0], 'utf-8', (err, data) => {
        if(err){
          alert(`An error ocurred while opening the file ${err.message}`)
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
