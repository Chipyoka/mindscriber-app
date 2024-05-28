// Send a message to the main process
window.electron.ipcRenderer.send("message-from-renderer", "Hello i am mwape");

// Listen for a reply from the main process
window.electron.ipcRenderer.on("reply-from-main", (message) => {
	console.log(message); // Should print "Hello from the main process"
	const button = document.getElementById("send-message");
	button.addEventListener("click", () => {
		electron.ipcRenderer.send("message-from-renderer", "Message after button click");
	});
});

// document.addEventListener("DOMContentLoaded", () => {
// 	const fetchButton = document.getElementById("fetch-button");

// 	fetchButton.addEventListener("click", async () => {
// 		try {
// 			const rows = await window.electron.ipcRenderer.invoke("fetch-rows");
// 			console.log(rows);
// 		} catch (error) {
// 			console.error("Error fetching rows:", error);
// 		}
// 	});
// });

//////////////////////////////////////////////////////////////////////////////

// document.addEventListener("DOMContentLoaded", () => {
// 	const fetchButton = document.getElementById("fetch-button-2");

// 	fetchButton.addEventListener("click", async () => {
// 		const id = document.getElementById("row-id").value;
// 		try {
// 			const row = await window.electron.ipcRenderer.invoke("fetch-row-by-id", id);
// 			console.log(row);
// 			console.log("success");
// 		} catch (error) {
// 			console.error("Error fetching row:", error);
// 		}
// 	});
// });

///////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
	let currentNoteId = null; // Variable to store the current note ID

	// Function to fetch rows from the database
	async function fetchRows() {
		try {
			const rows = await window.electron.ipcRenderer.invoke("fetch-rows");
			console.log(rows);

			// Pass the rows to the displaying functions
			createButtons(rows);
		} catch (error) {
			console.error("Error fetching rows:", error);
		}
	}
	const closeViewModal = document.getElementById("closeView");

	closeViewModal.onclick = function () {
		viewModal.style.display = "none";
	};
	// Function to create buttons based on fetched rows
	function createButtons(rows) {
		const container = document.getElementById("entryDisplay");

		// Clear existing elements
		container.innerHTML = "";

		rows.forEach((row) => {
			// Create the main button element
			const button = document.createElement("button");
			button.type = "button";
			// button.id = "entry";
			button.classList.add("btn", "entry", "row");

			// Create the inner elements
			const noteCategory = document.createElement("div");
			noteCategory.classList.add("col-2", "left", "capitalize", "cat");
			noteCategory.textContent = row.NOTE_CATEGORY;

			const noteTitle = document.createElement("div");
			noteTitle.classList.add("col-4", "left", "capitalize", "cat");
			noteTitle.textContent = row.NOTE_TITLE;

			const noteDate = document.createElement("div");
			noteDate.classList.add("col-3", "right", "cat");
			noteDate.textContent = row.NOTE_DATE;

			const noteContent = document.createElement("div");
			noteContent.classList.add("cat");
			noteContent.textContent = row.NOTE_CONTENT;

			//  event for button

			button.addEventListener("click", () => {
				currentNoteId = row.NOTE_ID; // Store the note ID
				showViewNoteModal(row);
			});

			// Append inner elements to the button
			button.appendChild(noteCategory);
			button.appendChild(noteTitle);
			button.appendChild(noteDate);

			// Append the button to the container
			container.appendChild(button);
		});
	}

	// Function to show the view note modal
	function showViewNoteModal(note) {
		const viewModal = document.getElementById("viewModal");

		// Populate modal with note details
		document.getElementById("showCategory").textContent = note.NOTE_CATEGORY;
		document.getElementById("showTitle").textContent = note.NOTE_TITLE;
		document.getElementById("showContent").textContent = note.NOTE_CONTENT;
		document.getElementById("showDate").textContent = note.NOTE_DATE;

		// Display the modal
		viewModal.style.display = "block";
	}

	const viewModal = document.getElementById("viewModal");

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function (event) {
		if (event.target == viewModal) {
			viewModal.style.display = "none";
		}
	};

	// Delete note button handler
	const deleteNoteButton = document.getElementById("deleteModal");
	deleteNoteButton.addEventListener("click", async () => {
		if (currentNoteId) {
			try {
				await window.electron.ipcRenderer.invoke("delete-note", currentNoteId);
				console.log("Note deleted with ID:", currentNoteId);

				// Close the modal after deletion
				viewModal.style.display = "none";

				// Fetch rows and count again to update the list
				fetchRows();
				countNotes();
			} catch (error) {
				console.error("Error deleting note:", error);
			}
		}
	});

	// Fetch rows initially when the page loads
	fetchRows();

	/*
	Below function fetches the number of notes available in the table. There is 
	a handler defined in the main process, However i used the work-around of just getting the
	array lenght of the objects fetched by the fetch rows handle.
	*/

	async function countNotes() {
		try {
			const rows = await window.electron.ipcRenderer.invoke("fetch-rows");
			// console.log("count: " + rows.length);

			const count = rows.length;
			const newCount = String(count).padStart(2, "0");

			// Display number of notes
			const notesCount = document.getElementById("displayCount");
			notesCount.textContent = `Notes: ${newCount}`;
		} catch (error) {
			console.error("Error fetching rows:", error);
		}
	}
	countNotes();

	// Get the modal
	const modal = document.getElementById("myModal");

	// Get the button that opens the modal
	const openModalButton = document.getElementById("open-modal-button");

	// Get the <span> element that closes the modal
	const closeModalButton = document.getElementsByClassName("close")[0];

	// Get the form
	const addNoteForm = document.getElementById("add-note-form");

	// When the user clicks the button, open the modal
	openModalButton.onclick = function () {
		modal.style.display = "block";
	};

	// When the user clicks on <span> (x), close the modal
	closeModalButton.onclick = function () {
		modal.style.display = "none";
	};

	const closeButton = document.getElementById("closeModal");
	closeButton.onclick = function () {
		modal.style.display = "none";
		addNoteForm.reset();
	};

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	};

	// function to format date
	function formatDate(date) {
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

		const dayOfMonth = String(date.getDate()).padStart(2, "0");
		const month = months[date.getMonth()];
		const year = date.getFullYear();
		// const hours = String(date.getHours()).padStart(2, "0");
		// const minutes = String(date.getMinutes()).padStart(2, "0");

		return `${month} ${dayOfMonth}, ${year}`;
	}
	// function to format time
	function formatTime(date) {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		// const seconds = String(date.getSeconds()).padStart(2, "0");

		return `${hours}:${minutes}`;
	}

	function countSeconds(date) {
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `:${seconds}`;
	}

	function tick() {
		const currentDate = new Date();
		const formattedDate = formatDate(currentDate);

		const currentTime = new Date();
		const formattedTime = formatTime(currentTime);
		const formattedseconds = countSeconds(currentTime);
		// display time on screen
		const displayTime = document.getElementById("currentTime");
		displayTime.textContent = `${formattedTime}${formattedseconds} HRS`;

		const displayDate = document.getElementById("todayDate");
		displayDate.textContent = formattedDate;
	}

	tick();

	// Set interval to generate live clock
	setInterval(tick, 1000);

	// Handle form submission
	addNoteForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const noteCategory = document.getElementById("note-category").value;
		const noteTitle = document.getElementById("note-title").value;
		const noteContent = document.getElementById("note-content").value;

		//format date to post to database

		const currentDate = new Date();
		const formattedDate = formatDate(currentDate);

		const currentTime = new Date();
		const formattedTime = formatTime(currentTime);

		const fullDate = `${formattedDate} ${formattedTime}`;
		console.log(fullDate);

		try {
			const result = await window.electron.ipcRenderer.invoke("add-note", {
				note_category: noteCategory,
				note_title: noteTitle,
				note_content: noteContent,
				note_date: fullDate,
			});
			console.log("Note added with ID:", result.id);

			// After adding the note, close the modal and clear the form
			modal.style.display = "none";
			addNoteForm.reset();

			// Optionally, fetch rows and count again to update the list
			fetchRows();
			countNotes();
		} catch (error) {
			console.error("Error adding note:", error);
		}
	});
});
