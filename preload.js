// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//   setLocalStorageItem: (key, value) => {
//     ipcRenderer.send('set-localstorage-item', { key, value });
//   },
//   onLocalStorageUpdate: (callback) => {
//     ipcRenderer.on('localstorage-updated', (event, data) => {
//       callback(data);
//     });
//   }
// });

// window.addEventListener('DOMContentLoaded', () => {
//   const originalSetItem = localStorage.setItem;
//   localStorage.setItem = function(key, value) {
//     window.electron.setLocalStorageItem(key, value);
//     originalSetItem.apply(this, arguments);
//   };

//   if (window.electron && window.electron.onLocalStorageUpdate) {
//     window.electron.onLocalStorageUpdate((data) => {
//       console.log("Updating local storage", data);
//       for (const [key, value] of Object.entries(data)) {
//         originalSetItem.call(localStorage, key, value);
//       }
//     });
//   } else {
//     console.error("window.electron or window.electron.onLocalStorageUpdate is undefined");
//   }
// });