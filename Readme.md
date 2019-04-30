# Electron + C# dotnet

This sample shows how to build C# dotnet apps that run in Electron. I'm using it to combine .NET backends with React frontends but if you prefer to use Razor or Blazor or some other aspnet core based frontend tech that should be a very simple thing to add. The Electron main (backend) process spawns a dotnet core webserver and provides a randomly generated authentication token to both the webserver and the Electron renderer (frontend) process for use in authenticating messages sent between the frontend and the webserver. 

The webserver currently exposes a GraphQL endpoint for the frontend to interact with but the backend is just a plain old dotnet exe so you can tweak it to host whatever sort of Razor, Blazor, MVC, REST, WebApi, or other dotnet web services as might be needed by your application. The React frontend part of the sample is similarly based on a stock create-react-app site, so it should be easy to customize as needed. The only significant embelishments to the stock cra app are (1) the bare minimal amount of https://github.com/sharegate/craco to support hooking into electron without needing to eject the create react app and (2) typescript support, which you don't have to use but if you're a C# developer you're almost certainly going to want sooner or later.

This example builds a stand-alone Electron + Create-React-App + dotnet application and installer. On Windows it builds the app into `./dist/win-unpacked/My Electron DotNet App.exe` and the installer into `./dist/My Electron DotNet App Setup 1.0.0.exe` (OSX and Linux destinations are similar). You can change the name of the application by changing the `name` property in `package.json`.

# Installation

```bash
# start with the obvious step you always need to do with node projects
npm install

# Depending on the packages you install, with Electron projects you may need to do 
# an npm rebuild to rebuild any included binaries for the current OS. It's probably
# not needed here but I do it out of habit because its fast and the issues can be
# a pain to track down if they come up and you dont realize a rebuild is needed
npm rebuild

# prep the dotnet build environment
dotnet restore dotnet/api.csproj

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

To test the dotnet GraphQL server, run `npm run dotnet-build`, cd into the newly generated `dotnet/bin/release/netcoreapp2.1/` platform folder, and run `api.exe --apiport 5000 --signingkey devkey` then browse to `http://127.0.0.1:5000/graphiql/` to access a GraphiQL view of the server. For a more detailed example, try `http://127.0.0.1:5000/graphiql/?query={calc(math:"1/2",signingkey:"devkey")}` which works great if you copy and paste into the browser but which is a complex enough URL that it will confuse chrome if you try to click directly on it.

# Notes

The electron main process both spawns the dotnet child process and creates the window. The electron renderer process communicates with the dotnet backend via GraphQL web service calls.

The C# class `dotnet/Calc.cs` provides a function: `Eval(string s)` that can take text like `1 + 1` and return the result like `2`. The calc functionality is exposed as a GraphQL api by `dotnet/startup.cs`.

The details of how the electron app launches the dotnet executable is tricky because of differences between packaged and unpackaged scenarios. This complexity is handled by `main/with-dotnet.ts`. If the Electron app is not packaged, the code needs to `spawn` the dotnet executable file. If the Electron app is packaged, it needs to `execFile` the packaged dotnet executable found in the app.asar. To decide whether the Electron app itself has been packaged for distribution or not, `main/with-dotnet.ts` checks whether the `__dirname` looks like an asar folder or not. 

# Important

Killing spawned processes under Electron can be tricky so the electron main process sends a message to the dotnet server telling it to exit when Electron is shutting down (and yes, that does mean that if you are debugging and control-c to kill the npm process hosting the app you can leave a zombie dotnet process, so it's better to close the app normally by closing the window before killing your npm process).
