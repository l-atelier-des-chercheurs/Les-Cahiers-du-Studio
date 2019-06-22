/***********
  UTILS
***********/

function openInNativeBrowser(event) {
  event.path.every(item => {
    if (
      item.classList !== undefined &&
      item.classList.length > 0 &&
      item.classList.contains('js--openInBrowser')
    ) {
      const shell = window.require('electron').shell;
      event.preventDefault();
      shell.openExternal(item.href);
      return false;
    }
    return true;
  });
}

function openRightClickMenu() {}

if (window && window.process && window.process.type) {
  document.body.addEventListener('click', openInNativeBrowser);

  openRightClickMenu();
}

document.addEventListener(
  'dragover',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

document.addEventListener(
  'drop',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

import main from './vue/app.js';
