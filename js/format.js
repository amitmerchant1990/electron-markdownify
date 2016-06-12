var insertTexts = {
  link: ["[", "](#url#)"],
  image: ["![", "](#url#)"],
  table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n"],
  horizontalRule: ["", "\n\n-----\n\n"]
};

function toggleFormat(type) {
  'use strict';
  let modifiers = [];
  if(type == "bold") {
    modifiers = ["**", "__"];
  } else if(type == "italic") {
    modifiers = ["*", "_"];
  } else if(type == "strikethrough") {
    modifiers = ["~~"];
  }
  cm.operation(() => {
    _toggleFormat(modifiers);
  })
}

function _toggleFormat(modifiers) {
  'use strict';
  if (modifiers.length === 0) {
    return;
  }
  // exclude modifiers from selection
  let allModifiers = ['**', "__", "~~", "*", "_", "`"];
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  for (let bFound = true; bFound; ) {
    bFound = false;
    for (let i = 0, len = allModifiers.length; i < len; i++) {
      let modi = allModifiers[i];
      if (cm.getSelection().startsWith(modi) && cm.getSelection().endsWith(modi) 
        && endPoint.ch - startPoint.ch >= 2 * modi.length) {
        bFound = true;
        startPoint.ch += modi.length;
        endPoint.ch -= modi.length;
        break;
      }
    }
  }
  cm.setSelection(startPoint, endPoint);

  // find modifiers around selection
  let foundModifiers = [];
  let modifierWidth = 0;
  let rangeStartPoint = new CodeMirror.Pos(startPoint.line, startPoint.ch);
  let rangeEndPoint = new CodeMirror.Pos(endPoint.line, endPoint.ch);
  let lineLenght = cm.getLine(rangeEndPoint.line).length;
  for (let bFound = true; bFound; ) {
    bFound = false;
    for (let i = 0, len = allModifiers.length; i < len; i++) {
      let modi = allModifiers[i];
      if (rangeStartPoint.ch < modi.length || rangeEndPoint.ch > lineLenght - modi.length) {
        continue;
      }
      rangeStartPoint.ch -= modi.length;
      rangeEndPoint.ch += modi.length;
      let text = cm.getRange(rangeStartPoint, rangeEndPoint);
      if (text.startsWith(modi) && text.endsWith(modi)) {
        bFound = true;
        foundModifiers.push(modi);
        break;
      }
      rangeStartPoint.ch += modi.length;
      rangeEndPoint.ch -= modi.length;
    }
  }

  // find given modifier in array(foundModifiers)
  let modifierIndex = -1;
  for (let i = 0; i < modifiers.length; i++) {
    modifierIndex = foundModifiers.indexOf(modifiers[i]);
    if (modifierIndex != -1) {
      break;
    }
  }

  // if modifier found, delete it from array(boundModifiers). or push it to array
  let modifierLength = 0;
  if (modifierIndex !== -1) {
    modifierLength = -foundModifiers[modifierIndex].length;
    foundModifiers.splice(modifierIndex, 1);
  } else {
    foundModifiers.unshift(modifiers[0]);
    modifierLength = modifiers[0].length;
  }

  // replace text with modified modifiers
  let prefix = foundModifiers.join("");
  let suffix = foundModifiers.reverse().join("");
  cm.replaceRange(suffix, endPoint, rangeEndPoint);
  cm.replaceRange(prefix, rangeStartPoint, startPoint);

  startPoint.ch += modifierLength;
  // only change endpoint when selection is in single line
  if (startPoint.line === endPoint.line) {
    endPoint.ch += modifierLength;
  }
  cm.setSelection(startPoint, endPoint);
  cm.focus();
}

function getState(cm, pos) {
  pos = pos || cm.getCursor("start");
  var stat = cm.getTokenAt(pos);
  if(!stat.type) return {};

  var types = stat.type.split(" ");

  var ret = {},
    data, text;
    for(var i = 0; i < types.length; i++) {
      data = types[i];
      if(data === "strong") {
      ret.bold = true;
    } else if(data === "variable-2") {
      text = cm.getLine(pos.line);
      if(/^\s*\d+\.\s/.test(text)) {
        ret["ordered-list"] = true;
      } else {
        ret["unordered-list"] = true;
      }
    } else if(data === "atom") {
      ret.quote = true;
    } else if(data === "em") {
      ret.italic = true;
    } else if(data === "quote") {
      ret.quote = true;
    } else if(data === "strikethrough") {
      ret.strikethrough = true;
    } else if(data === "comment") {
      ret.code = true;
    } else if(data === "link") {
      ret.link = true;
    } else if(data === "tag") {
      ret.image = true;
    } else if(data.match(/^header(\-[1-6])?$/)) {
      ret[data.replace("header", "heading")] = true;
    }
  }
  return ret;
}

function toggleBlockquote() {
  _toggleLine(cm, "quote");
}

function toggleUnorderedList(editor) {
  _toggleLine(cm, "unordered-list");
}

function toggleOrderedList(editor) {
  _toggleLine(cm, "ordered-list");
}

function _toggleLine(cm, name) {
  if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
  return;

  var stat = getState(cm);
  var startPoint = cm.getCursor("start");
  var endPoint = cm.getCursor("end");
  var repl = {
    "quote": /^(\s*)\>\s+/,
    "unordered-list": /^(\s*)(\*|\-|\+)\s+/,
    "ordered-list": /^(\s*)\d+\.\s+/
  };
  var map = {
    "quote": "> ",
    "unordered-list": "* ",
    "ordered-list": "1. "
  };
  for(var i = startPoint.line; i <= endPoint.line; i++) {
    (function(i) {
      var text = cm.getLine(i);
      if(stat[name]) {
        text = text.replace(repl[name], "$1");
      } else {
        text = map[name] + text;
      }
      cm.replaceRange(text, {
        line: i,
        ch: 0
      }, {
        line: i,
        ch: 99999999999999
      });
    })(i);
  }
  cm.focus();
}

// function for drawing a link
function drawLink() {
  var stat = getState(cm);
  var url = "http://";
  _replaceSelection(cm, stat.link, insertTexts.link, url);
}

// function for drawing an image
function drawImage() {
  var stat = getState(cm);
  var url = "http://";
  _replaceSelection(cm, stat.image, insertTexts.image, url);
}

// function for drawing a image
function drawTable() {
  var stat = getState(cm);
  _replaceSelection(cm, stat.table, insertTexts.table);
}

// function for drawing a horizontal rule.
function drawHorizontalRule() {
  var stat = getState(cm);
  _replaceSelection(cm, stat.image, insertTexts.horizontalRule);
}

// function for adding heading
function toggleHeadingSmaller() {
	_toggleHeading("smaller");
}

function _toggleHeading(direction, size) {
  var startPoint = cm.getCursor("start");
  var endPoint = cm.getCursor("end");
  for(var i = startPoint.line; i <= endPoint.line; i++) {
    (function(i) {
      var text = cm.getLine(i);
      var currHeadingLevel = text.search(/[^#]/);

      if(direction !== undefined) {
        if(currHeadingLevel <= 0) {
          if(direction == "bigger") {
            text = "###### " + text;
          } else {
            text = "# " + text;
          }
        } else if(currHeadingLevel == 6 && direction == "smaller") {
          text = text.substr(7);
        } else if(currHeadingLevel == 1 && direction == "bigger") {
          text = text.substr(2);
        } else {
          if(direction == "bigger") {
            text = text.substr(1);
          } else {
            text = "#" + text;
          }
        }
      } else {
        if(size == 1) {
          if(currHeadingLevel <= 0) {
            text = "# " + text;
          } else if(currHeadingLevel == size) {
            text = text.substr(currHeadingLevel + 1);
          } else {
            text = "# " + text.substr(currHeadingLevel + 1);
          }
        } else if(size == 2) {
          if(currHeadingLevel <= 0) {
            text = "## " + text;
          } else if(currHeadingLevel == size) {
            text = text.substr(currHeadingLevel + 1);
          } else {
            text = "## " + text.substr(currHeadingLevel + 1);
          }
        } else {
          if(currHeadingLevel <= 0) {
            text = "### " + text;
          } else if(currHeadingLevel == size) {
            text = text.substr(currHeadingLevel + 1);
          } else {
            text = "### " + text.substr(currHeadingLevel + 1);
          }
        }
      }

      cm.replaceRange(text, {
        line: i,
        ch: 0
      }, {
        line: i,
        ch: 99999999999999
      });
    })(i);
  }
  cm.focus();
}

function _replaceSelection(cm, active, startEnd, url) {
  var text;
  var start = startEnd[0];
  var end = startEnd[1];
  var startPoint = cm.getCursor("start");
  var endPoint = cm.getCursor("end");
  if(url) {
    end = end.replace("#url#", url);
  }
  if(active) {
    text = cm.getLine(startPoint.line);
    start = text.slice(0, startPoint.ch);
    end = text.slice(startPoint.ch);
    cm.replaceRange(start + end, {
      line: startPoint.line,
      ch: 0
    });
  } else {
    text = cm.getSelection();
    cm.replaceSelection(start + text + end);

    startPoint.ch += start.length;
    if(startPoint !== endPoint) {
      endPoint.ch += start.length;
    }
  }
  cm.setSelection(startPoint, endPoint);
  cm.focus();
}

function toggleSidePanel() {
  if(document.getElementById("previewPanel").style.display == "block"){
    document.getElementById("previewPanel").style.display = "none";
    document.getElementById("pref").style.display = "none";
    document.getElementById("textPanel").style.width = "100%";
  }else{
    document.getElementById("previewPanel").style.display = "block";
    document.getElementById("pref").style.display = "block";
    document.getElementById("textPanel").style.width = "50%";
  }
}
