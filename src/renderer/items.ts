/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

const fs = require('fs');
const { shell } = require('electron');

// class Items {}

const items = document.getElementById('items'); // DOM nodes

// Get readerJS contents
let readerJS: any;
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString();
});

// Track items in storage
exports.storage = JSON.parse(localStorage.getItem('readit-items')) || [];

// Delete item
exports.delete = (itemIndex: number) => {
  items.removeChild(items.childNodes[itemIndex]); // Remove item from DOM
  this.storage.splice(itemIndex, 1); // Remove from storage
  this.save(); // Persist

  // Select previous item or new first item if first was deleted
  if (this.storage.length) {
    // Get new selected item index
    const newSelectedItemIndex = (itemIndex === 0) ? 0 : itemIndex - 1;

    // Set item at new index as selected
    document.getElementsByClassName('read-item')[newSelectedItemIndex].classList.add('selected');
  }
};

// Get selected item index
exports.getSelectedItem = () => {
  // Get selected node
  const currentItem = document.getElementsByClassName('read-item selected')[0];
  let itemIndex = 0; // Get item index
  let child = currentItem;
  while ((child = child.previousSibling) != null) itemIndex++;
  return { node: currentItem, index: itemIndex }; // Return selected item and index
};

// Persist storage
exports.save = () => {
  localStorage.setItem('readit-items', JSON.stringify(this.storage));
};

// Set item as selected
exports.select = (e: any) => {
  this.getSelectedItem().node.classList.remove('selected'); // Remove currently selected item class
  e.currentTarget.classList.add('selected'); // Add to clicked item
};

// Move to newly selected item
exports.changeSelection = (direction: string) => {
  const currentItem = this.getSelectedItem(); // Get selected item

  // Handle up/down
  if (direction === 'ArrowUp' && currentItem.node.previousSibling) {
    currentItem.node.classList.remove('selected');
    currentItem.node.previousSibling.classList.add('selected');
  } else if (direction === 'ArrowDown' && currentItem.node.nextSibling) {
    currentItem.node.classList.remove('selected');
    currentItem.node.nextSibling.classList.add('selected');
  }
};

// Open item in native browser
exports.openNative = () => {
  if (!this.storage.length) return; // Only if we have items
  const selectedItem = this.getSelectedItem(); // Get selected item
  shell.openExternal(selectedItem.node.dataset.url); // Open in system browser
};

// Open selected item
exports.open = () => {
  if (!this.storage.length) return; // Only if we have items (in case of menu open)
  const selectedItem = this.getSelectedItem(); // Get selected item
  const contentURL = selectedItem.node.dataset.url; // Get item's url

  // Open item in proxy BrowserWindow
  const readerWin = window.open(contentURL, '', `
    maxWidth=2000,
    maxHeight=2000,
    width=1200,
    height=800,
    backgroundColor=#DEDEDE,
    nodeIntegration=0,
    contextIsolation=1
  `);

  // Inject JavaScript with specific item index (selectedItem.index)
  readerWin.eval(readerJS.replace('{{index}}', selectedItem.index));
};

// Add new item
exports.addItem = (item: any, isNew: boolean = false) => {
  const itemNode = document.createElement('div'); // Create a new DOM node
  itemNode.setAttribute('class', 'read-item'); // Assign "read-item" class
  itemNode.setAttribute('data-url', item.url); // Set item url as data attribute
  itemNode.innerHTML = `<img src="${item.screenshot}"><h2>${item.title}</h2>`;
  items.appendChild(itemNode); // Append new node to "items"
  itemNode.addEventListener('click', this.select); // Attach click handler to select
  itemNode.addEventListener('dblclick', this.open); // Attach open doubleclick handler

  // If this is the first item, select it
  if (document.getElementsByClassName('read-item').length === 1) {
    itemNode.classList.add('selected');
  }

  // Add item to storage and persist
  if (isNew) {
    this.storage.push(item);
    this.save();
  }
};

// Listen for "Done" message from reader window
window.addEventListener('message', (e) => {
  // Check for correct message
  if (e.data.action === 'delete-reader-item') {
    this.delete(e.data.itemIndex); // Delete item at given index
    e.source.close(); // Close the reader window
  }
});

// Add items from storage when app loads
this.storage.forEach((item) => {
  this.addItem(item);
});
