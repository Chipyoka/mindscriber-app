const {FusesPlugin} = require("@electron-forge/plugin-fuses");
const {FuseV1Options, FuseVersion} = require("@electron/fuses");
const path = require("path");

module.exports = {
	packagerConfig: {
		asar: true,
		icon: path.join(__dirname, "src/public/favicon2.ico"), // actual path to icon
		extraFiles: [
			"./mindscriber.sqlite", // actual path to database
		],
	},
	rebuildConfig: {},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {},
		},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin"],
		},
		{
			name: "@electron-forge/maker-deb",
			config: {},
		},
		{
			name: "@electron-forge/maker-rpm",
			config: {},
		},
	],
	plugins: [
		{
			name: "@electron-forge/plugin-auto-unpack-natives",
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};

/*

::Developed from scratch with the so purpose of;
1. Learning Desktop App Development with Electron JS
2. Sharpen my JavaScript Coding Skills
3. Writing a Efficient and Clean Code.

Deloveped BY THE BLACKGEEK :)

Happy Note Taking !

*/
