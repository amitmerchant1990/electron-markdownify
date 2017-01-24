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
var parsePath = require("parse-filepath");
var currentFile = '';
var isFileLoadedInitially = false;

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

$(function() {
  var plainText = document.getElementById('plainText'),
    markdownArea = document.getElementById('markdown');

  cm.on('change',function(cMirror){
    // get value right from instance
    //yourTextarea.value = cMirror.getValue();
    var markdownText = cMirror.getValue();

    //Md -> Preview
    html = marked(markdownText,{gfm: true});
    markdownArea.innerHTML = replaceWithEmojis(html);

    //Md -> HTML
    converter = new showdown.Converter();
    html      = converter.makeHtml(markdownText);
    document.getElementById("htmlPreview").value = html;

    if(this.isFileLoadedInitially){
      this.setClean();
      this.isFileLoadedInitially = false;
    }

    if(this.currentFile!=''){
      this.updateWindowTitle(this.currentFile);
    }else{
      this.updateWindowTitle();
    }

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
      this.isFileLoadedInitially = true;
      this.currentFile = data.filename;
    }
  });


  /**************************
   * Synchronized scrolling *
   **************************/

  var $prev = $('#previewPanel'),
    $markdown = $('#markdown'),
    $syncScroll = $('#syncScroll'),
    canScroll; // Initialized below.

  // Retaining state in boolean since this will be more CPU friendly instead of constantly selecting on each event.
  function toggleSyncScroll() {
	  console.log('Toggle scroll synchronization.');
	  canScroll = $syncScroll.is(':checked');

	  // If scrolling was just enabled, ensure we're back in sync by triggering window resize.
	  if (canScroll) $(window).trigger('resize');
  }
  toggleSyncScroll();
  $syncScroll.on('change', toggleSyncScroll);

  /**
   * Scrollable height.
   */

  function codeScrollable() {
    var info = cm.getScrollInfo(),
      fullHeight = info.height,
      viewHeight = info.clientHeight;

    return fullHeight - viewHeight;
  }

  function prevScrollable() {
    var fullHeight = $markdown.height(),
      viewHeight = $prev.height();
    return fullHeight - viewHeight;
  }

  /**
   * Temporarily swaps out a scroll handler.
   */
  function muteScroll(obj, listener) {
    obj.off('scroll', listener);
    obj.on('scroll', tempHandler);
    function tempHandler() {
      obj.off('scroll', tempHandler);
      obj.on('scroll', listener);
    }
  }

  /**
   * Scroll Event Listeners
   */
  function codeScroll() {
    var scrollable = codeScrollable();
    if (scrollable > 0 && canScroll) {
      var percent = cm.getScrollInfo().top / scrollable;

      // Since we'll be triggering scroll events.
      console.log('Code scroll: %' + (Math.round(100 * percent)));
      muteScroll($prev, prevScroll);
      $prev.scrollTop(percent * prevScrollable());
    }
  }
  cm.on('scroll', codeScroll);
  $(window).on('resize', codeScroll);

  function prevScroll() {
      var scrollable = prevScrollable();
      if (scrollable > 0 && canScroll) {
        var percent = $(this).scrollTop() / scrollable;

        // Since we'll be triggering scroll events.
        console.log('Preview scroll: %' + (Math.round(100 * percent)));
        muteScroll(cm, codeScroll);
        cm.scrollTo(null, codeScrollable() * percent);
      }
  }
  $prev.on('scroll', prevScroll);

});
