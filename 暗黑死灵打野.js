auto.waitFor();

var common = require('./common.js');
common.setCaptureScreenLandscape(true);
var MediaDir = '/storage/emulated/0/Autox/Diablo/';
common.setMediaDir('/storage/emulated/0/Autox/Diablo/');
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

var SkillRegion = [parseInt(deviceLong*0.7), parseInt(deviceShort*0.43)];
log('技能按钮区域', SkillRegion)
var FuncRegion = [parseInt(deviceLong*0.63), parseInt(deviceShort*0.47),
    parseInt(deviceLong*(0.81-0.63)), parseInt(deviceShort*(0.86-0.47))]
log('功能按钮区域', FuncRegion)
var ReviveRegion = [parseInt(deviceLong*0.55), parseInt(deviceShort*0.64),
    parseInt(deviceLong*(0.88-0.55)), parseInt(deviceShort*(0.8-0.64))]
log('复活按钮区域', ReviveRegion)
var QuestRegion = [parseInt(deviceLong*0.25), parseInt(deviceShort*0.25),
    parseInt(deviceLong*(0.75-0.25)), parseInt(deviceShort*(0.75-0.25))]
log('答题弹窗区域', QuestRegion)
var TeammateMissionRegion = [parseInt(deviceLong*0.29), parseInt(deviceShort*0.41),
    parseInt(deviceLong*(0.70-0.29)), parseInt(deviceShort*(0.82-0.41))]
log('队友任务区域', TeammateMissionRegion)

var lastRunTime = 0;
w.runBtn.click(function() {
    media.stopMusic()
    Run = !Run;
    if(!Run){
        refreshUI('已停止');
        threads.shutDownAll()
        return;
    }
    refreshUI('启动中','00:00');
    lastRunTime = new Date().getTime();
    threads.start(function() {
        while(true) {
            try{
                var errMsg = doRun();
                if(errMsg){
                    Run = false;
                    refreshUI(errMsg+'(点我关闭音乐)');
                    media.playMusic(MediaDir+'提醒.mp3');
                    break;
                }
                sleep(500);
            }catch(e){
                if(Run){
                    log('出现异常', e)
                    Run = false;
                    refreshUI('脚本异常(点我关闭音乐)');
                    media.playMusic(MediaDir+'提醒.mp3');
                }
                break;
            }
        }
    });
});
w.text.click(function(){
    media.stopMusic()
})

var MaxRunTime = 5*60*1000;

setInterval(checkMaxRunTimeout, 1000);

function checkMaxRunTimeout(){
    if(!Run) return;
    var now = new Date().getTime()
    ui.run(function() {
        w.time.setText(common.timeFormat(now-lastRunTime));
    });
    if(now-lastRunTime<MaxRunTime) return;
    
    Run = false;
    media.playMusic(MediaDir+'提醒.mp3');
    threads.shutDownAll()
    refreshUI('5分钟到(点我关闭音乐)');
}

function doRun(){
    var d; //记录是否有执行动作
    var point; //记录每次图片点击位置的临时变量
    point = common.clickImg('接受复活.jpg', {threshold:0.9}); d = d||point;
    if(point) {refreshUI('点击接受复活');sleep(3000);}

    point = common.clickImg('队友任务.jpg', {offset:{x:-1,y:-1},region:TeammateMissionRegion}); d = d||point;
    if(point) {refreshUI('点击队友任务');}
  
    point = common.clickImg('亡者战士.jpg', {region:SkillRegion}); d = d||point;
    if(point) {refreshUI('点击亡者战士');sleep(200);}
    
    point = common.clickImg('号令石魔-二段.jpg', {region:SkillRegion})||common.clickImg('号令石魔.jpg', {region:SkillRegion}); d = d||point;
    if(point) {refreshUI('点击号令石魔');sleep(200);}
    
    point = common.clickImg('亡者之甲.jpg', {region:SkillRegion}); d = d||point;
    if(point) {refreshUI('点击亡者之甲');sleep(200);}
    
    point = common.clickImg('药水.jpg', {region:SkillRegion}); d = d||point;
    if(point) {refreshUI('点击药水');sleep(200);}

    point = common.clickImg('物品拾取-手下.jpg', {region:FuncRegion})
        ||common.clickImg('物品拾取-手上.jpg', {region:FuncRegion})
        ||common.clickImg('物品拾取-箱.jpg', {region:FuncRegion}); d = d||point;
    if(point) {refreshUI('点击物品拾取');}
    
    point = common.clickImg('神威技-魂火.jpg', {region:FuncRegion}); d = d||point;
    if(point) {refreshUI('点击神威技');}
    
    point = common.clickImg('普攻-魂火.jpg', {region:SkillRegion,threshold:0.95})||common.clickImg('普攻-魂火神威.jpg', {region:SkillRegion, threshold:0.95}); d = d||point;
    if(point) {
        refreshUI('点击普攻');
        press(point.x, point.y, 2000);
    }

    point = common.clickImg('原地复活.jpg', {region:ReviveRegion,doClick:false}) || common.clickImg('原地复活-灰.jpg', {region:ReviveRegion,doClick:false});
    if(point){
        if(isFailRevive(point)){
            log('已无复活次数')
            return '无复活次数';
        }else{
            refreshUI('点击复活');
            d = d||point;
            click(point.x, point.y); sleep(3000);
        }
    }
  
    point = common.clickImg('答题.jpg', {threshold:0.8,region:QuestRegion}); d = d||point;
    if(point){
        log('出现答题')
        return '出现答题';
    }

    //if(!d){
    //    log('没有按钮被点击')
    //    return '未能识别任何按钮';
    //}
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

/**
 * 判断是否出现灰色复活
 * @param point 复活图片点击位置
 **/
function isFailRevive(point){
    var screen = common.captureScreenx();
    var num=0;
    for(var i=-40; i<40; i+=1){
        for(var j=-10; j<10; j+=1){
            var pix = images.pixel(screen, point.x+i, point.y+j);
            if(colors.red(pix)>100) num+=1;
        }
    }
    return num<800;
}