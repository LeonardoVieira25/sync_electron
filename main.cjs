const { app, BrowserWindow, Menu } = require('electron');

const URL_PATH = 'https://solar.tecsci.com.br/';

// Ensure the app is a single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    createWindow();
  });

  let mainWindow;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        partition: 'persist:shared-session',
      }
    });

    mainWindow.loadURL(URL_PATH);

    mainWindow.setMenuBarVisibility(false);
  }

  function createMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Window',
            click: () => {
              createWindow();
            }
          },
          {
            label: 'Quit',
            click: () => {
              app.quit();
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}