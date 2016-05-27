function toggleFormat(type){
  var startPoint = cm.getCursor("start");
  var endPoint = cm.getCursor("end");
  if(type == "bold") {
    var start_chars = "**";
  } else if(type == "italic") {
    var start_chars = "_";
  } else if(type == "strikethrough") {
    var start_chars = "~~";
  }
  text = cm.getSelection();
  var start = start_chars;
  var end = start_chars;
  text = text.split("**").join("");
  text = text.split("__").join("");
  if(type == "bold") {
    text = text.split("**").join("");
    text = text.split("__").join("");
  } else if(type == "italic") {
    text = text.split("*").join("");
    text = text.split("_").join("");
  } else if(type == "strikethrough") {
    text = text.split("~~").join("");
  }
  cm.replaceSelection(start + text + end);
  startPoint.ch += start_chars.length;
  endPoint.ch = startPoint.ch + text.length;
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
