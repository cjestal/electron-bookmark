const { app, BrowserWindow, ipcMain } = require('electron');
const windowStateKeeper = require('electron-window-state');
const readItem = require('./readItem');

let mainWindow; // global reference of the window

// Listen for new item request
ipcMain.on('new-item', (e, itemUrl) => {
  // Get new item and send back to renderer
  readItem(itemUrl, (item) => {
    e.sender.send('new-item-success', item);
  });
});

function createWindow() {
  // Remember window dimensions when it's closed
  const state = windowStateKeeper({
    defaultWidth: 500, defaultHeight: 650,
  });

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 350,
    maxWidth: 650,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadFile('renderer/main.html'); // Load index.html into the new BrowserWindow
  state.manage(mainWindow); // Manage new window state

  // Listen for window being closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron `app` is ready
app.on('ready', createWindow);

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
