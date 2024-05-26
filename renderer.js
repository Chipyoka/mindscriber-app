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
	const fetchButton = document.getElementById("fetch-button");

	fetchButton.addEventListener("click", async () => {
		try {
			const rows = await window.electron.ipcRenderer.invoke("fetch-rows");
			console.log(rows);
		} catch (error) {
			console.error("Error fetching rows:", error);
		}
	});
});

document.addEventListener("DOMContentLoaded", () => {
	const fetchButton = document.getElementById("fetch-button-2");

	fetchButton.addEventListener("click", async () => {
		const id = document.getElementById("row-id").value;
		try {
			const row = await window.electron.ipcRenderer.invoke("fetch-row-by-id", id);
			console.log(row);
			console.log("success");
		} catch (error) {
			console.error("Error fetching row:", error);
		}
	});
});
