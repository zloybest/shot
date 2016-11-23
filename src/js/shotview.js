const {ipcRenderer, shell} = require('electron');
const fs = require('fs');

const shotPath = window.location.search.substr(1);
const shot = document.querySelector('#shot');
shot.style.backgroundImage = `url("file://${shotPath}")`;
shot.addEventListener('click', () => {
  openScreenshot();
});

document.querySelector('#shot-delete').addEventListener('click', () => {
  deleteShot();
});

document.querySelector('#shot-close').addEventListener('click', () => {
  closeWindow();
});

let timeout = 10;
setInterval(() => {
  timeout--;
  if(timeout < 1) {
    return closeWindow();
  }
  document.querySelector('#shot-counter').innerText = timeout;
}, 1000);

const deleteShot = () => {
  fs.unlinkSync(shotPath);
  closeWindow();
};

const closeWindow = () => {
  ipcRenderer.send('asynchronous-message', JSON.stringify({cmd: 'captureShotViewClose'}));
};

const openScreenshot = () => {
  shell.openExternal('file://' + shotPath);
};
