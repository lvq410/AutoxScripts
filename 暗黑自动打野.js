auto.waitFor();

var common = require('./common.js');
common.setCaptureScreenLandscape(true);
var MediaDir = '/storage/emulated/0/Autox/Diablo/';
common.setMediaDir(MediaDir);
common.setSaveCaptureScreen(false);
var LogEnable = false;
common.setLogEnable(LogEnable);

var Run = false;
media.stopMusic()

var deviceLong = Math.max(device.width, device.height);
var deviceShort = Math.min(device.width, device.height);

var w = floaty.window(<horizontal bg='#000000' alpha="0.4">
    <button id='runBtn' w='60' h='43' text='启动' layout_gravity='center_vertical' marginTop='0' marginLeft='-3' marginRight='-2'/>
    <text id='time' bg='#ff0000' w='40' h='60' color='#ffffff' gravity='left|center_vertical' layout_gravity='center_vertical' marginRight='2'>00:00</text>
    <text id='text' bg='#ff0000' w='*' h='60' color='#ffffff' gravity='left|center_vertical' layout_gravity='center_vertical'>未运行</text>
</horizontal>);
w.setAdjustEnabled(true)
w.setPosition(parseInt((deviceLong-900)/2), 50)
w.setSize(900, 150)
w.exitOnClose()
w.text.click(function(){
    media.stopMusic()
})

var startTime = 0;
w.runBtn.click(function() {
    media.stopMusic()
    Run = !Run;
    if(!Run){
        refreshUI('已停止');
        return;
    }
    refreshUI('启动中','00:00');
    startTime = lastDecomposeTime = new Date().getTime();
});


var MaxRunTime = 20*60*1000;
var MaxDecomposeTime = 3*60*1000;
//var MaxDecomposeTime = 10*1000;

var lastDecomposeTime = 0;

setInterval(doRun, 1000);

function doRun(){
    if(!Run) return;
    var now = new Date().getTime()
    ui.run(function() {
        w.time.setText(common.timeFormat(now-startTime));
        w.text.setText(common.timeFormat(MaxDecomposeTime-(now-lastDecomposeTime))+' 后执行分解');
    });
    if(now-startTime>=MaxRunTime){
        Run = false;
        media.playMusic(MediaDir+'提醒.mp3');
        refreshUI('20分钟到');
        return;
    }
    if(now - lastDecomposeTime >= MaxDecomposeTime) {
        lastDecomposeTime = now;
        try{
            refreshUI('执行使魔分解');
            decompose()
        }catch(e){
            log('出现异常', e)
            Run = false;
            refreshUI('脚本异常'+e.message);
            media.playMusic(MediaDir+'提醒.mp3');
        }
    }
}

function decompose(){
    log('开始分解, 等待并点击【物品栏】');
    var point = common.clickImg('物品栏.jpg', {gap:1000, waitDisappearTimeout:2000});
    if(!point) throw new Error('找不到物品栏');
    else log('找到物品栏,坐标', point);
    
    log('检查并点击【使魔-功能列表】');
    var point = common.clickImg('使魔-功能列表.jpg', {waitDisplayTimeout:3000});
    if(!point) throw new Error('找不到使魔-功能列表');
    else log('找到使魔-功能列表,坐标', point);
    
    log('检查并点击【使魔-使魔分解】');
    var point = common.clickImg('使魔-使魔分解.jpg', {gap:1000, waitDisplayTimeout:3000, waitDisappearTimeout:2000});
    if(!point) throw new Error('找不到使魔-使魔分解');
    else log('找到使魔-使魔分解,坐标', point);
    
    log('检查并点击【使魔-确认分解】');
    var point = common.clickImg('使魔-确认分解.jpg', {waitDisplayTimeout:1000});
    if(!point) throw new Error('找不到使魔-确认分解');
    else log('找到使魔-确认分解,坐标', point);
}

function refreshUI(text, time){
    ui.run(function() {
        if(text) w.text.setText(text);
        w.text.attr('bg', Run?'#00ff00':'#ff0000');
        if(time) w.time.setText(time);
        w.time.attr('bg', Run?'#00ff00':'#ff0000');
        w.runBtn.setText(Run?'停止':'启动');
    });
}