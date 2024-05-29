const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// function to create a new window
function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1180,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"), // path to preload.js
			contextIsolation: true, // Important for security
			enableRemoteModule: false,
			nodeIntegration: false, // Disable node integration in renderer process
		},
	});
	// main window entry files
	mainWindow.loadFile("src/index.html");

	// Remove the default menu
	// mainWindow.removeMenu();
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

// Handle IPC communication - test communication

ipcMain.on("message-from-renderer", (event, arg) => {
	console.log(arg); // Print message from renderer process
	event.reply("reply-from-main", "Hello from the main process");
});

// Database initialization carried below

let db;

// Open database connection

function openDatabase() {
	if (!db) {
		const dbPath = app.isPackaged ? path.join(process.resourcesPath, "mindscriber.sqlite") : path.join(__dirname, "mindscriber.sqlite");

		db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				console.error("Failed to open database:", err);
			} else {
				console.log("Database opened successfully at", dbPath);
				initializeDatabase();
			}
		});
	}
}

// initialize and check if table exists or else create one

function initializeDatabase() {
	db.serialize(() => {
		db.run(
			`
            CREATE TABLE IF NOT EXISTS note (
                NOTE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                NOTE_CATEGORY TEXT,
                NOTE_TITLE TEXT,
                NOTE_CONTENT TEXT,
                NOTE_DATE TEXT
            )
        `,
			(err) => {
				if (err) {
					console.error("Error creating note table:", err);
				} else {
					console.log("Table 'note' ensured to exist.");
				}
			}
		);
	});
}

// new promise to perform db operations whilst open

function withDatabase(fn) {
	return new Promise((resolve, reject) => {
		openDatabase();
		fn(resolve, reject);
	});
}

// function to open the database connections
openDatabase();

// handler for feching notes (notes)
ipcMain.handle("fetch-note", async () => {
	return withDatabase((resolve, reject) => {
		db.all("SELECT * FROM note ORDER BY NOTE_ID DESC", [], (err, notes) => {
			if (err) {
				console.error("Error fetching notes:", err);
				reject(err);
			} else {
				resolve(notes);
			}
		});
	});
});

// handle for counting notes (notes)
ipcMain.handle("count-notes", async () => {
	return withDatabase((resolve, reject) => {
		db.all("SELECT COUNT(*) FROM note", [], (err, notes) => {
			if (err) {
				console.error("Error counting notes:", err);
				reject(err);
			} else {
				resolve(notes);
			}
		});
	});
});

// handle for fetching note by id
ipcMain.handle("fetch-note-by-id", async (event, id) => {
	return withDatabase((resolve, reject) => {
		db.all("SELECT * FROM note WHERE NOTE_ID = ?", [id], (err, note) => {
			if (err) {
				console.error("Error fetching note by ID:", err);
				reject(err);
			} else {
				resolve(note);
			}
		});
	});
});

// handle for adding a new note
ipcMain.handle("add-note", async (event, note) => {
	return withDatabase((resolve, reject) => {
		const {note_category, note_title, note_content, note_date} = note;

		const sql = "INSERT INTO note (NOTE_CATEGORY, NOTE_TITLE, NOTE_CONTENT, NOTE_DATE) VALUES (?, ?, ?, ?)";
		const params = [note_category, note_title, note_content, note_date];

		db.run(sql, params, function (err) {
			if (err) {
				console.error("Error adding note:", err);
				reject(err);
			} else {
				resolve({id: this.lastID});
			}
		});
	});
});

// handle for deleting a note
ipcMain.handle("delete-note", async (event, noteId) => {
	return withDatabase((resolve, reject) => {
		const sql = "DELETE FROM note WHERE NOTE_ID = ?";
		db.run(sql, [noteId], function (err) {
			if (err) {
				console.error("Error deleting note:", err);
				reject(err);
			} else {
				resolve({success: true});
			}
		});
	});
});

// handle for updating a note
ipcMain.handle("update-note", async (event, note) => {
	return withDatabase((resolve, reject) => {
		const {note_id, note_category, note_title, note_content} = note;
		const sql = "UPDATE note SET NOTE_CATEGORY = ?, NOTE_TITLE = ?, NOTE_CONTENT = ? WHERE NOTE_ID = ?";
		const params = [note_category, note_title, note_content, note_id];

		db.run(sql, params, function (err) {
			if (err) {
				console.error("Error updating note:", err);
				reject(err);
			} else {
				resolve();
			}
		});
	});
});

// Happy Coding Dev :)
// Happy Note Taking User :)
