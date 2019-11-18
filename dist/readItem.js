"use strict";
/* eslint-disable import/no-extraneous-dependencies */
const { BrowserWindow } = require('electron');
let offscreenWindow; // Offscreen BrowserWindow
module.exports = (url, callback) => {
    offscreenWindow = new BrowserWindow({
        width: 500,
        height: 500,
        show: false,
        webPreferences: {
            offscreen: true,
        },
    });
    offscreenWindow.loadURL(url); // Load item url
    // Wait for content to finish loading
    offscreenWindow.webContents.on('did-finish-load', (e) => {
        const title = offscreenWindow.getTitle(); // Get page title
        // Get screenshot (thumbnail)
        offscreenWindow.webContents.capturePage((image) => {
            const screenshot = image.toDataURL(); // Get image as dataURL
            callback({ title, screenshot, url }); // Execute callback with new item object
            // Clean up
            offscreenWindow.close();
            offscreenWindow = null;
        });
    });
};
