# Obsidian Truth Table Plugin

This is an Obsidian plugin for auto-generating truth tables with pre-filled truth values.

## Features

Create tables manually with chosen number of variables and columns.

https://user-images.githubusercontent.com/38285861/135750457-b58c7fcc-6342-43c3-aa14-1151c6ad9cdf.mp4

**(pre v1.0.2)** Quickly create any size truth table.

https://user-images.githubusercontent.com/38285861/135750458-7c12df08-acc5-4309-b8a9-68bcc0a15717.mp4

**(v1.0.3 or later)** Create truth tables from LaTeX formula.

https://user-images.githubusercontent.com/38285861/135756625-8facb361-8cbd-4271-b265-c22feae04b02.mp4

## Changelog

Version 1.0.2:
- Initial release.

Version 1.0.3:
- Add ability to generate table from LaTeX formula.

Version 1.0.4:
- Use a more generic syntax parsing to handle more LaTeX commands.
- Allow no whitespace between command and brackets.

## Repository Maintanace

This section is related to maintanance of the plugin's repository.

### Releasing new releases

- Update your `manifest.json` with new version number.
- Commit changes.
- Create tag: `git tag 1.0.0`
- Push commits and tag: `git push --atomic origin master 1.0.0`

### How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.
