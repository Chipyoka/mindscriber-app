// Send a message to the main process
window.electron.ipcRenderer.send("message-from-renderer", "Hello from THE BLACKGEEK");

// Listen for a reply from the main process
window.electron.ipcRenderer.on("reply-from-main", (message) => {
	console.log(message); // Should print "Hello from the main process"
	const button = document.getElementById("send-message");
	button.addEventListener("click", () => {
		electron.ipcRenderer.send("message-from-renderer", "Message after button click");
	});
});

document.addEventListener("DOMContentLoaded", () => {
	let currentNoteId = null; // Variable to store the current note ID
	const errorMessage = document.getElementById("showError");

	// Function to fetch notes from the database
	async function fetchnotes() {
		try {
			const notes = await window.electron.ipcRenderer.invoke("fetch-note");
			// console.log(notes);

			// Pass the notes to the displaying functions
			createButtons(notes);
		} catch (error) {
			console.error("Error fetching notes:", error);
		}
	}
	const closeViewModal = document.getElementById("closeView");

	closeViewModal.onclick = function () {
		viewModal.style.display = "none";
	};
	// Function to create buttons based on fetched notes
	function createButtons(notes) {
		const container = document.getElementById("entryDisplay");

		// Clear existing elements
		container.innerHTML = "";

		/*Below  i have implemented a logic to check if there a re no notes to display the 
		a message saying list empty should appear. This is done through checking the lenght of 
		the notes array. Because if it zero means there are no notes in the database
		*/

		if (notes.length < 1) {
			// console.log("Table Empty");

			// create element that displays the empty list element
			const emptyMessage = document.createElement("div");
			emptyMessage.classList.add("entry-display-no");

			const empty = document.createElement("p");
			empty.classList.add("empty");
			empty.textContent = "List Empty";

			const emptySub = document.createElement("p");
			emptySub.classList.add("empty-sub");
			emptySub.textContent = "Start by adding a new note now!";

			// Append the button to the div
			emptyMessage.appendChild(empty);
			emptyMessage.appendChild(emptySub);

			// Append the button to the container
			container.appendChild(emptyMessage);
		} else {
			// console.log("Table Has values");
			// Create the button that displays the notes

			notes.forEach((note) => {
				// Create the main button element
				const button = document.createElement("button");
				button.type = "button";
				button.title = " Click to View";
				button.classList.add("btn", "entry", "note");

				// Create the inner elements
				const noteCategory = document.createElement("div");
				noteCategory.classList.add("col-3", "left", "capitalize", "cat");
				noteCategory.textContent = note.NOTE_CATEGORY;

				const noteTitle = document.createElement("div");
				noteTitle.classList.add("col-4", "left", "capitalize", "cat");
				noteTitle.textContent = note.NOTE_TITLE;

				const noteDate = document.createElement("div");
				noteDate.classList.add("col-3", "right", "cat");
				noteDate.textContent = note.NOTE_DATE;

				const noteContent = document.createElement("div");
				noteContent.classList.add("cat");
				noteContent.textContent = note.NOTE_CONTENT;

				//  event for button
				button.addEventListener("click", () => {
					currentNoteId = note.NOTE_ID; // Store the note ID of clicked
					showViewNoteModal(note);
				});

				// Append inner elements to the button
				button.appendChild(noteCategory);
				button.appendChild(noteTitle);
				button.appendChild(noteDate);

				// Append the button to the container
				container.appendChild(button);
			});
		}
	}

	// Function to show the view note modal
	function showViewNoteModal(note) {
		const viewModal = document.getElementById("viewModal");

		// Populate modal with note details
		document.getElementById("showCategory").textContent = note.NOTE_CATEGORY;
		document.getElementById("showTitle").textContent = note.NOTE_TITLE;
		document.getElementById("showContent").textContent = note.NOTE_CONTENT;
		document.getElementById("showDate").textContent = note.NOTE_DATE;

		// Show the view note details and hide the edit form
		document.getElementById("note-details").style.display = "block";
		document.getElementById("edit-note-form").style.display = "none";

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

	/*
	Below i have implemented the edit logic that allows user to edit and update current note
	. First you open the view note modal, then you see edit button which opens a modal similar to 
	add note modal. The the fields are populated with already exists content so yo can edit through
	Validations is undertaken and then you can save.
	*/

	// Edit note button handler
	const editNoteButton = document.getElementById("edit-note-button");
	editNoteButton.addEventListener("click", () => {
		// Hide the view note details and show the edit form
		document.getElementById("note-details").style.display = "none";
		document.getElementById("edit-note-form").style.display = "block";

		// Populate the edit form with current note details
		document.getElementById("edit-note-category").value = document.getElementById("showCategory").textContent;
		document.getElementById("edit-note-title").value = document.getElementById("showTitle").textContent;
		document.getElementById("edit-note-content").value = document.getElementById("showContent").textContent;
	});

	// Save edit button handler
	const saveEditButton = document.getElementById("save-edit-button");
	saveEditButton.addEventListener("click", async () => {
		const editedNoteCategory = document.getElementById("edit-note-category").value;
		const editedNoteTitle = document.getElementById("edit-note-title").value;
		const editedNoteContent = document.getElementById("edit-note-content").value;

		// Validation logic for the fields being edited
		const textPattern = /^[A-Za-z\s]+$/; // Pattern to allow only letters and spaces

		if (!editedNoteCategory || !editedNoteTitle || !editedNoteContent) {
			errorMessage.textContent = "All fields must be filled !";
			return;
		}

		if (!textPattern.test(editedNoteTitle)) {
			errorMessage.textContent = "Title should only contain letters and spaces.";
			return;
		}

		if (!textPattern.test(editedNoteCategory)) {
			errorMessage.textContent = "Category should only contain letters and spaces.";
			return;
		}

		// Updating the note in the database
		try {
			const result = await window.electron.ipcRenderer.invoke("update-note", {
				note_id: currentNoteId,
				note_category: editedNoteCategory,
				note_title: editedNoteTitle,
				note_content: editedNoteContent,
			});
			console.log("Note updated with ID:", currentNoteId);

			// After updating the note, close the modal
			viewModal.style.display = "none";
			fetchnotes();
			countNotes();
		} catch (error) {
			console.error("Error updating note:", error);
		}
	});

	/*
	 Below i have implemented the delete note handler from the main process. On top, 
	 there is a var currentNoteId set null and updated on event click to view, then stored
	 then used to delete the note based on that id.
	*/

	// Delete note button handler
	const deleteNoteButton = document.getElementById("deleteModal");
	deleteNoteButton.addEventListener("click", async () => {
		if (currentNoteId) {
			try {
				await window.electron.ipcRenderer.invoke("delete-note", currentNoteId);
				console.log("Note deleted with ID:", currentNoteId);

				// Close the modal after deletion
				viewModal.style.display = "none";

				// Fetch notes and count again to update the list
				fetchnotes();
				countNotes();
			} catch (error) {
				console.error("Error deleting note:", error);
			}
		}
	});

	// Fetch notes initially when the page loads
	fetchnotes();

	/*
	Below function fetches the number of notes available in the table. There is 
	a handler defined in the main process, However i used the work-around of just getting the
	array lenght of the objects fetched by the fetch notes handle.
	*/

	async function countNotes() {
		try {
			const notes = await window.electron.ipcRenderer.invoke("fetch-note");
			// console.log("count: " + notes.length);

			const count = notes.length;
			const newCount = String(count).padStart(2, "0");

			// Display number of notes
			const notesCount = document.getElementById("displayCount");
			notesCount.textContent = `Notes: ${newCount}`;
		} catch (error) {
			console.error("Error fetching notes:", error);
		}
	}

	// fetch note count initially when the page loads
	countNotes();

	// Get the modal
	const modal = document.getElementById("myModal");

	// Get the button that opens the modal
	const openModalButton = document.getElementById("open-modal-button");

	// Get the form
	const addNoteForm = document.getElementById("add-note-form");

	//  open the modal When the add note button is clicked
	openModalButton.onclick = function () {
		modal.style.display = "block";
	};

	// close modal when the close button is clicked
	const closeButton = document.getElementById("closeModal");
	closeButton.onclick = function () {
		modal.style.display = "none";
		addNoteForm.reset();
		errorMessage.textContent = " ";
	};

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
			errorMessage.textContent = " ";
		}
	};

	// function to format date
	function formatDate(date) {
		// Array of months in short
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

	// get seconds seperately
	function countSeconds(date) {
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `:${seconds}`;
	}

	// tick tok every second to update live clock and date
	function tick() {
		// set current time and date
		const currentDate = new Date();
		const formattedDate = formatDate(currentDate);

		const currentTime = new Date();
		const formattedTime = formatTime(currentTime);
		const formattedseconds = countSeconds(currentTime);

		// display time on screen
		const displayTime = document.getElementById("currentTime");
		displayTime.textContent = `${formattedTime}${formattedseconds} HRS`;

		// display date
		const displayDate = document.getElementById("todayDate");
		displayDate.textContent = formattedDate;
	}

	// call tick function
	tick();

	// Set interval to generate live clock
	setInterval(tick, 1000);

	/*
	Below is the handle to submit the data collected from the form.
	*/
	// Handle form submission
	addNoteForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		// get elements fo input fields
		const noteCategory = document.getElementById("note-category").value;
		const noteTitle = document.getElementById("note-title").value;
		const noteContent = document.getElementById("note-content").value;

		// Validation logic defined below
		const textPattern = /^[A-Za-z\s]+$/; // Pattern to allow only letters and spaces

		// check if fields are empty
		if (!noteCategory || !noteTitle || !noteContent) {
			errorMessage.textContent = "All fields must be filled !";
			return;
		}

		// check for symbols in Title and Category
		if (!textPattern.test(noteTitle)) {
			errorMessage.textContent = "Title should only contain letters and spaces.";
			return;
		}

		if (!textPattern.test(noteCategory)) {
			errorMessage.textContent = "Category should only contain letters and spaces.";
			return;
		}

		//format date to post to database

		const currentDate = new Date();
		const formattedDate = formatDate(currentDate);

		const currentTime = new Date();
		const formattedTime = formatTime(currentTime);

		const fullDate = `${formattedDate} ${formattedTime}`;
		console.log(fullDate);

		// call API to post values to Database
		try {
			const result = await window.electron.ipcRenderer.invoke("add-note", {
				note_category: noteCategory,
				note_title: noteTitle,
				note_content: noteContent,
				note_date: fullDate,
			});
			// log ID of added note
			console.log("Note added with ID:", result.id);

			// After adding the note, close the modal and clear the form
			modal.style.display = "none";
			addNoteForm.reset();

			// fetch notes and count again to update the list
			fetchnotes();
			countNotes();
		} catch (error) {
			console.error("Error adding note:", error);
		}
	});

	/* Not killing the dream of allowing top text to be dynamic so added an array of 
	my desired phrases to be interating as the app is open. */

	function setTopText() {
		// Array of phrases
		const texts = ["Hello Scriber !", "Track your Ideas", "Capture your Thoughts"];

		//get random text by random value representing index
		const randomIndex = Math.floor(Math.random() * texts.length);
		const newText = texts[randomIndex];

		// set top text
		const topText = document.getElementById("theme");
		topText.textContent = newText;
	}
	// call function initially when the page loads
	setTopText();

	// change phrase at interval
	setInterval(setTopText, 10000);
});

/*

::Developed from scratch with the soul purpose of;
1. Learning Desktop App Development with Electron JS
2. Sharpen my JavaScript Coding Skills
3. Writing a Efficient and Clean Code.

Deloveped BY THE BLACKGEEK :)

Happy Note Taking !

*/
