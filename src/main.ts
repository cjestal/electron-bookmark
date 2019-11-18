/* eslint-disable import/no-extraneous-dependencies */
import { app, BrowserWindow, ipcMain } from 'electron';
import windowStateKeeper from 'electron-window-state';
import readItem from './readItem';


export default class Main {
  mainWindow: BrowserWindow;
  // global reference of the window
  application: typeof app;

  constructor(application: typeof app, browserWindow: BrowserWindow) {
    this.mainWindow = browserWindow;
    this.application = application;
    this.application.on('ready', this.createWindow);
    this.application.on('window-all-closed', this.closeAll);
    this.application.on('activate', this.createWindow);
    this.watchNewItems();
  }

  private createWindow() {
    // Remember window dimensions when it's closed
    const state = windowStateKeeper({
      defaultWidth: 500, defaultHeight: 650,
    });

    this.mainWindow = new BrowserWindow({
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

    this.mainWindow.loadFile('renderer/main.html'); // Load index.html into the new BrowserWindow
    state.manage(this.mainWindow); // Manage new window state

    // Listen for window being closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private closeAll() {
    if (process.platform !== 'darwin') this.application.quit();
  }

  private watchNewItems() { // Listen for new item request
    ipcMain.on('new-item', (e, itemUrl: string) => {
      // Get new item and send back to renderer
      readItem(itemUrl, (item: any) => {
        e.sender.send('new-item-success', item);
      });
    });
  }
}
}