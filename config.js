'use strict';
const Config = require('electron-config');

module.exports = new Config({
  defaults: {
    darkMode: false,
    isSyncScroll: false,
    isHtml: false
  }
});
