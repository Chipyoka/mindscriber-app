const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1180,
		height: 800,
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
		db.all("SELECT * FROM note ORDER BY NOTE_ID DESC", [], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
});

//Handler for counting notes available.
ipcMain.handle("count-notes", async () => {
	return new Promise((resolve, reject) => {
		db.all("SELECT COUNT(*) FROM note", [], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
});

// Handler for fetching note by ID
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

// Handler for inserting a new note
ipcMain.handle("add-note", async (event, note) => {
	return new Promise((resolve, reject) => {
		const {note_category, note_title, note_content, note_date} = note;

		const sql =
			"INSERT INTO note (NOTE_CATEGORY, NOTE_TITLE, NOTE_CONTENT, NOTE_DATE) VALUES (?, ?, ?, ?)";
		const params = [note_category, note_title, note_content, note_date];

		db.run(sql, params, function (err) {
			if (err) {
				reject(err);
			} else {
				resolve({id: this.lastID}); // Return the ID of the newly inserted note
			}
		});
	});
});

// Handler for deleting a note
ipcMain.handle("delete-note", async (event, noteId) => {
	return new Promise((resolve, reject) => {
		const sql = "DELETE FROM note WHERE NOTE_ID = ?";
		db.run(sql, [noteId], function (err) {
			if (err) {
				reject(err);
			} else {
				resolve({success: true});
			}
		});
	});
});
