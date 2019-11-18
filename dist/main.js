"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
const electron_1 = require("electron");
const electron_window_state_1 = __importDefault(require("electron-window-state"));
const readItem_1 = __importDefault(require("./readItem"));
class Main {
    constructor(application, browserWindow) {
        this.mainWindow = browserWindow;
        this.application = application;
        this.application.on('ready', this.createWindow);
        this.application.on('window-all-closed', this.closeAll);
        this.application.on('activate', this.createWindow);
        this.watchNewItems();
    }
    createWindow() {
        // Remember window dimensions when it's closed
        const state = electron_window_state_1.default({
            defaultWidth: 500, defaultHeight: 650,
        });
        this.mainWindow = new electron_1.BrowserWindow({
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
    closeAll() {
        if (process.platform !== 'darwin')
            this.application.quit();
    }
    watchNewItems() {
        electron_1.ipcMain.on('new-item', (e, itemUrl) => {
            // Get new item and send back to renderer
            readItem_1.default(itemUrl, (item) => {
                e.sender.send('new-item-success', item);
            });
        });
    }
}
exports.default = Main;
