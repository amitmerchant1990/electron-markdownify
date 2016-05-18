/*!
* The MIT License (MIT)
* Copyright (c) 2016 Amit Merchant <bullredeyes@gmail.com>
 */

var showdown  = require('showdown');
var remote = require('electron').remote;
// `remote.require` since `Menu` is a main-process module.
var buildEditorContextMenu = remote.require('electron-editor-context-menu');

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
  lineWrapping : true
});

window.onload = function() {
  var plainText = document.getElementById('plainText');
  var markdownArea = document.getElementById('markdown');

  cm.on('change',function(cMirror){
    // get value right from instance
    //yourTextarea.value = cMirror.getValue();
    var markdownText = cMirror.getValue();
    //Md -> Preview
    html = marked(markdownText);
    markdownArea.innerHTML = html;

    //Md -> HTML
    converter = new showdown.Converter();
    html      = converter.makeHtml(markdownText);
    document.getElementById("htmlPreview").value = html;
  });
}

var currentValue = 0;
function clkPref(opt) {
    currentValue = opt.value;
    if ( currentValue=='preview' ) {
      document.getElementById("htmlPreview").style.display = "none";
      document.getElementById("markdown").style.display = "block";
    } else if ( currentValue=='html' ) {
      document.getElementById("markdown").style.display = "none";
      document.getElementById("htmlPreview").style.display = "block";
    }
}

var currentValueTheme = 0;
function changeTheme(opt) {
    currentValueTheme = opt.value;
    if ( currentValueTheme=='light' ) {
      cm.setOption("theme", "default");
    } else if ( currentValueTheme=='dark' ) {
      cm.setOption("theme", "base16-dark");
    }
}
