var common = require('../common.js')

var window = floaty.rawWindow(
    <horizontal bg='#000000' alpha="0.4" >
        <text id='handler' w='20' h='20' color='#ffffff' gravity='left|center_vertical'>十</text>
    </horizontal>
);
window.setSize(100, 100)
window.setPosition(100, 100)
setInterval(function(){}, 1000);

common.floatyMoveHandler(window, window.handler)
