/*!
* The MIT License (MIT)
* Copyright (c) 2016 Amit Merchant <bullredeyes@gmail.com>
 */

window.onload = function() {
  var plainText = document.getElementById('plainText');
  var markdownArea = document.getElementById('markdown');

  var convertTextAreaToMarkdown = function() {
    var markdownText = plainText.value;
    html = marked(markdownText);
    markdownArea.innerHTML = html;
  }

  plainText.addEventListener('input', convertTextAreaToMarkdown);
}
