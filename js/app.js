/*!
* The MIT License (MIT)
* Copyright (c) 2016 Amit Merchant <bullredeyes@gmail.com>
 */

var showdown  = require('showdown');

window.onload = function() {
  var plainText = document.getElementById('plainText');
  var markdownArea = document.getElementById('markdown');

  var convertTextAreaToMarkdownAndHTML = function() {
    //Md -> Preview
    var markdownText = plainText.value;
    html = marked(markdownText);
    markdownArea.innerHTML = html;

    //Md -> HTML
    converter = new showdown.Converter();
    html      = converter.makeHtml(markdownText);
    document.getElementById("htmlPreview").value = html;
  }

  plainText.addEventListener('input', convertTextAreaToMarkdownAndHTML);
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
