'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const mainPage = 'file://' + __dirname + '/index.html';
var Menu = require('menu');
var dialog = require('dialog');
var shell = require('shell');
const tray = require('./tray');
const Config = require('./package.json');
var localShortcut = require('electron-localshortcut');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let isQuitting = false;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1400, height: 800, icon: __dirname+'/img/favicon.ico'});

  // and load the index.html of the app.
  mainWindow.loadURL(mainPage);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();
      if (process.platform === 'darwin') {
        app.hide();
      } else {
        mainWindow.hide();
      }
    }
  });

  //Open anchor links in browser
  mainWindow.webContents.on('will-navigate', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  //Set native menubar
  var template = [
    {
      label: "&File",
      submenu: [
        {label: "New", accelerator: "CmdOrCtrl+N", click: function() {
          var focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send('file-new');
        }},
        {label: "Open", accelerator: "CmdOrCtrl+O", click: function() {
          let focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send('file-open');
        }},
        {label: "Save", accelerator: "CmdOrCtrl+S", click: function() {
          let focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send('file-save');
        }},
        {label: "Save As", accelerator: "CmdOrCtrl+Shift+S", click: function() {
          var focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send('file-save-as');
        }},
        {label: "Quit", accelerator: "Command+Q", click: app.quit}
      ]
    },
    {
      label: "&Edit",
      submenu: [
        {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
        {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
        {type: "separator"},
        {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
        {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
        {label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
        {label: "Select All", accelerator: "CmdOrCtrl+A", role: 'selectall'},
        {type: "separator"},
        {label: "Search", accelerator: "CmdOrCtrl+F", click: function() {
          let focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send('ctrl+f');
        }},
        {label: "Replace", accelerator: "CmdOrCtrl+Shift+F", click: function() {
          let focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send('ctrl+shift+f');
        }}
      ]
    },
    {
      label: "&View",
      submenu: [
        {label: "Toggle Full Screen", accelerator:"F11", click: function(){
          let focusedWindow = BrowserWindow.getFocusedWindow();
          let isFullScreen = focusedWindow.isFullScreen();
          focusedWindow.setFullScreen(!isFullScreen);
        }}
      ]
    },
    {
      label: "&Help",
      submenu: [
        {label: "Documentation", click: function () {
          shell.openExternal(Config.repository.docs);
        }},
        {label: "Report Issue", click: function () {
          shell.openExternal(Config.bugs.url);
        }},
        {label: "About Markdownify", click: function () {
          dialog.showMessageBox({title: "About Markdownify", type:"info", message: "A minimal Markdown Editor desktop app. \nMIT Copyright (c) 2016 Amit Merchant <bullredeyes@gmail.com>", buttons: ["Close"] });
        }}
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // Registering shortcuts for formatting markdown
  var focusedWindow = BrowserWindow.getFocusedWindow();
  localShortcut.register('CmdOrCtrl+b', function() {
      focusedWindow.webContents.send('ctrl+b');
  });

  localShortcut.register('CmdOrCtrl+i', function() {
      focusedWindow.webContents.send('ctrl+i');
  });

  localShortcut.register('CmdOrCtrl+/', function() {
      focusedWindow.webContents.send('ctrl+/');
  });

  localShortcut.register('CmdOrCtrl+l', function() {
      focusedWindow.webContents.send('ctrl+l');
  });

  localShortcut.register('CmdOrCtrl+h', function() {
      focusedWindow.webContents.send('ctrl+h');
  });

  localShortcut.register('CmdOrCtrl+Alt+i', function() {
      focusedWindow.webContents.send('ctrl+alt+i');
  });

  localShortcut.register('CmdOrCtrl+Shift+t', function() {
      focusedWindow.webContents.send('ctrl+shift+t');
  });

  tray.create(mainWindow);
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

app.on('before-quit', function() {
  isQuitting = true;
});
