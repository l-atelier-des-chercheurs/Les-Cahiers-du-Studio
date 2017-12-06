module.exports = (function() {
  let settings = require('./settings.json');

  // set lang here
  const API = {
    settings           : () => settings,
  };

  return API;
})();
