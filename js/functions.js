var clkPref = (opt) => {
  currentValue = opt.value;
  if ( currentValue=='preview' || opt===false ) {
    document.getElementById("htmlPreview").style.display = "none";
    document.getElementById("markdown").style.display = "block";
    document.getElementById('previewRadio').checked = true;
    config.set('isHtml', false);
  } else {
    document.getElementById("markdown").style.display = "none";
    document.getElementById("htmlPreview").style.display = "block";
    document.getElementById('htmlRadio').checked = true;
    config.set('isHtml', true);
  }
}

var changeTheme = (opt) => {
  currentValueTheme = opt.value;
  if ( currentValueTheme=='light' || opt===false) {
    cm.setOption("theme", "default");
    document.getElementById("previewPanel").className = "col-md-6 full-height";
    document.getElementById('lightThemeRadio').checked = true;
    config.set('darkMode', false);
  } else {
    cm.setOption("theme", "base16-dark");
    document.getElementById("previewPanel").className = "col-md-6 full-height preview-dark-mode";
    document.getElementById('darkThemeRadio').checked = true;
    config.set('darkMode', true);
  }
}

var showToolBar = () => {
  if(document.getElementById("toolbarArea").style.display == "block"){
    document.getElementById("angleToolBar").className = "";
    document.getElementById("angleToolBar").className = "fa fa-angle-double-right";
    document.getElementById("toolbarArea").style.display = "none";
    document.getElementById("editArea").style.paddingTop = "24px";
  }else{
    document.getElementById("angleToolBar").className = "";
    document.getElementById("angleToolBar").className = "fa fa-angle-double-down";
    document.getElementById("toolbarArea").style.display = "block";
    document.getElementById("editArea").style.paddingTop = "53px";
  }
}

// Generations and clean state of CodeMirror
var getGeneration = () => {
  return this.cm.doc.changeGeneration();
}

var setClean = () => {
  this.latestGeneration = this.getGeneration();
}

var isClean = () => {
  return this.cm.doc.isClean(this.latestGeneration);
}

// Update window title on various events
var updateWindowTitle = (path) => {
  var appName = "Markdownify",
      isClean = this.isClean(),
      saveSymbol = "*",
      parsedPath,
      dir,
      title;

  if (path) {
    parsedPath = parsePath(path);
    dir = parsedPath.dirname || process.cwd();
    title = parsedPath.basename + " - " + dir + " - " + appName;
  } else {
    title = "New document - " + appName;
  }
  if (!this.isClean()) {
    title = saveSymbol + title;
  }
  document.title = title;
}
