import childProcess from "child_process";
import crossSpawn from "cross-spawn";
import { app, dialog, ipcMain } from "electron"; // tslint:disable-line
import fs from "fs";
import getPort from "get-port";
import * as path from "path";
import superagent from "superagent";
import uuid from "uuid";

const DOTNET_SUFFIX = (process.platform === "win32") ? "win" : (process.platform === "darwin") ? "osx" : (process.platform === "linux") ? "ubuntu" : "unknown";
const DOTNET_DIST_FOLDER = "dotnet-" + DOTNET_SUFFIX;
const DOTNET_FOLDER = "dotnet";
const DOTNET_BASENAME = "api";

const isDev = (process.env.NODE_ENV === "development");

let dotnetProc = null as any;

const apiDetails = {
  port:0,
  signingKey:"",
};

const initializeApi = async () => {
  // dialog.showErrorBox("success", "initializeApi");
  const availablePort = await getPort();
  apiDetails.port = isDev ? 5000 : availablePort;
  const key = isDev ? "devkey" : uuid.v4();
  apiDetails.signingKey = key;

  const srcPath = path.join(__dirname, "..", DOTNET_FOLDER, DOTNET_BASENAME + ".csproj");
  const exePath = (process.platform === "win32") ? path.join(__dirname.replace("app.asar", "app.asar.unpacked"), "..", DOTNET_DIST_FOLDER, DOTNET_BASENAME + ".exe") : path.join(__dirname, DOTNET_DIST_FOLDER, DOTNET_BASENAME);

  if (__dirname.indexOf("app.asar") > 0) {
    // dialog.showErrorBox("info", "packaged");
    if (fs.existsSync(exePath)) {
      dotnetProc = childProcess.execFile(exePath, ["--apiport", String(apiDetails.port), "--signingkey", apiDetails.signingKey], {}, (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          console.log(stderr);
        }
      });
      if (dotnetProc === undefined) {
        dialog.showErrorBox("Error", "dotnetProc is undefined");
      } else if (dotnetProc === null) {
        dialog.showErrorBox("Error", "dotnetProc is null");
      }
    } else {
      dialog.showErrorBox("Error", "Packaged dotnet app not found");
    }
  } else {
    // dialog.showErrorBox("info", "unpackaged");
    if (fs.existsSync(srcPath)) {
      dotnetProc = crossSpawn("dotnet", [
        "run",
        "-p", srcPath,
        "--",
        "--apiport", String(apiDetails.port),
        "--signingkey", apiDetails.signingKey,
      ]);

    } else {
      dialog.showErrorBox("Error", "Unpackaged dotnet source not found");
    }
  }
  if (dotnetProc === null || dotnetProc === undefined) {
    dialog.showErrorBox("Error", "unable to start dotnet server");
  } else {
    console.log("Server running at http://127.0.0.1:" + apiDetails.port);
  }
  console.log("leaving initializeApi()");
};

ipcMain.on("getApiDetails", (event:Electron.Event) => {
  if (apiDetails.signingKey !== "") {
    event.sender.send("apiDetails", JSON.stringify(apiDetails));
  } else {
    initializeApi()
      .then(() => {
        event.sender.send("apiDetails", JSON.stringify(apiDetails));
      })
      .catch(() => {
        event.sender.send("apiDetailsError", "Error initializing API");
      });
  }
});

const exitDotnetProc = () => {
  //
  // NOTE: killing processes in node is surprisingly tricky and a simple
  //       pyProc.kill() totally isn't enough. Instead send a message to
  //       the pyProc web server telling it to exit
  //
  superagent.get("http://127.0.0.1:" + apiDetails.port + "/graphql/?query=%7Bexit(signingkey:\"" + apiDetails.signingKey + "\")%7D").then().catch();
  dotnetProc = null;
};

app.on("will-quit", exitDotnetProc);
