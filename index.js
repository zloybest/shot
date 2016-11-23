const electron = require('electron');
const {app, BrowserWindow, ipcMain, Tray, Menu} = electron;
const path = require('path');

// In the renderer process.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win,
  shotViewWin;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 280, height: 386, resizable: false, maximizable: false});

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/src/html/index.html`);

  // Open the DevTools.
  //win.webContents.openDevTools();


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  });
  trayInit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit()
  //}
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});



ipcMain.on('asynchronous-message', (e, arg) => {
  if(arg === 'hideWindow') {
    win.hide();
  } else if(arg === 'captureStart') {
    const iconName = 'app-icon-20.png';
    const iconPath = path.join(__dirname, 'src', 'img', iconName);
    appIcon.setImage(iconPath);
  } else if(arg === 'captureStop') {
    const iconName = 'app-icon-20-gray.png';
    const iconPath = path.join(__dirname, 'src', 'img', iconName);
    appIcon.setImage(iconPath);
  } else {
    arg = JSON.parse(arg);
    if (arg.cmd == 'captureShotView') {
      const {width} = electron.screen.getPrimaryDisplay().workAreaSize;
      shotViewWin = new BrowserWindow({
        show: true,
        skipTaskbar: true,
        titleBarStyle: 'hidden-inset',
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        x: width - 400,
        y: 20,
        width: 400,
        height: 160
      });
      shotViewWin.loadURL(`file://${__dirname}/src/html/shotview.html?${arg.path}`);
    }
    if (arg.cmd == 'captureShotViewClose') {
      shotViewWin.close();
    }
  }
});

let appIcon = null;

function trayInit() {
  //const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'tray.png'
  const iconName = 'app-icon-20-gray.png';
  const iconPath = path.join(__dirname, 'src', 'img', iconName);
  appIcon = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([{
    label: 'Show',
    click: function () {
      win.show();
    }
  }, {
    label: 'Quit',
    click: function () {
      app.quit();
    }
  }]);
  appIcon.setContextMenu(contextMenu);
}




// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.