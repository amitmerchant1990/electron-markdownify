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
