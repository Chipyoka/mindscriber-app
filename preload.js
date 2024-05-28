const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld("electron", {
	ipcRenderer: {
		send: (channel, data) => {
			ipcRenderer.send(channel, data);
		},
		on: (channel, func) => {
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		},
		invoke: (channel, data) => {
			return ipcRenderer.invoke(channel, data);
		},
	},
});
/*
With the help of context bridge from electron, I exposed the above 
functions making it possible to access main process handles in the 
renderer and vice versa
 */
