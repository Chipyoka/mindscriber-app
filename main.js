const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let mainWindow;
let loaderWindow;
// icon for the app
const iconPath = path.join(__dirname, "src/public/favicon2.ico");

// function to create loader window
function createLoaderWindow() {
	loaderWindow = new BrowserWindow({
		width: 1180,
		height: 700,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: false,
			enableRemoteModule: false,
			contextIsolation: true,
		},
	});

	loaderWindow.loadFile(path.join(__dirname, "src/loader.html"));
	// Remove the default menu
	loaderWindow.removeMenu();
}

function createMainWindow() {
	// Creating the window
	mainWindow = new BrowserWindow({
		width: 1180,
		height: 700,
		icon: iconPath,
		backgroundColor: "#232323",
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
	mainWindow.removeMenu();
	// Show main window after 2 seconds
	setTimeout(() => {
		loaderWindow.close();
		mainWindow.show();
	}, 15000);
}

app.on("ready", () => {
	createLoaderWindow();
	createMainWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createLoaderWindow();
		createMainWindow();
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
		const dbPath = app.isPackaged
			? path.join(process.resourcesPath, "mindscriber.sqlite")
			: path.join(__dirname, "mindscriber.sqlite");

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

// initialize and check if table exists or else create one and insert a welcoming note

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

					// Check if the table is empty
					db.get("SELECT COUNT(*) AS count FROM note", (err, row) => {
						if (err) {
							console.error("Error checking table contents:", err);
						} else {
							if (row.count === 0) {
								// function to format date
								function formatDate(date) {
									// Array of months in short
									const months = [
										"Jan",
										"Feb",
										"Mar",
										"Apr",
										"May",
										"Jun",
										"Jul",
										"Aug",
										"Sep",
										"Oct",
										"Nov",
										"Dec",
									];

									// get date
									const dayOfMonth = String(date.getDate()).padStart(2, "0");
									const month = months[date.getMonth()];
									const year = date.getFullYear();

									// return date
									return `${month} ${dayOfMonth}, ${year}`;
								}
								// function to format time
								function formatTime(date) {
									// get time
									const hours = String(date.getHours()).padStart(2, "0");
									const minutes = String(date.getMinutes()).padStart(2, "0");

									// return time
									return `${hours}:${minutes}`;
								}
								//format date to post to database

								const currentDate = new Date();
								const formattedDate = formatDate(currentDate);

								const currentTime = new Date();
								const formattedTime = formatTime(currentTime);

								const fullDate = `${formattedDate} ${formattedTime}`;
								console.log(fullDate);

								// Table is empty, insert welcome note
								const welcomeNote = {
									category: "Getting Started",
									title: "Welcome",
									content:
										"Hello Mindscriber, I'm thrilled to have you on board. This application is designed to help you manage your notes efficiently and effectively. Create new notes, and track your thoughts with ease. If you have any questions, feel free to reach out to THE BLACKGEEK. Happy note-taking!",
									date: fullDate,
								};

								const sql = `
                                    INSERT INTO note (NOTE_CATEGORY, NOTE_TITLE, NOTE_CONTENT, NOTE_DATE) 
                                    VALUES (?, ?, ?, ?)
                                `;
								const params = [
									welcomeNote.category,
									welcomeNote.title,
									welcomeNote.content,
									welcomeNote.date,
								];

								db.run(sql, params, function (err) {
									if (err) {
										console.error("Error inserting welcome note:", err);
									} else {
										console.log("Welcome note added with ID:", this.lastID);
									}
								});
							} else {
								console.log("Table 'note' is not empty, no welcome note added.");
							}
						}
					});
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

		const sql =
			"INSERT INTO note (NOTE_CATEGORY, NOTE_TITLE, NOTE_CONTENT, NOTE_DATE) VALUES (?, ?, ?, ?)";
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
		const sql =
			"UPDATE note SET NOTE_CATEGORY = ?, NOTE_TITLE = ?, NOTE_CONTENT = ? WHERE NOTE_ID = ?";
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

/*

::Developed from scratch with the so purpose of;
1. Learning Desktop App Development with Electron JS
2. Sharpen my JavaScript Coding Skills
3. Writing a Efficient and Clean Code.

Deloveped BY THE BLACKGEEK :)

Happy Coding Dev :)
Happy Note Taking User :)

*/
