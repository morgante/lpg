var app = global.app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var request = require('request');

var userHome = require('user-home');
var TinyStore = require(__dirname + '/tinystore');
var store = global.store = new TinyStore(userHome + '/.lpg');

// Don't quit app when closing any spawned windows
app.on('window-all-closed', function(e){
  e.preventDefault();
});

var defaultTitle = '💰 LPG';

var menuTemplate = [
  { label: "Settings", click: showOptions },
  { label: 'Quit', click: app.quit }
];

var appTray, contextMenu;

function updateScore() {
  var userKey = store.get('userKey');
  if (userKey && userKey !== '') {
    request('http://localhost:5000/api/user/' + userKey, {json: true}, function(err, response, body) {
      appTray.setTitle('💰 ' + body.points);
    });
  }
}

app.on('ready', function(){
  appTray = new Tray(null);
  contextMenu = Menu.buildFromTemplate(menuTemplate);
  appTray.setTitle(defaultTitle);
  appTray.setContextMenu(contextMenu);

  setInterval(updateScore, 500);
});

function showOptions(){
  var optionsWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    center: true,
    resizable: false,
    fullscreen: false,
    'always-on-top': true,
    title: 'Preferences'
  });
  optionsWindow.loadUrl('file://' + __dirname + '/preferences.html');
  optionsWindow.webContents.on('did-finish-load', function(){
    optionsWindow.show();
  });
};

store.on('change', function(key, value){
  if (key == 'userKey'){
    appTray.setTitle('LPG: ' + value + '  ');
  }
});

app.dock.hide();