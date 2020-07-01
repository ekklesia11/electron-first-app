const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const url = require("url");
const path = require("path");

// Set env
process.env.NODE_ENV = "production";

let mainWindow;
let addWindow;

// listen for app to be ready

app.on("ready", function () {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load html into window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  ); // file://dirname/index.html

  // Quit app when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
let createAddWindow = () => {
  // Create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add shopping list item",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load html into window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  ); // file://dirname/index.html

  // Garbage collection handle
  addWindow.on("closed", function () {
    addWindow = null;
  });
};

// Catch item:add
ipcMain.on("item:add", function (e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        accelerator: process.platform === "darwin" ? "Command+A" : "Ctrl+A",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Item",
        accelerator: process.platform === "darwin" ? "Command+C" : "Ctrl+C",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

// if MAC, add empty object to menu
if (process.platform === "darwin") {
  mainMenuTemplate.unshift({ label: "" });
}

if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer tool",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform === "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: "reload",
      },
    ],
  });
}
