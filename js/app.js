/*!
* The MIT License (MIT)
* Copyright (c) 2016 Amit Merchant <bullredeyes@gmail.com>
 */

var showdown  = require('showdown');
var remote = require('electron').remote;
var ipc = require('electron').ipcRenderer;
var dialog = require('electron').remote.dialog;
var fs = remote.require('fs');
const storage = require('electron-json-storage');
var console = require('console');

// `remote.require` since `Menu` is a main-process module.
var buildEditorContextMenu = remote.require('electron-editor-context-menu');
var currentValue = 0, currentValueTheme = 0;

window.addEventListener('contextmenu', function(e) {
  // Only show the context menu in text editors.
  if (!e.target.closest('textarea, input, [contenteditable="true"],section')) return;

  var menu = buildEditorContextMenu();

  // The 'contextmenu' event is emitted after 'selectionchange' has fired but possibly before the
  // visible selection has changed. Try to wait to show the menu until after that, otherwise the
  // visible selection will update after the menu dismisses and look weird.
  setTimeout(function() {
    menu.popup(remote.getCurrentWindow());
  }, 30);
});

var cm = CodeMirror.fromTextArea(document.getElementById("plainText"), {
  lineNumbers: true,
  mode: "markdown",
  viewportMargin: 100000000000,
  lineWrapping : true,
  autoCloseBrackets: true
});

window.onload = function() {
  var plainText = document.getElementById('plainText');
  var markdownArea = document.getElementById('markdown');

  cm.on('change',function(cMirror){
    // get value right from instance
    //yourTextarea.value = cMirror.getValue();
    var markdownText = cMirror.getValue();
    //Md -> Preview
    html = marked(markdownText,{gfm: true});
    markdownArea.innerHTML = html;

    //Md -> HTML
    converter = new showdown.Converter();
    html      = converter.makeHtml(markdownText);
    document.getElementById("htmlPreview").value = html;
  });

  // Get the most recently saved file
  storage.get('markdown-savefile', function(error, data) {
    if (error) throw error;

    if ('filename' in data) {
      fs.readFile(data.filename, 'utf-8', function (err, data) {
         if(err){
             alert("An error ocurred while opening the file "+ err.message)
         }
         cm.getDoc().setValue(data);
      });
    }
  });
}
