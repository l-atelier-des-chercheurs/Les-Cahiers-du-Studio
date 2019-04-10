import localstore from 'store';

/** *********
  UTILS
***********/

// If click on a link with a specific class, open in the browser and not in electron.
document.body.addEventListener('click', openInNativeBrowser);

function openInNativeBrowser(event) {
  if (!(window && window.process && window.process.type)) {
    return;
  }
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
