var clkPref = function (opt) {
  currentValue = opt.value;
  if ( currentValue=='preview' ) {
    document.getElementById("htmlPreview").style.display = "none";
    document.getElementById("markdown").style.display = "block";
  } else if ( currentValue=='html' ) {
    document.getElementById("markdown").style.display = "none";
    document.getElementById("htmlPreview").style.display = "block";
  }
}

var changeTheme = function (opt) {
  currentValueTheme = opt.value;
  if ( currentValueTheme=='light' ) {
    cm.setOption("theme", "default");
  } else if ( currentValueTheme=='dark' ) {
    cm.setOption("theme", "base16-dark");
  }
}

function showToolBar(){
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
