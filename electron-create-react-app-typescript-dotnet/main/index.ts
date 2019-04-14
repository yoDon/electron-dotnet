import { app, BrowserWindow } from "electron"; // tslint:disable-line
import * as path from "path";
import "./with-dotnet";

const isDev = (process.env.NODE_ENV === "development");

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", () => {
  if (isDev) {
    const sourceMapSupport = require("source-map-support"); // tslint:disable-line
    sourceMapSupport.install();
  }
  createWindow();
});

function createWindow() {
  const win = new BrowserWindow();
  win.webContents.openDevTools();
  if (isDev) {
    win.loadURL("http://localhost:3000/index.html");
  } else {
    win.loadURL(`file://${path.join(__dirname, "/../build/index.html")}`);
  }
}
