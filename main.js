// const { app, BrowserWindow } = require('electron');
// const ipcMain = require('electron').ipcMain;

// function createWindow () {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       contextIsolation: true, // Keep context isolation enabled for security
//       nodeIntegration: false  // Disable Node.js integration
//     }
//   });

//   win.loadFile('src/index.html');

//   // Handle messages from the renderer process
//   ipcMain.on('message-from-renderer', (event, message) => {
//     console.log(message);
//     // Perform actions in the main process based on the message
//     event.sender.send('reply-from-main', `Main process received: ${message}`);
//   });
// }

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// const {app, BrowserWindow, ipcMain} = require("electron");

// function createWindow() {
// 	const win = new BrowserWindow({
// 		width: 800,
// 		height: 600,
// 		webPreferences: {
// 			nodeIntegration: true,
// 			contextIsolation: false, //Disables remote module execution
// 		},
// 	});

// 	win.loadFile("src/index.html");

// 	// Listen for messages from the renderer process
// 	ipcMain.on("message-from-renderer", (event, arg) => {
// 		console.log(arg); // Log the received message from renderer
// 		// Handle the message and send a response if needed
// 		event.sender.send("message-to-renderer", "Response from main process");
// 	});
// }

// app.whenReady().then(createWindow);

// app.on("window-all-closed", () => {
// 	if (process.platform !== "darwin") {
// 		app.quit();
// 	}
// });

// app.on("activate", () => {
// 	if (BrowserWindow.getAllWindows().length === 0) {
// 		createWindow();
// 	}
// });

const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true, // Important for security
			enableRemoteModule: false, // Deprecated: do not use in new applications
			nodeIntegration: false, // Disable node integration in renderer process
		},
	});

	mainWindow.loadFile("src/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// Handle IPC communication
ipcMain.on("message-from-renderer", (event, arg) => {
	console.log(arg); // Print message from renderer process
	event.reply("reply-from-main", "Hello from the main process");
});

//Database connection establishment
const db = new sqlite3.Database(path.join(__dirname, "mindscriber.sqlite"));

// IPC handler to fetch rows from the SQLite3 database
ipcMain.handle("fetch-rows", async () => {
	return new Promise((resolve, reject) => {
		db.all("SELECT * FROM note", [], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
});

ipcMain.handle("fetch-row-by-id", async (event, id) => {
	return new Promise((resolve, reject) => {
		db.all("SELECT * FROM note WHERE NOTE_ID = ?", [id], (err, row) => {
			if (err) {
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
});
