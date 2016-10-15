const fs = require('fs');

const utils = {};

utils.formatTime = (h, m, s, d = '-') => {
  if(h < 10) {
    h = `0${h}`;
  }
  if(m < 10) {
    m = `0${m}`;
  }
  if(s < 10) {
    s = `0${s}`;
  }
  return `${h}${d}${m}${d}${s}`;
};

utils.getDirs = (rootDir, cb) => {

  fs.readdir(rootDir, function(err, files) {
    var dirs = [];
    for (var index = 0; index < files.length; ++index) {
      var file = files[index];
      if (file[0] !== '.') {
        var filePath = rootDir + '/' + file;
        fs.stat(filePath, function(err, stat) {
          if (stat.isDirectory()) {
            dirs.push(this.file);
          }
          if (files.length === (this.index + 1)) {
            return cb(dirs);
          }
        }.bind({index: index, file: file}));
      }
    }
  });

};

module.exports = utils;