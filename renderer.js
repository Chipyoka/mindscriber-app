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

document.addEventListener("DOMContentLoaded", () => {
	let currentNoteId = null; // Variable to store the current note ID
	const errorMessage = document.getElementById("showError");

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

		console.log("Trying: " + rows.length);
		/*Below  i have implemented a logic to check if there a re no notes to display the 
		a message saying list empty should appear. This is done through checking the lenght of 
		the rows array. Because if it zero means there are no notes in the database
		*/

		if (rows.length < 1) {
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
			// Create the button that displays the rows

			rows.forEach((row) => {
				// Create the main button element
				const button = document.createElement("button");
				button.type = "button";
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
					currentNoteId = row.NOTE_ID; // Store the note ID of clicked
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

			// fetch rows and count again to update the list
			fetchRows();
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
