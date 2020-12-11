# UBC course selection page timezone fix

This Chrome extension (well, you could probably use it as a user script as well)
localizes the times on UBC's course selection pages to your local time zone.

It will highlight days in red if they are different in your timezone than they
are in Vancouver, *after* updating them to be in your local timezone. This is
because of the below:

**Important Note/Bug**: we are not clever enough to change the schedule popup
beyond changing the times to local *without* moving around the
entries, so if a date is in red, it is not going to line up with the date on
the popup.

I don't have resources to fix this, but if anyone is interested in
fixing it, please file a pull request!

## Building this for yourself

### Prerequisites

* [node + npm](https://nodejs.org/) (Current Version)

## Project Structure

* src/typescript: TypeScript source files
* src/assets: static files
* dist: Chrome Extension directory
* dist/js: Generated JavaScript files

## Setup

```
npm install
```

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`

## Load extension to chrome

Load `dist` directory