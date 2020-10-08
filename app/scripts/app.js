/*!
 * The MIT License (MIT)
 * Copyright (c) 2020 Amit Merchant <bullredeyes@gmail.com>
 */

var showdown = require('showdown');
var remote = require('electron').remote;
var ipc = require('electron').ipcRenderer;
var dialog = require('electron').remote.dialog;
var fs = remote.require('fs');
const storage = require('electron-json-storage');
var console = require('console');
var parsePath = require("parse-filepath");
var katex = require('parse-katex');
var currentFile = '';
var isFileLoadedInitially = false;

const config = require('./config');

// `remote.require` since `Menu` is a main-process module.
var buildEditorContextMenu = remote.require('electron-editor-context-menu');
var currentValue = 0,
    currentValueTheme = 0;

window.addEventListener('contextmenu', e => {
    // Only show the context menu in text editors.
    if (!e.target.closest('textarea, input, [contenteditable="true"],section')) return;

    var menu = buildEditorContextMenu();

    // The 'contextmenu' event is emitted after 'selectionchange' has fired but possibly before the
    // visible selection has changed. Try to wait to show the menu until after that, otherwise the
    // visible selection will update after the menu dismisses and look weird.
    setTimeout(() => {
        menu.popup(remote.getCurrentWindow());
    }, 30);
});

var cm = CodeMirror.fromTextArea(document.getElementById("plainText"), {
    lineNumbers: false,
    mode: "markdown",
    viewportMargin: 100000000000,
    lineWrapping: true,
    autoCloseBrackets: true
});

$(() => {
    var plainText = document.getElementById('plainText'),
        markdownArea = document.getElementById('markdown');

    cm.on('change', (cMirror) => {
        // get value right from instance
        //yourTextarea.value = cMirror.getValue();
        var markdownText = cMirror.getValue();
        // Convert emoji's
        markdownText = replaceWithEmojis(markdownText);
        latexText = katex.renderLaTeX(markdownText);

        marked.setOptions({
            highlight: (code) => {
                return require('highlightjs').highlightAuto(code).value;
            }
        });

        //Md -> Preview
        html = marked(latexText, {
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });

        markdownArea.innerHTML = html;

        //Md -> HTML
        converter = new showdown.Converter();
        html = converter.makeHtml(markdownText);
        document.getElementById("htmlPreview").value = html;

        if (this.isFileLoadedInitially) {
            this.setClean();
            this.isFileLoadedInitially = false;
        }

        if (this.currentFile != '') {
            this.updateWindowTitle(this.currentFile);
        } else {
            this.updateWindowTitle();
        }

    });

    // Get the most recently saved file
    storage.get('markdown-savefile', (error, data) => {
        if (error) throw error;

        if ('filename' in data) {
            fs.readFile(data.filename, 'utf-8', (err, data) => {
                if (err) {
                    alert("An error ocurred while opening the file " + err.message)
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
    var toggleSyncScroll = () => {
            console.log('Toggle scroll synchronization.');
            canScroll = $syncScroll.is(':checked');

            config.set('isSyncScroll', canScroll);
            // If scrolling was just enabled, ensure we're back in sync by triggering window resize.
            if (canScroll) $(window).trigger('resize');
        }
        //toggleSyncScroll();
    $syncScroll.on('change', toggleSyncScroll);

    const isSyncScroll = config.get('isSyncScroll');
    if (isSyncScroll === true) {
        $syncScroll.attr('checked', true);
    } else {
        $syncScroll.attr('checked', false);
    }
    /**
     * Scrollable height.
     */

    var codeScrollable = () => {
        var info = cm.getScrollInfo(),
            fullHeight = info.height,
            viewHeight = info.clientHeight;

        return fullHeight - viewHeight;
    }

    var prevScrollable = () => {
        var fullHeight = $markdown.height(),
            viewHeight = $prev.height();
        return fullHeight - viewHeight;
    }

    /**
     * Temporarily swaps out a scroll handler.
     */
    var muteScroll = (obj, listener) => {
        obj.off('scroll', listener);
        obj.on('scroll', tempHandler);

        var tempHandler = () => {
            obj.off('scroll', tempHandler);
            obj.on('scroll', listener);
        }
    }

    /**
     * Scroll Event Listeners
     */
    var codeScroll = () => {
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

    var prevScroll = () => {
        var scrollable = prevScrollable();
        if (scrollable > 0 && canScroll) {
            var percent = $(this).scrollTop() / scrollable;

            // Since we'll be triggering scroll events.
            muteScroll(cm, codeScroll);
            cm.scrollTo(null, codeScrollable() * percent);
        }
    }
    $prev.on('scroll', prevScroll);

    const isDarkMode = config.get('darkMode');
    changeTheme(isDarkMode);

    const isHtml = config.get('isHtml');
    clkPref(isHtml);
});