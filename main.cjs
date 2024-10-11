const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
let window;

const storageFilePath = path.join(__dirname, "localStorage.json");
const instanceId = uuidv4();
let isUpdatingFromFile = false;

let ses;

function createWindow() {
  console.log("Creating window");
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      partition: 'persist:shared-session',
      session: ses
    },
  });

  window.loadFile(path.join(__dirname, "dist", "index.html")).catch((err) => {
    console.error("Failed to load file:", err);
  });

  window.webContents.on('did-fail-load', () => {
    console.log("Failed to load, reloading");
    window.loadFile(path.join(__dirname, "dist", "index.html")).catch((err) => {
      console.error("Failed to reload file:", err);
    });
  });

  window.webContents.on('will-navigate', (event) => {
    console.log("Navigation prevented");
    event.preventDefault();
    window.loadFile(path.join(__dirname, "dist", "index.html")).catch((err) => {
      console.error("Failed to reload file:", err);
    });
  });

  window.webContents.on('new-window', (event) => {
    console.log("New window prevented");
    event.preventDefault();
    window.loadFile(path.join(__dirname, "dist", "index.html")).catch((err) => {
      console.error("Failed to reload file:", err);
    });
  });

  // window.webContents.executeJavaScript(`localStorage.setItem('instanceId', '${instanceId}')`);
  const data = JSON.parse(fs.readFileSync(storageFilePath));
  Object.keys(data).forEach(key => {
    console.log("Setting item", key, data[key]);
    window.webContents.executeJavaScript(`localStorage.setItem('${key}', '${data[key]}')`);
  });
  window.webContents.executeJavaScript(`console.log("instanceId", '${instanceId}')`);

  window.webContents.executeJavaScript(`
    console.log("getting instance id");
    const { ipcRenderer } = require('electron');
    
    console.log("Instance ID", '${instanceId}');
    localStorage.setItem = function(key, value, ignore_id) {
    console.log("ignore_id", ignore_id);
      if (ignore_id == '${instanceId}') {
        console.log("Ignoring item", key, value);
        return;
      }
      ipcRenderer.send('setLocalStorageItem', { key, value });
      console.log("Setting item", key, value);
    };
  `);


  // Watch for changes in localStorage.json
  fs.watch(storageFilePath, (eventType) => {
    if (eventType === 'change' && !isUpdatingFromFile) {
      isUpdatingFromFile = true;
      const data = JSON.parse(fs.readFileSync(storageFilePath));
      // if (data._lastUpdatedBy === instanceId) {
      //   isUpdatingFromFile = false;
      //   return;
      // }
      BrowserWindow.getAllWindows().forEach(win => {
        Object.keys(data).forEach(key => {
          console.log("pelo id ", instanceId);
          win.webContents.executeJavaScript(`localStorage.setItem('${key}', '${data[key]}', '${instanceId}')`);
        });
      });
      isUpdatingFromFile = false;
    }
  });
}

ipcMain.on('setLocalStorageItem', (event, { key, value }) => {
  console.log("Setting local storage item", key);
  const data = JSON.parse(fs.readFileSync(storageFilePath));
  data[key] = value;
  fs.writeFileSync(storageFilePath, JSON.stringify(data));
});

app.whenReady().then(() => {
  console.log("App is ready");
  ses = session.fromPartition('persist:shared-session');
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    console.log("All windows closed, quitting app");
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    console.log("Activating app, creating window");
    createWindow();
  }
});