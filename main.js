'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
var Menu = require('menu');
var dialog = require('dialog');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1400, height: 800});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  //Set native menubar
  var template = [
		{
      label: "File",
      submenu: [
        {label: "Quit", accelerator: "Command+Q", click: app.quit}
      ]
    },
    {
      label: "Edit",
      submenu: [
        {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
        {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
        {type: "separator"},
        {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
        {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
        {label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
        {label: "Select All", accelerator: "CmdOrCtrl+A", role: 'selectall'}
      ]
    },
    {
      label: "Help",
      submenu: [
        {label: "About", accelerator: "CmdOrCtrl+P", click: function () {
          dialog.showMessageBox({title: "About Markdownify", type:"info", message: "A minimal Markdown Editor desktop app. \nMIT Copyright (c) 2016 Amit Merchant <bullredeyes@gmail.com>", buttons: ["Close"] });
        }}
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
