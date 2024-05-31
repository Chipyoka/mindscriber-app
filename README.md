# Mindscriber - A Note Taking Desktop Application

Welcome to **Mindscriber**, a sleek and efficient note-taking application built with Electron.js, SQLite3, Bootstrap, HTML, vanilla JavaScript, and CSS. This application is designed to provide a seamless note-taking experience on Windows.

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Development](#development)
    -   [Project Structure](#project-structure)
    -   [IPC Communication](#ipc-communication)
    -   [Database Setup](#database-setup)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   **User-Friendly Interface**: Built with Bootstrap for a responsive and clean UI.
-   **Text Editing**: Create and format your notes with ease.
-   **Persistent Storage**: Save notes locally using SQLite3.
-   **Cross-Platform Support**: Primarily for Windows, but can be extended to other platforms.
-   **Offline Access**: Access your notes without an internet connection.

## Installation

To run Mindscriber locally, follow these steps:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/Chipyoka/mindscriber-app
    cd mindscriber
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Run the application**:
    ```bash
    npm start
    ```

-   **Or**:
    You can download the setup file [Here](https://github.com/Chipyoka/mindscriber-app/releases/download/v1.0.0/Mindscriber-1.0.0.Setup.exe) for windows 10 OS x64.

## Usage

After installation, launch the application:

1. **Create a Note**: Click the "Add Note" button to create a new note.
2. **Edit a Note**: Use the text editor to format your notes.
3. **Save a Note**: Your notes are saved automatically in the local SQLite3 database.
4. **Delete a Note**: You can delete a note in the local SQLite3 database.

## Development

### Project Structure

The project structure is as follows:

```
mindscriber/
├── prebuilds/             # Sqlite3 prebuilt binaries
├── src/
│   └── assets/            # Downloaded bootstrap file
│   └── public/            # public assets and icons
│   └── App.css            # Custom CSS styles
│   └── index.html         # Main HTML file
│   └── loader.html        # HTML file for Loader
│   └── index.js           # Script File
│   └── .gitignore         # Git ignore file
├── main.js                # Main process
├── renderer.js            # Renderer process
├── mindscriber.sqlite     # SQLite3 database file
├── preload.js             # Script to expose main process handles
├── forge.config.js        # Electron-forge config file
├── package.json           # Metadata and configurations
├── README.md              # README file

```

### IPC Communication

Electron.js uses Inter-Process Communication (IPC) to enable communication between the main process and renderer processes. In Mindscriber, IPC is used for various tasks such as fetching and saving notes with the help of the preload.js script.

**Example**: Greeting from main to renderer process.

In `main.js`:

```javascript
// Send a message to the renderer process
const { ipcMain } = require('electron');
ipcMain.on("message-from-renderer", (event, arg) => {
	console.log(arg); // Print message from renderer process
	event.reply("reply-from-main", "Hello from the main process");
});

```

In `preload.js`:

```javascript
// Expose the Electron API to the renderer
const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electron", {
	ipcRenderer: {
		send: (channel, data) => {
			ipcRenderer.send(channel, data);
		},
		on: (channel, func) => {
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		},
	},
});

```

In `renderer.js`:

```javascript
// Send a message to the main process
window.electron.ipcRenderer.send("message-from-renderer", "Hello from the renderer process");
```

### Database Setup

SQLite3 is used to store notes locally. The database setup and queries are handled in `main.js` and then exposed to the `renderer.js` through `preload.js`.

**Example**: Setting up the SQLite3 database.

In `database.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./notes.db');

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
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding standards and include detailed commit messages.

## License

This project is licensed under the MIT License.

---

Thank you for using Mindscriber! We hope this application helps you stay organized and productive. If you have any questions or feedback, please feel free to reach out.

---
