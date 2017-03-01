const fs = require('fs');
const path = require('path');

const options = {};
const eventHandlers = {};
const FILE_PATH = path.join(require('os').homedir(), '.shot');
const FILE_NAME = path.join(FILE_PATH, 'zloy-shot-app-options.json');

options.default = {
  isActive: false,
  interval: 15,
  folder: process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
};

options.get = Object.assign(options.default, {});

options.init = (cb) => {

  fs.readFile(FILE_NAME, (err, data) => {
    if(err) {
      options.save(options.default);
    } else {
      let opt;
      try {
        opt = JSON.parse(data);
      } catch(e) {
        console.log('error', e);
      }
      if(opt) {
        options.get = opt;
      }
    }
    if(typeof cb === 'function') {
      cb(options.get);
    }
    if(typeof eventHandlers.init === 'function') {
      eventHandlers.init(options.get);
    }
  });

};

options.on = (eventName, callback) => {
  eventHandlers[eventName] = callback;
};

options.set = (option, value) => {
  options.get[option] = value;
  options.save();
};

options.save = (opt) => {
  if (!fs.existsSync(FILE_PATH)){
    fs.mkdirSync(FILE_PATH);
  }
  fs.writeFile(FILE_NAME, JSON.stringify(opt ? opt : options.get));
};

options.init();

module.exports = options;