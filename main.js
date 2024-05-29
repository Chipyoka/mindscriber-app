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

//Database connection establishment
// const db = new sqlite3.Database(path.join(__dirname, "mindscriber.sqlite"));

// let db;

// function openDatabase() {
// 	if (!db) {
// 		const dbPath = path.join(app.getAppPath(), "mindscriber.sqlite");
// 		db = new sqlite3.Database(path.join(__dirname, "mindscriber.sqlite"), (err) => {
// 			if (err) {
// 				console.error("Failed to open database:", err);
// 			} else {
// 				console.log("Database opened successfully", dbPath);
// 			}
// 		});
// 	}
// }

// // Open the database initially
// openDatabase();

// // Function to ensure the database is open before executing a query
// function withDatabase(fn) {
// 	return new Promise((resolve, reject) => {
// 		openDatabase();
// 		fn(resolve, reject);
// 	});
// }

// // IPC handlers to fetch rows from the SQLite3 database
// ipcMain.handle("fetch-rows", async () => {
// 	return new Promise((resolve, reject) => {
// 		db.all("SELECT * FROM note ORDER BY NOTE_ID DESC", [], (err, rows) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(rows);
// 			}
// 		});
// 	});
// });

// //Handler for counting notes available.
// ipcMain.handle("count-notes", async () => {
// 	return new Promise((resolve, reject) => {
// 		db.all("SELECT COUNT(*) FROM note", [], (err, rows) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(rows);
// 			}
// 		});
// 	});
// });

// // Handler for fetching note by ID
// ipcMain.handle("fetch-row-by-id", async (event, id) => {
// 	return new Promise((resolve, reject) => {
// 		db.all("SELECT * FROM note WHERE NOTE_ID = ?", [id], (err, row) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(row);
// 			}
// 		});
// 	});
// });

// // Handler for inserting a new note
// ipcMain.handle("add-note", async (event, note) => {
// 	return new Promise((resolve, reject) => {
// 		const {note_category, note_title, note_content, note_date} = note;

// 		const sql = "INSERT INTO note (NOTE_CATEGORY, NOTE_TITLE, NOTE_CONTENT, NOTE_DATE) VALUES (?, ?, ?, ?)";
// 		const params = [note_category, note_title, note_content, note_date];

// 		db.run(sql, params, function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve({id: this.lastID}); // Return the ID of the newly inserted note
// 			}
// 		});
// 	});
// });

// // Handler for deleting a note
// ipcMain.handle("delete-note", async (event, noteId) => {
// 	return new Promise((resolve, reject) => {
// 		const sql = "DELETE FROM note WHERE NOTE_ID = ?";
// 		db.run(sql, [noteId], function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve({success: true});
// 			}
// 		});
// 	});
// });

// // Handler for updating the note
// ipcMain.handle("update-note", async (event, note) => {
// 	return new Promise((resolve, reject) => {
// 		const {note_id, note_category, note_title, note_content} = note;
// 		const sql = "UPDATE note SET NOTE_CATEGORY = ?, NOTE_TITLE = ?, NOTE_CONTENT = ? WHERE NOTE_ID = ?";
// 		const params = [note_category, note_title, note_content, note_id];

// 		db.run(sql, params, function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve();
// 			}
// 		});
// 	});
// });

// let db;

// function openDatabase() {
// 	if (!db) {
// 		const dbPath = app.isPackaged ? path.join(process.resourcesPath, "mindscriber.sqlite") : path.join(__dirname, "mindscriber.sqlite");

// 		db = new sqlite3.Database(dbPath, (err) => {
// 			if (err) {
// 				console.error("Failed to open database:", err);
// 			} else {
// 				console.log("Database opened successfully at", dbPath);
// 			}
// 		});
// 	}
// }

// openDatabase();

// function withDatabase(fn) {
// 	return new Promise((resolve, reject) => {
// 		openDatabase();
// 		fn(resolve, reject);
// 	});
// }

// ipcMain.handle("fetch-rows", async () => {
// 	return withDatabase((resolve, reject) => {
// 		db.all("SELECT * FROM note ORDER BY NOTE_ID DESC", [], (err, rows) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(rows);
// 			}
// 		});
// 	});
// });

// ipcMain.handle("count-notes", async () => {
// 	return withDatabase((resolve, reject) => {
// 		db.all("SELECT COUNT(*) FROM note", [], (err, rows) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(rows);
// 			}
// 		});
// 	});
// });

// ipcMain.handle("fetch-row-by-id", async (event, id) => {
// 	return withDatabase((resolve, reject) => {
// 		db.all("SELECT * FROM note WHERE NOTE_ID = ?", [id], (err, row) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(row);
// 			}
// 		});
// 	});
// });

// ipcMain.handle("add-note", async (event, note) => {
// 	return withDatabase((resolve, reject) => {
// 		const {note_category, note_title, note_content, note_date} = note;

// 		const sql = "INSERT INTO note (NOTE_CATEGORY, NOTE_TITLE, NOTE_CONTENT, NOTE_DATE) VALUES (?, ?, ?, ?)";
// 		const params = [note_category, note_title, note_content, note_date];

// 		db.run(sql, params, function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve({id: this.lastID});
// 			}
// 		});
// 	});
// });

// ipcMain.handle("delete-note", async (event, noteId) => {
// 	return withDatabase((resolve, reject) => {
// 		const sql = "DELETE FROM note WHERE NOTE_ID = ?";
// 		db.run(sql, [noteId], function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve({success: true});
// 			}
// 		});
// 	});
// });

// ipcMain.handle("update-note", async (event, note) => {
// 	return withDatabase((resolve, reject) => {
// 		const {note_id, note_category, note_title, note_content} = note;
// 		const sql = "UPDATE note SET NOTE_CATEGORY = ?, NOTE_TITLE = ?, NOTE_CONTENT = ? WHERE NOTE_ID = ?";
// 		const params = [note_category, note_title, note_content, note_id];

// 		db.run(sql, params, function (err) {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve();
// 			}
// 		});
// 	});
// });

let db;

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

function withDatabase(fn) {
	return new Promise((resolve, reject) => {
		openDatabase();
		fn(resolve, reject);
	});
}

openDatabase();

ipcMain.handle("fetch-rows", async () => {
	return withDatabase((resolve, reject) => {
		db.all("SELECT * FROM note ORDER BY NOTE_ID DESC", [], (err, rows) => {
			if (err) {
				console.error("Error fetching rows:", err);
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
});

ipcMain.handle("count-notes", async () => {
	return withDatabase((resolve, reject) => {
		db.all("SELECT COUNT(*) FROM note", [], (err, rows) => {
			if (err) {
				console.error("Error counting notes:", err);
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});
});

ipcMain.handle("fetch-row-by-id", async (event, id) => {
	return withDatabase((resolve, reject) => {
		db.all("SELECT * FROM note WHERE NOTE_ID = ?", [id], (err, row) => {
			if (err) {
				console.error("Error fetching row by ID:", err);
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
});

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
