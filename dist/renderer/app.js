"use strict";
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
// Modules
const { ipcRenderer } = require('electron');
const items = require('./items');
// Dom Nodes
const showModal = document.getElementById('show-modal');
const closeModal = document.getElementById('close-modal');
const modal = document.getElementById('modal');
const addItem = document.getElementById('add-item');
const itemUrl = document.getElementById('url');
const search = document.getElementById('search');
// Open new item modal
window.newItem = () => {
    showModal.click();
};
window.openItem = items.open; // Ref items.open globally
// Ref items.delete globally
window.deleteItem = () => {
    const selectedItem = items.getSelectedItem();
    items.delete(selectedItem.index);
};
window.openItemNative = items.openNative; // Open item in native browser
// Focus to search items
window.searchItems = () => {
    search.focus();
};
// Filter items with "search"
search.addEventListener('keyup', (e) => {
    Array.from(document.getElementsByClassName('read-item')).forEach((item) => {
        const hasMatch = item.innerText.toLowerCase().includes(search.value);
        item.style.display = hasMatch ? 'flex' : 'none'; // Hide items that don't match search value
    });
});
// Navigate item selection with up/down arrows
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        items.changeSelection(e.key);
    }
});
// Disable & Enable modal buttons
const toggleModalButtons = () => {
    // Check state of buttons
    if (addItem.disabled === true) {
        addItem.disabled = false;
        addItem.style.opacity = 1;
        addItem.innerText = 'Add Item';
        closeModal.style.display = 'inline';
    }
    else {
        addItem.disabled = true;
        addItem.style.opacity = 0.5;
        addItem.innerText = 'Adding...';
        closeModal.style.display = 'none';
    }
};
// Show modal
showModal.addEventListener('click', (e) => {
    modal.style.display = 'flex';
    itemUrl.focus();
});
// Hide modal
closeModal.addEventListener('click', (e) => {
    modal.style.display = 'none';
});
// Handle new item
addItem.addEventListener('click', (e) => {
    // Check a url exists
    if (itemUrl.value) {
        ipcRenderer.send('new-item', itemUrl.value); // Send new item url to main process
        toggleModalButtons(); // Disable buttons
    }
});
// Listen for new item from main process
ipcRenderer.on('new-item-success', (e, newItem) => {
    items.addItem(newItem, true); // Add new item to "items" node
    toggleModalButtons(); // Enable buttons
    // Hide modal and clear value
    modal.style.display = 'none';
    itemUrl.value = '';
});
// Listen for keyboard submit
itemUrl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter')
        addItem.click();
});
