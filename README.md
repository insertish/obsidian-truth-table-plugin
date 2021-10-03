# Obsidian Truth Table Plugin

This is an Obsidian plugin for auto-generating truth tables with pre-filled truth values.

## Features

Create tables manually with chosen number of variables and columns.

https://user-images.githubusercontent.com/38285861/135750457-b58c7fcc-6342-43c3-aa14-1151c6ad9cdf.mp4

**(UI is pre-v1.0.2)** Quickly create any size truth table.

https://user-images.githubusercontent.com/38285861/135750458-7c12df08-acc5-4309-b8a9-68bcc0a15717.mp4

**(v1.0.3 or later)** Create truth tables from LaTeX formula.

https://user-images.githubusercontent.com/38285861/135756625-8facb361-8cbd-4271-b265-c22feae04b02.mp4

## How To Use

Configure how the plugin should fill out your tables in settings.

![Plugin Settings](https://user-images.githubusercontent.com/38285861/135760247-45a9b0c0-b19f-4faf-a148-b7c41b0ba3e9.png)

Open your command palette and type in "Truth Tables":

![Palette](https://user-images.githubusercontent.com/38285861/135760267-135d4921-24bb-44c7-8cc8-d5732ec3b903.png)

Selecting the first option will allow you to manually create a truth table:

![image](https://user-images.githubusercontent.com/38285861/135760331-2b0af9e9-8bf1-404f-92b7-003586a94737.png)

Which will generate the following table:

|$p$|$q$|$r$|$p \land q$|$r \lor p$|
|:-:|:-:|:-:|:-:|:-:|
| F | F | F |   |   |
| F | F | T |   |   |
| F | T | F |   |   |
| F | T | T |   |   |
| T | F | F |   |   |
| T | F | T |   |   |
| T | T | F |   |   |
| T | T | T |   |   |

You may generate a truth table from a LaTeX formula by selecting the second option:

![image](https://user-images.githubusercontent.com/38285861/135760350-621143bc-227f-46c6-9f95-c65d9928d5da.png)

Which will generate the following table:

|$a$|$p$|$b$|$a \lor p$|$(a \lor p) \oplus b$|
|:-:|:-:|:-:|:-:|:-:|
| F | F | F |   |   |
| F | F | T |   |   |
| F | T | F |   |   |
| F | T | T |   |   |
| T | F | F |   |   |
| T | F | T |   |   |
| T | T | F |   |   |
| T | T | T |   |   |

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
