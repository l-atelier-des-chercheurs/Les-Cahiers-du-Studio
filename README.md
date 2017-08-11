# Documentation Boilerplate

## A starting point for media documentation tools

Features: 
- accepts images and videos
- uses a folder/media structure, with text files to store informations
- can be made into a native app for window/linux/mac
- creates a server where other devices on the same local network can connect, for example a smartphone connected via wifi can browse and send information
- folders are protected with passwords
- no password means a folder is public, and can be edited by anyone

## How to install

You need node.js and npm to install this preview of stvdoc

In a terminal : 

1. `git clone --recursive https://github.com/louis-ev/stv-documentation path/to/the/folder`
2. `cd path/to/the/folder`
3. `npm install`

Now run stvdoc by writing

* `npm start`

## How to tweak, fork and debug

### server-side

* Run `npm run debug` to start the server with a better debug in terminal

### client-side

To tweak and write some new SASS or client-side JS, you need to run the gulp task:

* `gulp`