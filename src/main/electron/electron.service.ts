import { Injectable, OnModuleInit } from '@nestjs/common';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

@Injectable()
export class ElectronService implements OnModuleInit {
  mainWindow!: BrowserWindow;

  onModuleInit() {
    app.whenReady().then(this.createWindow);
  }

  installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return Promise.all(
      extensions.map((name) => installer.default(installer[name], forceDownload))
    ).catch(console.log); // eslint-disable-line no-console
  };

  createWindow = async () => {
    if (process.env.NODE_ENV !== 'production') {
      await this.installExtensions();
    }

    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'; // eslint-disable-line require-atomic-updates
      this.mainWindow.loadURL(`http://localhost:2003`);
    } else {
      this.mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file:',
          slashes: true,
        })
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      // Open DevTools, see https://github.com/electron/electron/issues/12438 for why we wait for dom-ready
      this.mainWindow.webContents.once('dom-ready', () => {
        this.mainWindow!.webContents.openDevTools();
      });
    }
  };
}
