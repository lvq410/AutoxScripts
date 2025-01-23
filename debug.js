auto.waitFor();
var common = require('./common.js')

setInterval(function(){}, 1000);

function stopEnginesExceptThis() {
    engines.all().forEach(function(engine) {
        if (engine!=engines.myEngine()) {
            engine.forceStop();
        }
    });
}

function startEngineSameFolder(scriptFileName) {
    engines.execScriptFile(engines.myEngine().cwd()+'/'+scriptFileName)
}

function restartScript(scriptFileName){
    engines.all().forEach(function(engine) {
        if(scriptFileName == files.getName(engine.getSource().toString())) {
            engine.forceStop();
        }
    });
    
    engines.execScriptFile(engines.myEngine().cwd()+'/'+scriptFileName)
}
