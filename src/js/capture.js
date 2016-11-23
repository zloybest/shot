const electron = require('electron');
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;
const {ipcRenderer} = electron;

const fs = require('fs');
const os = require('os');
const path = require('path');
const zipFolder = require('zip-folder');

const options = require('../js/options');
const { formatTime, getDirs } = require('../js/utils');

const startBtn = document.querySelector('button');
const showArchivesBtn = document.querySelector('.archive-hide');
const archiveDatesContainer = document.querySelector('.archive-dates-container');
const screenshotMsg = document.getElementById('screenshot-path');
const destinationBtn = document.querySelector('.destination-path-change');
const hideBtn = document.querySelector('.btn-hide');
const screenshotIntervalInput = document.querySelector('.screenshot-interval');

let captureInterval = null;

document.querySelector('#testBtn').addEventListener('click', () => {
  showShotView('');
});

options.on('init', (options) => {
  screenshotIntervalInput.value = options.interval;
  document.querySelector('.archive-date-header').addEventListener('click', () => {
    archiveFolderClick('today');
  });
  document.querySelector('.destination-path-value').value = options.folder;

  archiveFoldersBuild();

});

function archiveFoldersBuild() {
  archiveDatesContainer.innerHTML = '';
  getDirs(options.get.folder, dirs => {
    for(let i = dirs.length - 1; i >= 0; i--) {
      if(/(\d+).(\d+).(\d+)/.test(dirs[i])) {
        const folderNode = document.createElement('div');
        folderNode.className = 'archive-date';
        folderNode.innerText = dirs[i];
        folderNode.addEventListener('click', () => {
          archiveFolderClick(dirs[i]);
        });
        archiveDatesContainer.appendChild(folderNode);
      }
    }
  });
}

function startCapture() {
  if(parseFloat(options.get.interval) <= 0) {
    return;
  }
  options.get.isActive = true;
  document.querySelector('#capture-btn').innerText = 'Stop';
  captureInterval = setInterval(capture, (parseFloat(options.get.interval) || 1) * 1000 * 60);
  ipcRenderer.send('asynchronous-message', 'captureStart');
}

function stopCapture() {
  options.get.isActive = false;
  document.querySelector('#capture-btn').innerText = 'Start';
  clearInterval(captureInterval);
  ipcRenderer.send('asynchronous-message', 'captureStop');
}

function capture() {
  const thumbSize = determineScreenShotSize();

  desktopCapturer.getSources({types: ['screen'], thumbnailSize: thumbSize}, function (error, sources) {
    if (error) return console.log(error);

    sources.forEach(function (source) {
      if (source.name === 'Entire screen' || source.name === 'Screen 1') {
        const d = new Date;
        const folderName = `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
        const fileName = `${formatTime(d.getHours(), d.getMinutes(), d.getSeconds())}.png`;
        const screenshotFolderPath = path.join(options.get.folder, folderName);
        const screenshotPath = path.join(screenshotFolderPath, fileName);

        if (!fs.existsSync(screenshotFolderPath)){
          fs.mkdirSync(screenshotFolderPath);
        }

        fs.writeFile(screenshotPath, source.thumbnail.toPng(), function (error) {
          if (error) return console.log(error);
          showShotView(screenshotPath);
          // shell.openExternal('file://' + screenshotPath);
          // const message = `Saved screenshot to: ${screenshotPath}`;
          // screenshotMsg.textContent = message;
        });
      }
    })
  })
}

function showShotView(pathToScreenshot) {
  ipcRenderer.send('asynchronous-message', JSON.stringify({cmd: 'captureShotView', path: pathToScreenshot}));
}

startBtn.addEventListener('click', function () {
  if(options.get.isActive) {
    stopCapture();
  } else {
    startCapture();
  }
});

showArchivesBtn.addEventListener('click', () => {
  if(archiveDatesContainer.classList.contains('archive-dates-container-hided')) {
    archiveDatesContainer.classList.remove('archive-dates-container-hided');
    showArchivesBtn.innerText = 'Hide';
  } else {
    archiveDatesContainer.classList.add('archive-dates-container-hided');
    showArchivesBtn.innerText = 'Show all';
  }
});

destinationBtn.addEventListener('click', () => {
  const dialog = document.querySelector('.destination-folder-select');
  dialog.value = null;
  dialog.onchange = e => {
    const path = e.target.files[0].path;
    options.set('folder', path);
    document.querySelector('.destination-path-value').value = path;
    archiveFoldersBuild();
  };
  dialog.click();
});

hideBtn.addEventListener('click', () => {
  ipcRenderer.send('asynchronous-message', 'hideWindow');
});



screenshotIntervalInput.addEventListener('input', e => {
  let f = e.target.value,
    s = [];
  for(let i = 0; i < f.length; i++) {
    const c = f[i];
    if(c === '.' || c === ',') {
      s.push('.');
      continue;
    }
    if(isFinite(parseInt(c))) {
      s.push(c);
    }
  }
  s = s.join('');
  let t = parseFloat(s);
  if(!isFinite(t)) {
    e.target.value = 0;
  } else {
    e.target.value = s;
  }
  options.set('interval', t);
});

function determineScreenShotSize() {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return {
    width: maxDimension * window.devicePixelRatio,
    height: maxDimension * window.devicePixelRatio
  }
}

function archiveFolderClick(folderName) {
  const dialog = document.querySelector('.archive-folder-select');
  if(folderName === 'today') {
    const d = new Date;
    folderName = `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`;
  }
  dialog.value = null;
  dialog.onchange = e => {
    archiveSave(folderName, e.target.files[0].path);
  };
  dialog.click();
}

function archiveSave(folderName, saveToPath) {
  const zipFilePath = path.join(saveToPath, `Screenshots_${os.hostname()}_${folderName}.zip`);
  zipFolder(path.join(options.get.folder, folderName), zipFilePath, err => {
    if(err) {
      console.log('zipFolder error', err);
    } else {
      shell.showItemInFolder(zipFilePath);
    }
  });
}