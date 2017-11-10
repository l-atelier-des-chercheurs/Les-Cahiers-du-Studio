# Les Cahiers du Studio

A time-based documentation tool to collaboratively keep notes and capture media from live experiences.

![dmk4q_fxkae_i70](https://user-images.githubusercontent.com/1948417/32667094-f8f3b43e-c639-11e7-98e2-22de0502fa96.png)

# License

This app is under a [Creative Commons BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. It can be used, modified and shared freely as long as no commercial use is made.

# Install Les Cahiers du Studio

### Method 1 — the easy way

Download the latest release from the [release page](https://github.com/l-atelier-des-chercheurs/Les-Cahiers-du-Studio/releases).

### Method 2 — the long way

_You need [node.js](https://nodejs.org/) and [python 2.7](https://www.python.org/) to install this app with this method. On Windows, you also need to install Microsoft’s Windows Build Tools by following the instructions [here](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#prerequisites)._

#### 1. Download this repository

Click on *Clone or Download* in the top right corner of this page, then *Download ZIP*. Unpack this folder.

#### 2. Open a terminal window

Open a terminal window:

- Windows: (XP) use [this tutorial](http://wikistrea.fr/Comment_ouvrir_la_console_de_commande_Windows_en_mode_administrateur_%3F) to open a terminal on Windows or open Command Prompt in the start menu 
- macOS: go to Applications -> Utilities -> Terminal
- Linux: use a terminal app such as Terminal or Konsole

In your terminal, navigate to the Les-Cahiers-du-Studio-master folder with your terminal using the `cd` command:
```
cd path/to/Les-Cahiers-du-Studio-master
```

#### 3. Install dependencies

If you haven’t already, install the tool that will enable native modules to be used. To do this, follow the instructions here: https://github.com/nodejs/node-gyp

Then, install DoDoc’s dependencies (may take up to 5 minutes):
```
npm install
```  

Make sure to build native dependencies by running:

```
npm run rebuild
```
 
#### 4. Run Les Cahiers du Studio

Start from the folder in a terminal window with the following command:

```
npm start
```

#### Troubleshooting

If you get the *package mismatch* error, they are most probably due to native packages (looking at you sharp). Follow the instructions [here](https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md), and specifically:

```
# Electron's version.
export npm_config_target=1.7.5
# The architecture of Electron, can be ia32 or x64.
export npm_config_arch=x64
export npm_config_target_arch=x64
# Download headers for Electron.
export npm_config_disturl=https://atom.io/download/electron
# Tell node-pre-gyp that we are building for Electron.
export npm_config_runtime=electron
# Tell node-pre-gyp to build module from source code.
export npm_config_build_from_source=true
# Install all dependencies, and store cache to ~/.electron-gyp.
HOME=~/.electron-gyp npm install
```

# Tweak, fork and debug

### server-side

* Run `npm run debug` to start the server with a better debug in terminal

### client-side

To tweak and write some new SASS or client-side JS, you need to run the gulp task:

* `gulp watch`