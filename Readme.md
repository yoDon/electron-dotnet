# Electron + Create-React-App + dotnet

This example builds a stand-alone Electron + Create-React-App + dotnet application and installer. On Windows it builds the app into `./dist/win-unpacked/My Electron Python App.exe` and the installer into `./dist/My Electron DotNet App Setup 1.0.0.exe` (OSX and Linux destinations are similar). You can change the name of the application by changing the `name` property in `package.json`.

# Installation

```bash
# start with the obvious step you always need to do with node projects
npm install

# Depending on the packages you install, with Electron projects you may need to do 
# an npm rebuild to rebuild any included binaries for the current OS. It's probably
# not needed here but I do it out of habit because its fast and the issues can be
# a pain to track down if they come up and you dont realize a rebuild is needed
npm rebuild

# run a dev build of electron
npm run start

# convert the source code in dotnet/ into an executable, build the electron app 
# into a subdirectory of dist/, and run electron-packager to package the electron 
# app as a platform-specific installer in dist/
npm run build

# double-click to run the either the platform-specific app that is built into 
# a subdirectory of dist/ or the platform-specific installer that is built and 
# placed in the dist/ folder
```

# Debugging the dotnet process

To test the dotnet GraphQL server, in a conda activated terminal window run `npm run dotnet-build`, cd into the newly generated `dotnet/bin/release/netcoreapp2.1/` platform folder, and run `api.exe --apiport 5000 --signingkey devkey` then browse to `http://127.0.0.1:5000/graphiql/` to access a GraphiQL view of the server. For a more detailed example, try `http://127.0.0.1:5000/graphiql/?query={calc(math:"1/2",signingkey:"devkey")}` which works great if you copy and paste into the browser but which is a complex enough URL that it will confuse chrome if you try to click directly on it.

# Notes

The electron main process both spawns the dotnet child process and creates the window. The electron renderer process communicates with the dotnet backend via GraphQL web service calls.

The C# class `dotnet/Calc.cs` provides a function: `Eval(string s)` that can take text like `1 + 1` and return the result like `2`. The calc functionality is exposed as a GraphQL api by `dotnet/startup.cs`.

The details of how the electron app launches the dotnet executable is tricky because of differences between packaged and unpackaged scenarios. This complexity is handled by `main/with-dotnet.ts`. If the Electron app is not packaged, the code needs to `spawn` the dotnet executable file. If the Electron app is packaged, it needs to `execFile` the packaged dotnet executable found in the app.asar. To decide whether the Electron app itself has been packaged for distribution or not, `main/with-dotnet.ts` checks whether the `__dirname` looks like an asar folder or not. Killing spawned processes under Electron can also be tricky so the electron main process sends a message to the dotnet server telling it to exit when Electron is shutting down (and yes, that does mean that if you are debugging and control-c to kill the process hosting the app you can leave a zombie dotnet process, so it's better to close the app normally by closing the window before killing your npm process).
