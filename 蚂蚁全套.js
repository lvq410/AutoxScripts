auto.waitFor();

//==================================================================================================常量配置
var MediaDir = engines.myEngine().cwd()+'/AntForest/'

var LogEnable = false;


var common = require('./common.js');

common.setCaptureScreenLandscape(false);
common.setMediaDir(MediaDir);
common.setLogEnable(LogEnable);

//==================================================================================================全局变量
var Run = false;

//==================================================================================================悬浮窗
var w = floaty.window(
    <vertical bg='#000000' alpha="0.4">
        <horizontal>
            <button id='mainBtn' w='40' h='40' text='全部' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-3' marginRight='-2' paddingLeft='-5' paddingRight='-5'/>
            <text id='text' bg='#ff0000' w='2000' h='30' color='#ffffff' gravity='left|center_vertical' layout_gravity='center_vertical'>未运行</text>
        </horizontal>
        <horizontal marginTop='-3'>
            <button id='forestBtn' w='40' h='40' text='森林' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-3' marginRight='-2' paddingLeft='-5' paddingRight='-5' />
            <button id='farmBtn' w='40' h='40' text='农场' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-2' marginRight='-2' paddingLeft='-5' paddingRight='-5' />
            <button id='manorBtn' w='40' h='40' text='庄园' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-2' marginRight='-2' paddingLeft='-5' paddingRight='-5' />
            <button id='taobaoFarmBtn' w='50' h='40' text='淘农场' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-2' marginRight='-2' paddingLeft='-5' paddingRight='-5' />
            <button id='adBtn' w='40' h='40' text='广告' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-2' marginRight='-2' paddingLeft='-5' paddingRight='-5' />
            <button id='manorPlayAdBtn' w='70' h='40' text='乐园广告' layout_gravity='center_vertical' marginTop='-3' marginBottom='-3' marginLeft='-2' marginRight='-2' paddingLeft='-5' paddingRight='-5' />
        </horizontal>
    </vertical>
);
w.setAdjustEnabled(true)
w.setSize(900, -2)
setTimeout(function(){
    w.setPosition(parseInt((device.width-w.getWidth())/2), 100)
}, 100);
w.exitOnClose()

setInterval(function(){}, 1000);

function doRun(run){
    Run = !Run;
    if(!Run){
        threads.shutDownAll()
        ui.run(() => {
            w.mainBtn.setEnabled(true); w.forestBtn.setEnabled(true); w.farmBtn.setEnabled(true); w.manorBtn.setEnabled(true); w.taobaoFarmBtn.setEnabled(true); w.adBtn.setEnabled(true); w.manorPlayAdBtn.setEnabled(true);
            w.text.setText('未运行');
            w.text.attr('bg', '#ff0000');
        });
        return;
    }
    threads.start(function() {
        ui.run(() => {
            w.mainBtn.setEnabled(false); w.forestBtn.setEnabled(false); w.farmBtn.setEnabled(false); w.manorBtn.setEnabled(false); w.taobaoFarmBtn.setEnabled(false); w.adBtn.setEnabled(false); w.manorPlayAdBtn.setEnabled(false);
            w.text.setText('运行中');
            w.text.attr('bg', '#00ff00');
        });
        try{
            var msg = run();
            Run = false;
            ui.run(() => {
                w.mainBtn.setEnabled(true); w.forestBtn.setEnabled(true); w.farmBtn.setEnabled(true); w.manorBtn.setEnabled(true); w.taobaoFarmBtn.setEnabled(true); w.adBtn.setEnabled(true); w.manorPlayAdBtn.setEnabled(true);
                w.text.setText(msg?('异常：'+msg):'执行结束');
                w.text.attr('bg', '#ff0000');
            });
            device.vibrate(2000);
        }catch(e){
            if(!Run) return;
            common.log('脚本异常', e, e.message);
            Run = false;
            ui.run(() => {
                w.mainBtn.setEnabled(true); w.forestBtn.setEnabled(true); w.farmBtn.setEnabled(true); w.manorBtn.setEnabled(true); w.taobaoFarmBtn.setEnabled(true); w.adBtn.setEnabled(true); w.manorPlayAdBtn.setEnabled(true);
                w.text.setText('脚本异常：'+e.message);
                w.text.attr('bg', '#ff0000');
            });
            device.vibrate(2000);
        }
    });
}

w.mainBtn.click(() => {doRun(main)});
w.forestBtn.click(() => {doRun(forest)});
w.farmBtn.click(() => {doRun(farm)});
w.manorBtn.click(() => {doRun(manor)});
w.taobaoFarmBtn.click(() => {doRun(taobaoFarm)});
w.adBtn.click(() => {doRun(browser_ad)});
w.manorPlayAdBtn.click(() => {doRun(manor_play_ad)});

//==================================================================================================主程序

function main(){
    sleep(1000)
    
    function tryTwice(func){
        try{
            func();
        }catch(e){
            ui.run(() => {
                w.text.setText('脚本异常：'+e.message);
            });
            common.log(e.message, e);
            func();
        }
    }
    
    tryTwice(forest);
    sleep(1000);
    
    tryTwice(farm);
    sleep(1000);
    
    tryTwice(manor);
    sleep(1000);
    
    tryTwice(taobaoFarm);
}

//==================================================================================================蚂蚁森林
function forest(){
    ui.run(() => { w.setPosition(parseInt((device.width-w.getWidth())/2), parseInt(device.height-w.getHeight()-100)) });
    
    ui.run(() => { w.text.setText('重启支付宝'); });
    common.reopenApp('com.eg.android.AlipayGphone');
    
    ui.run(() => { w.text.setText('等待并点击【蚂蚁森林】'); });
    var btn = text('蚂蚁森林').findOne(5000);
    if(!btn) throw new Error('未找到【蚂蚁森林】');
    common.clickIfParent(btn); sleep(3000)
    
    ui.run(() => { w.text.setText('等待【蚂蚁森林】打开'); });
    var btn;
    for(var i=0;i<10;i++){
        btn = textMatches(/^(去保护|去种植)$/).findOnce();
        if(btn) break;
        else closeDialog()
        sleep(1000);
    }
    if(btn) sleep(2000);
    else throw new Error('超时未打开【蚂蚁森林】');
    
    forest_fallenLeaves();
    
    ui.run(() => { w.text.setText('收个人能量'); });
    var btn = selector().idMatches('J_pop_treedialog_close').findOnce();
    if(btn) common.clickIfParent(btn);
    press((525/1080)*device.width, (900/2448)*device.height,1);
    
    var btn = selector().idMatches('J_pop_treedialog_close').findOne(3000);
    if(btn) {common.clickIfParent(btn); sleep(3000);}
    
    for(var y = (700/2448)*device.height; y< (870/2448)*device.height; y+=50){
        for(var x = (150/1080)*device.width; x < device.width - (150/1080)*device.width; x+= (50/1080)*device.width ) {
            press(x, y, 1);
        }
    }

    var msg = forest_findEnergy();
    if(msg) throw new Error(msg);
    
    var btn = text('天天能量雨还可收取').findOnce();
    if(btn){
        ui.run(() => { w.text.setText('点击【去收取】'); });
        common.clickIfParent(btn); sleep(2000)
        
        forest_rainEnergy(); sleep(2000)
    }
    
    var btn = text('再来一次').findOnce();
    if (btn) {
        ui.run(() => { w.text.setText('点击【再来一次】'); });
        common.clickIfParent(btn); sleep(2000)

        forest_rainEnergy(); sleep(2000)
    }
    
    var btn = text('送TA机会').findOnce();
    if (btn) {
        ui.run(() => { w.text.setText('点击【送TA机会】'); });
        common.clickIfParent(btn); sleep(2000)
        
        forest_rainEnergy(); sleep(2000)
    }
}

function forest_fallenLeaves(){
    common.log('检查并点击【奖励】'); ui.run(() => { w.text.setText('检查并点击【奖励】'); });
    var point = common.clickImg('森林-奖励.jpg')
    if(!point) {
        common.log('未找到【奖励】');
        return;
    }
    
    common.log('等待【活力值奖励】弹窗打开')
    var btn = textMatches(/.*活力值兑换.*/).findOne(5000);
    if (!btn) throw new Error('超时未打开【活力值奖励】弹窗');
    common.log('已打开【活力值奖励】弹窗'); sleep(2000);
    
    common.log('检查【领取】'); ui.run(() => { w.text.setText('检查并点击【领取】'); });
    var btn = text('领取').findOne(2000);
    if(!btn) {
        common.log('未找到【领取】');
    } else {
        common.log('找到并点击【领取】', btn.bounds());
        common.clickIfParent(btn);
        var btn  = text('知道了').findOne(3000); //有时会有7天宝箱提醒，关闭之
        if(btn){
            common.log('出现7日宝箱提醒，点击【知道了】关闭之');
            common.clickIfParent(btn);
        }
    }
    
    common.log('检查【收落叶】'); ui.run(() => { w.text.setText('检查并点击【收落叶】的【去转化】'); });
    var btn = textMatches(/.*收落叶转化农场肥料.*/).findOnce();
    if(btn) {
        common.log('找到【收落叶】，检查其【去转化】');
        var btn = btn.parent().findOne(text('去转化'));
        if(btn) {
            common.log('找到并点击【收落叶】的【去转化】', btn.bounds());
            common.clickIfParent(btn); sleep(4000);
            
            common.log('后退，返回【蚂蚁森林】'); ui.run(() => { w.text.setText('后退 返回森林'); });
            for(var i=0;i<3;i++){
                if(textMatches(/.*收落叶转化农场肥料.*/).findOnce()!=null){
                    common.log('找到【收落叶转化农场肥料】已返回森林');
                    break;
                }
                common.log('未找到【收落叶转化农场肥料】，执行后退键');
                back(); sleep(3000);
            }
            
            var btn = textMatches(/.*收落叶转化农场肥料.*/).findOnce();
            if(!btn){
                throw new Error('未回到蚂蚁森林');
            }
            
            common.log('检查【收落叶】的【立即领取】');
            var btn = btn.parent().findOne(text('立即领取'));
            if(btn){
                common.log('找到【收落叶】的【立即领取】，点击', btn.bounds());
                common.clickIfParent(btn); sleep(2000);
            } else {
                common.log('未找到【收落叶】的【立即领取】');
            }
            
        } else {
            common.log('未找到【收落叶】的【去转化】');
        }
    }else{
        common.log('未找到【收落叶】');
    }
    
    for(var i=0;i<3;i++){
        swipe(device.width / 2, device.height/2, device.width / 2, device.height/10, 1000);
        common.log('检查【连续收7天自己能量】'); ui.run(() => { w.text.setText('检查并点击【连续收7天自己能量】'); });
        var  btn = textMatches(/^连续.*7天.*自己能量.*/).findOnce();
        if(btn){
            common.log('找到【连续收7天自己能量】，检查其【立即领取】');
            var btn = btn.parent().findOne(text('立即领取'));
            if(btn){
                common.log('找到并点击【连续收7天自己能量】的【立即领取】', btn.bounds());
                common.clickIfParent(btn); sleep(2000);
                
            }else{
                common.log('未找到【连续收7天自己能量】的【立即领取】');
            }
        }
        
        common.log('检查【领取能量双击卡】'); ui.run(() => { w.text.setText('检查并点击【领取能量双击卡】'); });
        var  btn = text('领取能量双击卡').findOnce();
        if(btn){
            common.log('找到【领取能量双击卡】，检查其【立即领取】');
            var btn = btn.parent().parent().findOne(text('立即领取'));
            if(btn){
                common.log('找到并点击【领取能量双击卡】的【立即领取】', btn.bounds());
                common.clickIfParent(btn); sleep(2000);
                
            }else{
                common.log('未找到【领取能量双击卡】的【立即领取】');
            }
        }
    }
    
    common.log('检查【活力值奖励】弹窗的关闭按钮')
    var btn = text('关闭').findOnce();
    if(!btn){
        throw new Error('未找到【活力值奖励】弹窗的关闭按钮');
    } else {
        common.log('找到【活力值奖励】弹窗的关闭按钮，点击', btn.bounds());
        common.clickIfParent(btn);
        sleep(2000)
    }
}

function forest_findEnergy() {
    while(true){
        ui.run(() => { w.text.setText('识别并点击【找能量】'); });
        var point = common.clickImg(/^找能量[0-9]*.jpg/, {waitDisappearTimeout:3000});
        if(!point) return '未找到【找能量】';
        sleep(2000)
        
        //再次寻找【找能量】，如果找不到，说明已经收完
        point = common.clickImg(/^找能量[0-9]*.jpg/, {waitDisplayTimeout:3000, doClick:false});
        if(!point) return;
        
        ui.run(() => { w.text.setText('识别并点击【一键收】'); });
        common.clickImg(/^一键收[0-9]*.jpg$/, {waitDisappearTimeout:2000});
    }
}

function forest_rainEnergy(){
    var openBtnClicked = false;
    
    var img = images.read(MediaDir+'能量雨-绿色能量.jpg');
    
    while(true){
        if (!openBtnClicked) {
            var btn = text('立即开启').findOnce();
            if(btn){
                common.clickIfParent(btn);
                openBtnClicked = true;
            }
        }
        
        var btn = text('恭喜获得').findOnce();
        if(btn) {
            img.recycle();
            return;
        }
        
        if(waitWhileBotCheck()) continue; //出现人机验证后需要重新点【立即开启】，因此从头开始
        
        ui.run(() => { w.text.setText('识别绿色能量中'); });
        var screen = common.captureScreenx();
        var matchRst = images.matchTemplate(screen, img, {threshold: 0.8, max:30});
        if(matchRst.matches.length == 0) {
            ui.run(() => { w.text.setText('未找到绿色能量'); });
            sleep(200);
            continue;
        }
        ui.run(() => { w.text.setText('点击绿色能量'); });
        var distinct = {};
        matchRst.points.forEach(function(point) {
            var key = point.x + '_' + point.y;
            if(!distinct[key]) distinct[key] = point;
        });
        common.log('找到多少', Object.keys(distinct).length)
        for(var key in distinct) {
            var point = distinct[key];
            var clickPoint = {
                x: point.x + img.getWidth()/2,
                y: point.y + parseInt(img.getHeight()*1.5)
            }
            common.log('点击', clickPoint)
            press(clickPoint.x, clickPoint.y, 1);
            //common.debug_showPoint(clickPoint);
        }
    }
}

//==================================================================================================农场
function farm(){
    ui.run(() => { w.setPosition(parseInt((device.width-w.getWidth())/2), 20); });
    
    ui.run(() => { w.text.setText('重启支付宝'); });
    common.reopenApp('com.eg.android.AlipayGphone');
    
    ui.run(() => { w.text.setText('等待并点击【芭芭农场】'); });
    var btn = text('芭芭农场').findOne(5000);
    if(!btn) throw new Error('未找到【芭芭农场】');
    common.clickIfParent(btn);
    
    ui.run(() => { w.text.setText('等待【芭芭农场】打开'); });
    var btn = text('任务列表').findOne(5000);
    if(btn) sleep(2000)
    else throw new Error('超时未打开【芭芭农场】');
    closeDialog()
    
    common.log('检查【点击领取】'); ui.run(() => { w.text.setText('检查【点击领取】'); });
    common.clickImg('农场-点击领取.jpg'); sleep(3000);
    closeDialog()
    
    common.clickImg('农场-除草-收获.jpg');
    
    while(textMatches(/(还差.*次领肥料|立即领奖)/).findOnce()!=null){
        while(textMatches(/还差.*次领肥料/).findOnce()!=null){
            common.clickImg('农场-施肥.jpg'); sleep(4000);
            closeDialog();
            var btn = className('android.widget.Button').text('好的').findOnce();
            if(btn) common.clickIfParent(btn);
        }
        var btn = text('立即领奖').findOnce();
        if(btn){
            common.clickIfParent(btn); sleep(3000);
            common.clickImg('农场-施肥小奖-立即领取.jpg'); sleep(3000);
            var btn = textMatches(/.*点.*逛一逛再(得|赚).*肥料.*/).findOnce();
            if(btn){
                common.clickIfParent(btn); sleep(2000);
                browser_ad();
            }
        }
    }
    
    ui.run(() => { w.text.setText('点击【任务列表】'); });
    var btn = text('任务列表').findOne(5000);
    common.clickIfParent(btn);
    var btn = textMatches(/今天可领.*肥料/).findOne(5000);
    if(!btn) throw new Error('超时未打开【任务列表】');
    
    var btn = text('领取').findOnce();
    if(btn){
        ui.run(() => { w.text.setText('点击【领取】'); });
        common.clickIfParent(btn); sleep(1000);
        common.clickImg('农场-签到确认.jpg');
    }
    
    farm_browseProducts(); farm_browseProducts(); farm_browseProducts();
    
    farm_manorChickManure();
    
    for(var i = 0; i < 4; i++) {
        var did = false;
        do{
            farm_receive(); farm_catchChick();
            did = false;
            did |= farm_simple(/.*逛一逛支付宝会员.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛蚂蚁庄园.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*去森林种树挑战赛看一看.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*去积攒芝麻粒.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛乐动力频道.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛小荷包.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛领淘宝红包.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛蚂蚁保领保障福利.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*参与光伏治沙领现金.*/, /去完成|去逛逛/);
            //did |= farm_simple(/.*逛一逛农场乐园.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛信用卡积分页.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛一逛花呗活动.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*逛.*好货得肥料.*/, /去完成|去逛逛/, {browserAd:true});
            did |= farm_simple(/.*去领取你的商家奖励.*/, /去完成|去逛逛/);
            did |= farm_simple(/.*看10s视频领肥料.*/, /去完成|去逛逛/,{sleep:15000});
            
            did |= farm_intent(/.*逛一逛快手.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*逛一逛头条极速版.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*逛一逛今日头条极速版.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*逛逛淘宝芭芭农场.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*体验抖音极速版.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*去中国移动领福利.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*去百度地图领现金.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*逛一逛签到领现金.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*体验番茄小说.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*逛淘宝看视频领现金.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*逛逛美团APP.*/, /去完成|去逛逛/);
            did |= farm_intent(/.*去积攒芝麻粒.*/, /去完成|去逛逛/);
        }while(did)
        
        swipe(device.width / 2, device.height/2, device.width / 2, 0, 500);
    }
}

function farm_browseProducts(){
    var reg = /^.*(逛好物|看精选商品|逛优选好物|搜一搜你心仪的宝贝).*肥料[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]*$/;
    var btns = textMatches(reg).find();
    if(btns.empty()) return;
    
    btns.forEach((entryBtn)=>{
        common.log('当前入口', entryBtn.text())
        var i = parseInt(entryBtn.text().match(reg)[2]);
        var total = parseInt(entryBtn.text().match(reg)[3]);
        for (; i < total; i++) {
            var doBtn;
            textMatches(/去完成|去逛逛/).find().forEach(function(b) {
                if(b.bounds().top> entryBtn.bounds().top && b.bounds().top < entryBtn.bounds().bottom) doBtn = b;
            });
            if(!doBtn) return;
            
            ui.run(() => { w.text.setText('点击【逛好物/看精选商品/搜一搜你心仪】'); });
            common.clickIfParent(doBtn);
            
            browser_ad();
        }
    })
}

function farm_manorChickManure(){
    common.log('检查【蚂蚁庄园小鸡肥料】');
    ui.run(() => { w.text.setText('检查【蚂蚁庄园小鸡肥料】'); });
    var btn = textMatches(/.*蚂蚁庄园小鸡肥料.*/).findOnce();
    if(!btn) {
        common.log('未找到【蚂蚁庄园小鸡肥料】');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【蚂蚁庄园小鸡肥料】，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    
    var entryBtn = btn;
    common.log('检查【蚂蚁庄园小鸡肥料】的【领取】按钮');
    var btn = null;
    text('领取').find().forEach(function(b) {
        if (b.bounds().top > entryBtn.bounds().top && b.bounds().top < entryBtn.bounds().bottom) btn = b;
    });
    if (!btn) {
        common.log('未找到【蚂蚁庄园小鸡肥料】的【领取】按钮');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【蚂蚁庄园小鸡肥料】的【领取】按钮，坐标', btn.bounds(), '是否可见', visible);
    if (!visible) return;
    common.log('点击【蚂蚁庄园小鸡肥料】的【领取】');
    ui.run(() => { w.text.setText('点击【蚂蚁庄园小鸡肥料】的【领取】'); });
    common.clickIfParent(btn); sleep(1000)
}
var FarmSimpleCount = {};
function farm_simple(jobTitlePattern, jobEnterBtnPattern, options){
    if((FarmSimpleCount[jobTitlePattern]||0) > 2) return;
    options = options||{};
    
    common.log('检查【'+jobTitlePattern+'】'); ui.run(() => { w.text.setText('检查【'+jobTitlePattern+'】'); });
    var btn = textMatches(jobTitlePattern).findOnce();
    if(!btn) {
        common.log('未找到【'+jobTitlePattern+'】');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【'+jobTitlePattern+'】，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    
    var entryBtn = btn;
    common.log('检查【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】按钮');
    var btn = null;
    textMatches(jobEnterBtnPattern).find().forEach(function(b) {
        if(b.bounds().top> entryBtn.bounds().top && b.bounds().top < entryBtn.bounds().bottom) btn = b;
    });
    if(!btn){
        common.log('未找到【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】按钮');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】按钮，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    common.log('点击【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】');
    ui.run(() => { w.text.setText('点击【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】'); });
    common.clickIfParent(btn);
    
    if(options.browserAd){
        browser_ad()
    }else{
        sleep(options.sleep||5000)
    }
    
    common.log('开始后退 返回农场'); ui.run(() => { w.text.setText('后退 返回农场'); });
    for(var i=0;i<3;i++){
        if(textMatches(jobTitlePattern).findOnce()!=null){
            common.log('找到【'+jobTitlePattern+'】已返回农场');
            break;
        }
        common.log('未找到【'+jobTitlePattern+'】，执行后退键');
        back(); sleep(3000);
    }
    
    farm_receive();
    
    FarmSimpleCount[jobTitlePattern] = (FarmSimpleCount[jobTitlePattern]||0) + 1;
    return true;
}
var FarmIntentCount = {};
/**
 * 芭芭农场里简单的跳到另一个app后再回退就能完成的任务
 */
function farm_intent(jobTitlePattern, jobEnterBtnPattern){
    if((FarmIntentCount[jobTitlePattern]||0) > 2) return;
    common.log('检查【'+jobTitlePattern+'】'); ui.run(() => { w.text.setText('检查【'+jobTitlePattern+'】'); });
    var btn = textMatches(jobTitlePattern).findOnce();
    if(!btn) {
        common.log('未找到【'+jobTitlePattern+'】');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【'+jobTitlePattern+'】，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    
    var entryBtn = btn;
    common.log('检查【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】按钮');
    var btn = null;
    textMatches(jobEnterBtnPattern).find().forEach(function(b) {
        if(b.bounds().top> entryBtn.bounds().top && b.bounds().top < entryBtn.bounds().bottom) btn = b;
    });
    if(!btn){
        common.log('未找到【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】按钮');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】按钮，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    common.log('点击【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】'); ui.run(() => { w.text.setText('点击【'+jobTitlePattern+'】的【'+jobEnterBtnPattern+'】'); });
    common.clickIfParent(btn); sleep(10000)
    
    common.log('回到支付宝')
    launch('com.eg.android.AlipayGphone'); sleep(3000)
    
    common.log('开始后退 返回农场');
    ui.run(() => { w.text.setText('后退 返回农场'); });
    for(var i=0;i<2;i++){
        if(textMatches(jobTitlePattern).findOnce()!=null){
            common.log('找到【'+jobTitlePattern+'】已返回农场');
            break;
        }
        common.log('未找到【'+jobTitlePattern+'】，执行后退键');
        back(); sleep(3000);
    }
    
    farm_receive();
    FarmIntentCount[jobTitlePattern] = (FarmIntentCount[jobTitlePattern]||0) + 1;
    return true;
}
function farm_catchChick(){
    common.log('检查【一键捉小鸡赚肥料】'); ui.run(() => { w.text.setText('检查【一键捉小鸡赚肥料】'); });
    var btn = text('一键捉小鸡赚肥料').findOnce();
    if(!btn){
        common.log('未找到【一键捉小鸡赚肥料】');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【一键捉小鸡赚肥料】，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    
    
    var entryBtn = btn;
    common.log('检查【一键捉小鸡赚肥料】的【捉小鸡】'); ui.run(() => { w.text.setText('检查【一键捉小鸡赚肥料】的【捉小鸡】'); });
    var btn = null;
    text('捉小鸡').find().forEach(function(b) {
        if(b.bounds().top> entryBtn.bounds().top && b.bounds().top < entryBtn.bounds().bottom) btn = b;
    });
    if(!btn){
        common.log('未找到【一键捉小鸡赚肥料】的【捉小鸡】按钮');
        return;
    }
    var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
    common.log('找到【一键捉小鸡赚肥料】的【捉小鸡】按钮，坐标', btn.bounds(), '是否可见', visible);
    if(!visible) return;
    common.log('点击【一键捉小鸡赚肥料】的【捉小鸡】'); ui.run(() => { w.text.setText('点击【一键捉小鸡赚肥料】的【捉小鸡】'); });
    common.clickIfParent(btn);
    
    common.log('检查【立即捉鸡】'); ui.run(() => { w.text.setText('检查【立即捉鸡】'); });
    var btn = text('立即捉鸡赚500肥').findOne(3000);
    if(!btn){
        common.log('未找到【立即捉鸡】');
        return;
    }
    common.log('找到【立即捉鸡】，坐标', btn.bounds());
    common.clickIfParent(btn); sleep(2000)
}

function farm_receive(){
    common.log('检查是否有奖励可【领取】'); ui.run(() => { w.text.setText('检查是否有奖励可【领取】'); });
    var btn = textMatches(/领取/).findOnce();
    if (!btn) {
        common.log('未找到【领取】');
        return;
    }
    ui.run(() => { w.text.setText('找到并点击【领取】'); });
    common.clickIfParent(btn); sleep(1000);
}

//==================================================================================================庄园
function manor(){
    ui.run(() => { w.setPosition(parseInt((device.width-w.getWidth())/2), 20); });
    
    ui.run(() => { w.text.setText('重启支付宝'); });
    common.reopenApp('com.eg.android.AlipayGphone');
    
    ui.run(() => { w.text.setText('等待并点击【蚂蚁庄园】'); });
    var btn = text('蚂蚁庄园').findOne(5000);
    if(!btn) throw new Error('未找到【蚂蚁庄园】');
    common.clickIfParent(btn);
    
    ui.run(() => { w.text.setText('等待【蚂蚁庄园】打开'); });
    var point = common.clickImg('庄园-领饲料.jpg', {waitDisplayTimeout:10000,doClick:false});
    if(!point) throw new Error('超时未打开【蚂蚁庄园】');
    common.log('已找到【庄园-领饲料.jpg】，坐标', point);
    
    var feedBtnPoint = {x:device.width-((150/1080)*device.width), y:point.y};
    common.log('计算出喂养按钮坐标', feedBtnPoint)
    
    //manor_help();
    
    manor_home();
    
    var isFeedbagFull = false;
    for(var k=0; k<2; k++){
        common.log('点击【领饲料】'); ui.run(() => { w.text.setText('点击【领饲料】'); });
        var point = common.clickImg('庄园-领饲料.jpg', {waitDisappearTimeout:3000,loopClickWhileWaitDisappear:false});
        if(!point) throw new Error('超时未打开【领饲料】】');
        
        var btn = text('x180').findOne(5000);
        if(!btn) throw new Error('超时未打开【领饲料】');
        
        var upSwipeCount = 2;
        for(var i=0; i<upSwipeCount; i++){
            while(true){
                if(!isFeedbagFull){
                    var receiveRst = manor_receive();
                    if(receiveRst==1) continue;
                    if(receiveRst==-1) isFeedbagFull = true;
                }
                
                var screenOcrRsts = paddle.ocr(common.captureScreenx(), 4, false)
                    .filter(ocrRst=>ocrRst.bounds.top>w.getY()+w.getHeight()); //将top小于悬浮窗的ocr结果干掉，防止因为悬浮窗上的提示导致误认
                if(!screenOcrRsts.length) continue; //ocr不知道为啥，有时识别结果为空
                common.log('screenOcrRsts', screenOcrRsts);
                
                var taskRst = task_basic_ocr({title:'庄园小课堂',enterBtnText:'去答题',run:manor_answer,titleThreshold:0.8,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'庄园小视频',enterBtnText:'去完成',run:manor_video,titleThreshold:0.8,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去杂货铺逛一逛',enterBtnText:'去完成',run:browser_ad,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'雇佣小鸡拿饲料',enterBtnText:'去完成',run:manor_hire,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'小鸡厨房',enterBtnText:'去完成',run:manor_kitchen,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:/抽抽乐.*/,enterBtnText:'去完成',run:manor_lottery,screenOcrRsts:screenOcrRsts,maxCount:4});
                if(taskRst) continue;
                
                var taskRst = task_basic_ocr({title:'逛一逛我的芝麻',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:/逛一逛芝麻.*/,enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:/.*去生活号.*/,enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'逛一逛余额宝会场',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:/.*逛一逛.*助农专场.*/,enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'助力残疾人朋友们追梦',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'逛逛花呗花花卡',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去支付宝会员签到',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去逛一逛蚂蚁新村',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去森林种树挑战赛看一看',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去芭芭农场逛一逛',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:/.*浏览.*专场.*得.*饲料.*/,enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:/.*参与活动.*得.*饲料.*/,enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去芝麻集福卡逛一逛',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去神奇海洋逛一逛',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去支付宝运动逛一逛',enterBtnText:'去完成',run:manor_simple,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                
                var taskRst = task_basic_ocr({title:'去逛一逛淘宝视频',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去逛一逛淘宝芭芭农场',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去逛一逛淘金币小镇',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去闲鱼逛一逛',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去淘宝签到逛一逛',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去饿了么农场逛一逛',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去快手逛一逛',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'去今日头条极速版逛一逛',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts,maxCount:1});
                if(taskRst) continue;
                var taskRst = task_basic_ocr({title:'逛一逛UC浏览器',enterBtnText:'去完成',run:manor_intent,screenOcrRsts:screenOcrRsts});
                if(taskRst) continue;
                
                break;
            }
            
            if(i<upSwipeCount-1){
                //向上滑动半屏
                ui.run(() => { w.text.setText('向上滑动半屏'); });
                swipe(device.width / 2, device.height/2, device.width / 2, device.height/10, 1000);
                sleep(1000)
            }
        }
        
        ui.run(() => { w.text.setText('关闭【领饲料】'); });
        var btn = text('关闭饲料任务弹窗').findOne(5000);
        if(!btn) throw new Error('超时未找到【领饲料】的关闭按钮');
        common.clickIfParent(btn); sleep(2000)
    }
    
    for (var i = 0; i < 15; i++) {
        common.log('点击【喂养】'+(i+1)+'/10'); ui.run(() => { w.text.setText('点击【喂养】'+(i+1)+'/10'); });
        var btn = common.clickImg('庄园-喂养.jpg', {doClick:false,region:[device.width/2, device.height/2]});
        press(feedBtnPoint.x, feedBtnPoint.y, 1); sleep(2000)
        if(btn) {
            common.log('零食喂养完成，结束喂养'); ui.run(() => { w.text.setText('零食喂养完成，结束喂养'); });
            break;
        }
    }
    
    manor_diary();
    
    //manor_help();
}
function manor_home(){
    common.log('检查并点击【庄园-家庭】'); ui.run(() => { w.text.setText('检查并点击【庄园-家庭】'); });
    var btn = common.clickImg('庄园-家庭.jpg', {threshold:0.8});
    if(!btn){
        common.log('未找到【庄园-家庭】');
        return;
    }
    
    sleep(5000)
    closeDialog()
    closeDialog(true)
    
    common.log('检查并点击【庄园-家庭-签到】'); ui.run(() => { w.text.setText('检查并点击【庄园-家庭-签到】'); });
    var btn = common.clickImg('庄园-家庭-签到.jpg', {waitDisplayTimeout:3000, waitDisappearTimeout:3000, threshold:0.7});
    if(btn) sleep(3000);
    
    back(); sleep(3000);
    
    return btn!=null;
}
function manor_answer(){
    var btn = textMatches(/题目来源.*/).findOne(5000);
    if(!btn) throw new Error('超时未打开【去答题】');
    
    sleep(2000)
    ui.run(() => { w.text.setText('点击答案'); });
    btn.parent().find(className('android.widget.TextView')).forEach((t) => {
        press(t.bounds().centerX(), t.bounds().centerY(), 1)
    })
    sleep(2000)
    
    back(); sleep(2000)
}
function manor_hire(){
    var btn = textMatches(/^(雇佣|雇佣并通知)$/).findOne(5000);
    if(!btn) throw new Error('超时未打开雇佣小鸡的【去完成】');
    
    ui.run(() => { w.text.setText('点击【雇佣|雇佣并通知】'); });
    if(btn) common.clickIfParent(btn); sleep(1000);
    btn = textMatches(/^(雇佣|雇佣并通知)$/).findOne(5000);
    if(btn) common.clickIfParent(btn); sleep(1000);
    
    back(); sleep(2000)
}
function manor_video(){
    sleep(20000)
}
function manor_simple(){
    sleep(2000)
}
function manor_intent(){
    sleep(7000)
    common.log('回到支付宝')
    launch('com.eg.android.AlipayGphone'); sleep(3000)
}

function manor_kitchen(){
    ui.run(() => { w.text.setText('检查并点击【领取食材】'); });
    common.clickImg('庄园-厨房-领取食材.jpg', {waitDisplayTimeout:5000}); sleep(500)
    ui.run(() => { w.text.setText('检查并点击【领取今日食材】'); });
    common.clickImg('庄园-厨房-领取今日食材.jpg'); sleep(500)
    ui.run(() => { w.text.setText('检查并点击【爱心食材】'); });
    var point = common.clickImg('庄园-厨房-爱心食材.jpg');
    if (point) {
        ui.run(() => { w.text.setText('检查并点击【领10g食材】'); });
        var btn = text('领10g食材').findOne(5000);
        if (btn) {
            common.clickIfParent(btn); sleep(1000);
        }
        ui.run(() => { w.text.setText('后退 返回厨房'); });
        back(); sleep(2000);
    }
    
    ui.run(() => { w.text.setText('检查并点击【肥料】'); });
    common.clickImg('庄园-厨房-肥料.jpg'); sleep(1000)
    
    for(var i=0;i<3;i++){
        ui.run(() => { w.text.setText('检查并点击【做美食】'); });
        var point = common.clickImg('庄园-厨房-做美食.jpg');
        if(!point) break;
        var btn = text('关闭').findOne(5000);
        if(!btn) continue;
        var isExhausted = text('食材不够啦').findOnce()!=null;
        common.clickIfParent(btn); sleep(1000);
        if(isExhausted) break;
    }
    
    back(); sleep(2000);
}

function manor_lottery(){
    common.log('等待【抽抽乐】打开=检查【还剩.*次机会】');
    var btn = textMatches(/.*活动截止时间.*/).findOne(5000); sleep(1000)
    if(!btn) throw new Error('超时未打开【抽抽乐】');
    common.log('找到【抽抽乐】的【还剩.*次机会】，坐标', btn.bounds());
    
    common.log('检查【每日签到】');
    var btn = textMatches(/.*每日签到.*/).findOnce();
    if(btn){
        common.log('找到【每日签到】，坐标', btn.bounds());
        common.log('检查【每日签到】的【领取】')
        var btn = btn.parent().findOne(text('领取'));
        if (btn) {
            common.log('找到并点击【每日签到】的【领取】，坐标', btn.bounds());
            ui.run(() => { w.text.setText('点击【每日签到】的【领取】'); });
            common.clickIfParent(btn); sleep(2000);
        }else{
            common.log('未找到【每日签到】的【领取】');
        }
    }else{
        common.log('未找到【每日签到】');
    }
    
    common.log('检查【消耗饲料换机会】');
    var btn = textMatches(/消耗饲料换机会.*/).findOnce();
    if (btn) {
        common.log('找到【消耗饲料换机会】，坐标', btn.bounds(), '文案', btn.text());
        var consumeBtn = btn;
        for(var i=0;i<2;i++){
            common.log('检查【消耗饲料换机会】的【去完成】');
            var btn = consumeBtn.parent().findOne(text('去完成'));
            if(!btn) {
                common.log('未找到【消耗饲料换机会】的【去完成】');
                break;
            }
            common.log('找到并点击【消耗饲料换机会】的【去完成】，坐标', btn.bounds());
            ui.run(() => { w.text.setText('点击【消耗饲料换机会】的【去完成】'); });
            common.clickIfParent(btn);
            common.log('等待弹窗【确认兑换】');
            var btn = text('确认兑换').findOne(2000);
            if(!btn) {
                throw new Error('超时未弹窗【确认兑换】');
            }
            common.log('找到并点击弹窗【确认兑换】，坐标', btn.bounds());
            common.clickIfParent(btn); sleep(4000);
        }
    }else{
        common.log('未找到【消耗饲料换机会】');
    }
    
    common.log('检查【去杂货铺逛一逛】');
    var btn = textMatches(/去杂货铺逛一逛.*/).findOnce();
    if (btn) {
        common.log('找到【去杂货铺逛一逛】，坐标', btn.bounds(), '文案', btn.text());
        var groceryBtn = btn;
        function receive(){
            common.log('检查【去杂货铺逛一逛】的【领取】');
            var btn = groceryBtn.parent().findOne(text('领取'));
            if (btn) {
                common.log('找到并点击【去杂货铺逛一逛】的【领取】，坐标', btn.bounds());
                ui.run(() => { w.text.setText('点击【去杂货铺逛一逛】的【领取】'); });
                common.clickIfParent(btn); sleep(2000);
            } else {
                common.log('未找到【去杂货铺逛一逛】的【领取】');
            }
        }
        for(var i=0;i<3;i++){
            receive();
            
            common.log('检查【去杂货铺逛一逛】的【去完成】');
            var btn = groceryBtn.parent().findOne(text('去完成'));
            if(!btn) {
                common.log('未找到【去杂货铺逛一逛】的【去完成】');
                break;
            }
            common.log('找到并点击【去杂货铺逛一逛】的【去完成】，坐标', btn.bounds());
            ui.run(() => { w.text.setText('点击【去杂货铺逛一逛】的【去完成】'); });
            common.clickIfParent(btn);
            common.log('浏览广告');
            browser_ad();
            
            receive();
        }
    }else{
        common.log('未找到【去杂货铺逛一逛】');
    }
    
    common.log('回到抽抽乐页面，检查【还剩.*次机会】');
    ui.run(() => { w.text.setText('检查剩余抽奖次数'); });
    var btn = textMatches(/.*还剩.*次机会.*/).findOne(5000);
    if(btn){
        common.log('找到【还剩.*次机会】，坐标', btn.bounds(), '文案', btn.text());
        var total = parseInt(btn.text().match(/.*还剩(.*)次机会.*/)[1]);
        common.log('解析出剩余抽奖次数', total);
        var lotteryBtn = btn;
        for(var i = 0; i < total; i++) {
            common.log('点击【立即抽奖】');
            ui.run(() => { w.text.setText('点击【立即抽奖】'); });
            common.clickIfParent(lotteryBtn); sleep(1000);
            
            common.log('检查抽奖结果弹窗')
            var btn = textMatches(/知道啦|去装扮/).findOne(5000);
            if (btn) {
                sleep(1000); btn = textMatches(/知道啦|去装扮/).findOnce(); //等待弹窗完全初始化好，后再找一次，否则按钮坐标不对
                common.log('找到抽奖结果弹窗的【知道啦|去装扮】，坐标', btn.bounds(), '文案', btn.text());
                if (btn.text() == '知道啦') {
                    ui.run(() => { w.text.setText('点击抽奖后弹窗【知道啦】'); });
                    common.clickIfParent(btn); sleep(2000);
                }else{
                    common.log('找到抽奖结果弹窗的【去装扮】，检查关闭按钮');
                    var btn = btn.parent().findOne(clickable().text('').boundsInside(btn.bounds().left, btn.bounds().top, btn.bounds().right, device.height));
                    if (btn) {
                        common.log('找到并点击抽奖结果弹窗【去装扮】的关闭按钮，坐标', btn.bounds());
                        ui.run(() => { w.text.setText('点击抽奖后弹窗【去装扮】'); });
                        common.clickIfParent(btn); sleep(2000);
                    }else{
                        throw new Error('未找到抽奖结果弹窗的【去装扮】的关闭按钮');
                    }
                }
            }else{
                common.log('未找到抽奖结果弹窗的【知道啦】');
            }
        }
    }else{
        common.log('未找到【还剩.*次机会】');
    }
}

function manor_diary(){
    common.log('检查【小鸡日记】')
    ui.run(() => { w.text.setText('检查【小鸡日记】'); });
    var point = common.clickImg('庄园-小鸡日记.jpg', {waitDisplayTimeout:3000});
    if(!point){
        common.log('未找到【小鸡日记】');
        return;
    }
    common.log('找到并点击【小鸡日记】，坐标', point);
    
    common.log('检查【小鸡日记】的【贴贴小鸡】')
    ui.run(() => { w.text.setText('检查【小鸡日记】的【贴贴小鸡】'); });
    var point = common.clickImg('庄园-小鸡日记-贴贴小鸡.jpg', {waitDisplayTimeout:5000});
    if (!point) {
        common.log('未找到【小鸡日记】的【贴贴小鸡】');
        back(); sleep(2000);
        return;
    }
    common.log('找到并点击【小鸡日记】的【贴贴小鸡】，坐标', point);
    sleep(4000)
    
    common.log('开始返回庄园')
    ui.run(() => { w.text.setText('后退 返回庄园'); });
    for (var i = 0; i < 3; i++) {
        common.log('点击返回键')
        back(); sleep(3000);
        common.log('检查【领饲料】')
        var point = common.clickImg('庄园-领饲料.jpg', {waitDisplayTimeout:3000,doClick:false});
        if(point){
            common.log('找到【领饲料】，已回到庄园');
            return;
        }
        common.log('未找到【领饲料】，继续后退');
    }
    throw new Error('未回到庄园')
}
function manor_help(){
    var btn = common.clickImg('庄园-喂养.jpg', {doClick:false,region:[device.width/2, device.height/2]});
    if(!btn) return;
    var helpBtn = {x:btn.x, y:btn.y - (device.height-btn.y)};
    common.log('计算出帮助按钮坐标', helpBtn);
    var helpFeedBtn;
    for(var i=0;i<6;i++){
        common.log('点击【可能的帮助】' + (i + 1) + '/5'); ui.run(() => { w.text.setText('点击【可能的帮助】' + (i + 1) + '/5'); });
        press(helpBtn.x, helpBtn.y, 1); sleep(500)
        helpFeedBtn = common.clickImg('庄园-帮助-免费投喂.jpg', {doClick:false,region:[0, device.height/2]});
        if(helpFeedBtn) break;
    }
    if(!helpFeedBtn){
        common.log('未出现【免费投喂】，没有待帮助小鸡'); ui.run(() => { w.text.setText('未出现【免费投喂】，没有待帮助小鸡'); });
        return;
    }
    common.log('点击【免费投喂】'); ui.run(() => { w.text.setText('点击【免费投喂】'); });
    press(helpFeedBtn.x, helpFeedBtn.y, 1);
    common.log('检查弹窗【免费投喂】'); ui.run(() => { w.text.setText('检查弹窗【免费投喂】'); });
    var btn = text('免费投喂').findOne(5000);
    if(!btn) throw new Error('超时未出现弹窗【免费投喂】');
    common.log('点击弹窗【免费投喂】'); ui.run(() => { w.text.setText('点击【免费投喂】'); });
    common.clickIfParent(btn); sleep(5000);
}

/**
 * 领取饲料
 * @return <pre>
 * 0：未找到领取
 * 1：找到领取且成功领取饲料
 * -1：饲料袋已满无法领取
 * </pre>
 */
function manor_receive(){
    function food_full_dialog(){
        ui.run(() => { w.text.setText('检查饲料袋是否已满弹窗'); });
        var btn = text('饲料袋快满了').findOnce();
        if(btn){ common.log('饲料袋快满了')
            var btn = btn.parent().parent().parent().findOne(className('android.widget.Image'));
            if(btn){
                ui.run(() => { w.text.setText('关闭饲料袋快满弹窗'); });
                common.log('饲料袋快满了 关闭')
                common.clickIfParent(btn); sleep(1000);
                return -1;
            }
            throw new Error('未找到关闭饲料袋快满弹窗的按钮');
        }
        var btn = text('饲料袋已满').findOnce();
        if(btn){ common.log('饲料袋已满')
            var btn = text('知道了').findOnce();
            if (btn) {
                ui.run(() => { w.text.setText('关闭饲料袋已满弹窗'); });
                common.log('饲料袋已满 关闭')
                common.clickIfParent(btn); sleep(1000);
                return -1;
            }
            throw new Error('未找到关闭饲料袋已满弹窗的按钮');
        }
        return 1;
    }
    var ocrMode = true;
    if(ocrMode){
        common.log('检查【领取】'); ui.run(() => { w.text.setText('检查【领取】'); });
        var btn = common.clickOcr('领取', {doClick:true,threshold:0.8,textPreProcess:(str)=>str.replace(/[^\w\u4e00-\u9fa5]/g, '')});
        if(btn){
            sleep(2000)
            return food_full_dialog();
        }
        return 0;
    }else{
        ui.run(() => { w.text.setText('检查可领取饲料'); });
        var btn = textMatches(/x(180|120|90|30)g领取/).findOnce();
        if (btn) {
            ui.run(() => { w.text.setText('点击饲料领取'); });
            common.clickIfParent(btn); sleep(1000);
            return food_full_dialog();
        }
        return 0;
    }
}

//==================================================================================================淘宝农场
function taobaoFarm(){
    ui.run(() => { w.setPosition(parseInt((device.width-w.getWidth())/2), 20); });
    
    common.log('重启淘宝'); ui.run(() => { w.text.setText('重启淘宝'); });
    common.reopenApp('com.taobao.taobao');
    
    common.log('等待并点击【芭芭农场】'); ui.run(() => { w.text.setText('等待并点击【芭芭农场】'); });
    var btn = desc('芭芭农场').findOne(10000);
    if(!btn) throw new Error('未找到【芭芭农场】');
    common.log('找到并点击【芭芭农场】，坐标', btn.bounds());
    press(btn.bounds().centerX(), btn.bounds().centerY(), 1); sleep(2000)
    
    common.log('等待【芭芭农场】打开：检查【集肥料】'); ui.run(() => { w.text.setText('等待【芭芭农场】打开'); });
    for(var i = 0; i < 6; i++) {
        taobaoFarm_closePopup();
    }
    
//    while(true){
//        common.log('检查【剩余施肥次数】'); ui.run(() => { w.text.setText('检查【剩余施肥次数】'); });
//        var remainOcr = common.clickOcr(/.*(还差[0-9]+次可拆|可拆开).*/, {doClick:false,threshold:0.8});
//        if(!remainOcr) {
//            common.log('未找到【剩余施肥次数】');
//            break;
//        }
//        common.log('找到【剩余施肥次数】，坐标', remainOcr);
//        
//        if(/.*可拆开.*/.test(remainOcr.text)){
//            common.log('点击【可拆开】'); ui.run(() => { w.text.setText('点击【可拆开】'); });
//            press(remainOcr.x, remainOcr.y, 1); sleep(3000)
//            taobaoFarm_closePopup();
//            continue;
//        }
//        
//        var num = parseInt(remainOcr.text.match(/还差([0-9]+)次可拆/)[1]);
//        common.log('提取到还差', num, '次可拆');
//        
//        var fertilizeOcr;
//        for(var i=0; i<num; i++){
//            if(!fertilizeOcr){
//                common.log('检查【施肥】'); ui.run(() => { w.text.setText('检查【施肥】'); });
//                var fertilizeOcr = common.clickOcr(/^施肥$/);
//                if(!fertilizeOcr) throw new Error('未找到【施肥】');
//                common.log('找到【施肥】，坐标', fertilizeOcr);
//            }
//            press(fertilizeOcr.x, fertilizeOcr.y, 1);sleep(3000);
//            taobaoFarm_closePopup();
//        }
//    }
    
//    common.log('检查【去打卡】'); ui.run(() => { w.text.setText('检查【去打卡】'); });
//    var btn = text('去打卡').findOnce();
//    if(btn) {
//        common.log('找到【去打卡】，坐标', btn.bounds());
//        press(btn.bounds().centerX(), btn.bounds().centerY(), 1); sleep(2000)
//        common.log('检查【点击打卡】'); ui.run(() => { w.text.setText('检查【点击打卡】'); });
//        var punchOcr = common.clickOcr(/^点击打卡$/);
//        if(!punchOcr) throw new Error('未找到【点击打卡】');
//        common.log('找到【点击打卡】，坐标', punchOcr);
//        
//        common.log('检查打卡的【关闭】'); ui.run(() => { w.text.setText('检查打卡的【关闭】'); });
//        var btn = className('android.widget.Button').clickable().boundsInside(900,200,1100,400).findOne(2000);
//        
//    }else{
//        common.log('未找到【去打卡】');
//    }
    
    common.log('检查【集肥料】'); ui.run(() => { w.text.setText('检查【集肥料】'); });
    var taskBtn = text('集肥料').findOne(5000);
    if(!taskBtn) throw new Error('超时未打开【芭芭农场】');
    common.log('找到【集肥料】，坐标', taskBtn.bounds());
    
    common.log('点击【集肥料】'); ui.run(() => { w.text.setText('点击【集肥料】'); });
    press(taskBtn.bounds().centerX(), taskBtn.bounds().centerY(), 1);
    common.log('检查【集肥料任务列表弹窗】是否已打开'); ui.run(() => { w.text.setText('检查【集肥料任务列表弹窗】是否已打开'); });
    var btn = text('肥料明细').findOne(3000);
    if(!btn) throw new Error('超时未打开【集肥料任务列表弹窗】');
    
    common.log('检查【去签到】'); ui.run(() => { w.text.setText('检查【去签到】'); });
    var btn = text('去签到').findOne(2000);
    if(btn){
        common.log('找到【去签到】，坐标', btn.bounds()); ui.run(() => { w.text.setText('点击【去签到】'); });
        common.clickIfParent(btn); sleep(1000);
    }
    
    while(taobaoFarm_browser()){};
    
    var answered = taobaoFarm_answer();
    if(answered){ //答题完会关闭集肥料任务列表，需要重新打开
        common.log('点击【集肥料】'); ui.run(() => { w.text.setText('点击【集肥料】'); });
        press(taskBtn.bounds().centerX(), taskBtn.bounds().centerY(), 1); sleep(2000)
    }

    while(taobaoFarm_browser()){};
    
    taobaoFarm_intend(/.*支付宝芭芭农.*/, /去完成/);
//    for(var i=0; i<2; i++){
//        //向上滑动半屏
//        swipe(device.width / 2, device.height/2, device.width / 2, 0, 1000);
//    }
}

function taobaoFarm_closePopup(){
    while(true){
        common.log('检查农场弹窗关闭按钮'); ui.run(() => { w.text.setText('检查农场弹窗关闭按钮'); });
        var point = common.clickImg('淘宝-农场-弹窗-关闭.jpg', {waitDisplayTimeout:500, imgThreshold:220, region:[0,device.height/2]});
        if(!point){
            common.log('未找到农场弹窗关闭按钮');
            break;
        }
        common.log('找到并点击农场弹窗关闭按钮，坐标', point); ui.run(() => { w.text.setText('找到并点击农场弹窗关闭按钮'); });
        sleep(3000)
    }
}

function taobaoFarm_answer(){
    common.log('检查【农场百科问答】'); ui.run(() => { w.text.setText('检查【农场百科问答】'); });
    var btn = common.clickOcr(/.*农场百科问.*/, {doClick:false,threshold:0.8,offset:{x:0,y:0}});
    if(!btn){
        common.log('未找到【农场百科问答】');
        return;
    }
    common.log('找到【农场百科问答】，坐标', btn);
    
    common.log('检查【农场百科问答】的【去答题】'); ui.run(() => { w.text.setText('检查【农场百科问答】的【去答题】'); });
    var btn = common.clickOcr(/.*去答题.*/, {doClick:true,threshold:0.8,region:[btn.x,btn.y,device.width,200]});
    if (!btn) {
        common.log('未找到【去答题】');
        return;
    }
    common.log('找到【去答题】，坐标', btn);
    
    common.log('点击【去答题】'); ui.run(() => { w.text.setText('点击【去答题】'); });
    press(btn.x, btn.y, 1); sleep(2000)
    
    common.log('检查答案按钮'); ui.run(() => { w.text.setText('检查答案按钮'); });
    var btn = clickable().className('android.widget.Button').depth(19).textMatches(/.+/).boundsInside(0,device.height/2,device.width,device.height).findOne(2000);
    if(!btn) throw new Error('超时未找到答案按钮');
    common.log('找到答案按钮，答案', btn.text(), '坐标', btn.bounds());
    
    common.log('点击答案按钮'); ui.run(() => { w.text.setText('点击答案按钮'); });
    common.clickIfParent(btn); sleep(2000);
    
    var btn = textMatches(/领取(奖励|鼓励).*/).findOne(2000);
    if (!btn) throw new Error('超时未找到【领取奖励】');
    common.log('找到【领取奖励】，坐标', btn.bounds());
    common.clickIfParent(btn); sleep(2000);
    return true;
}

function taobaoFarm_browser(){
    var pattern = /.*(严选推荐商|一搜你喜欢的商|精选好|一搜你心仪的宝|浏览最高.*00|浏览15秒|浏览15s).*/
    common.log('检查'+pattern); ui.run(() => { w.text.setText('检查'+pattern); });
    //var btn = common.clickOcr(pattern, {doClick:false,threshold:0.8,offset:{x:0,y:0}});
    var btn = textMatches(pattern).findOnce();
    if(!btn){
        common.log('未找到'+pattern);
        return;
    }
    common.log('找到', btn.text(), '，坐标', btn);
    
    var btnPattern = /.*(去完成|去浏览).*/
    common.log('检查'+pattern+'的'+btnPattern); ui.run(() => { w.text.setText('检查'+btnPattern); });
    var region = [btn.bounds().left,btn.bounds().top,device.width,200];
    if(btn.text().match(/.*(浏览最高.*00|浏览15秒|浏览15s).*/)) region[1] = btn.bounds().top-100;
    var btn = textMatches(btnPattern).boundsInside(region[0],region[1],region[0]+region[2],region[1]+region[3]).findOnce();
    if (!btn) {
        common.log('未找到'+btnPattern);
        return;
    }
    common.log('找到'+btnPattern+'，坐标', btn);
    
    common.log('点击'+btnPattern); ui.run(() => { w.text.setText('点击'+btnPattern); });
    //press(btn.x, btn.y, 1); sleep(2000)
    common.clickIfParent(btn); sleep(2000);
    
    browser_ad();
    
    for(var i=0;i<3;i++){
        closeDialog(true);
        common.log('检查是否回到【集肥料任务列表弹窗】'); ui.run(() => { w.text.setText('检查是否回到【集肥料任务列表弹窗】'); });
        var btn = text('肥料明细').findOne(3000);
        if(btn) break;
        common.log('未回到【集肥料任务列表弹窗】继续后退'); ui.run(() => { w.text.setText('未回到【集肥料任务列表弹窗】继续后退'); });
        back(); sleep(2000);
    }
    
    return true;
}

function taobaoFarm_intend(pattern, btnPattern){
    common.log('检查'+pattern); ui.run(() => { w.text.setText('检查'+pattern); });
    var btn = common.clickOcr(pattern, {doClick:false,threshold:0.8,offset:{x:0,y:0}});
    if(!btn){
        common.log('未找到'+pattern);
        return;
    }
    common.log('找到', pattern, '，坐标', btn);
    
    common.log('检查'+pattern+'的'+btnPattern); ui.run(() => { w.text.setText('检查'+btnPattern); });
    var btn = common.clickOcr(btnPattern, {doClick:true,threshold:0.8,region:[btn.x,btn.y,device.width,200]});
    if (!btn) {
        common.log('未找到'+btnPattern);
        return;
    }
    common.log('找到'+btnPattern+'，坐标', btn);
    
    common.log('点击'+btnPattern); ui.run(() => { w.text.setText('点击'+btnPattern); });
    press(btn.x, btn.y, 1);sleep(10000);
        
    common.log('回到淘宝')
    launch('com.taobao.taobao'); sleep(7000)
    
    return true;
}

//==================================================================================================公共函数
var TaskCount = {};
/**
 * 横条形任务相关（基于native实现），可用于：
 * 1.检查横条形任务是否存在（无论是否已做完）
 * 2.进入横条形任务
 */
function task_native(opts){
    
}
/**
 * 横条形任务相关（基于ocr实现），可用于：
 * 1.检查横条形任务是否存在（无论是否已做完）
 * 2.进入横条形任务
 * @param {Object} opts
 * <pre>{
 *   title: 标题
 *   maxCount: 最大进入次数，默认2
 *   titleThreshold：标题相似度阈值，默认0.6
 *   isSubTitle: title参数是否是横条任务的子标题，默认false
 *   enterBtnText: 进入任务的按钮的文案，默认：['去完成','逛一逛','去逛逛']
 *   enterBtnTextThreshold: 类似titleThreshold，默认0.6
 *   screenOcrRsts: 复用的屏幕ocr结果缓存，为null时重新截图识别
 *   run: 进入任务后执行的逻辑，null为不执行任何逻辑；进入任务前会sleep 3秒，若调起任务需要的sleep时间不够，在run中补齐
 * }</pre>
 * @return null:未找到标题或找到标题但未找到进入任务按钮;true:找到标题且成功点击进入任务按钮
 */
function task_basic_ocr(opts){
    var title = opts.title;
    opts.titleThreshold = opts.titleThreshold || 0.6;
    opts.enterBtnTextThreshold = opts.enterBtnTextThreshold || 0.6;
    var maxCount = opts.maxCount || 2;
    
    if((TaskCount[title]||0) >= maxCount) return;
    
    common.log('检查【'+title+'】'); ui.run(() => { w.text.setText('检查【'+title+'】'); });
    var titleBtn = common.clickOcr(title, {doClick:false,screenOcrRsts:opts.screenOcrRsts,threshold:opts.titleThreshold,textPreProcess:(str)=>str.replace(/[^\w\u4e00-\u9fa5]/g, '')});
    if(!titleBtn) return;
    
    common.log('找到【'+title+'】', titleBtn, '检查进入按钮');
    var enterBtnText = opts.enterBtnText || ['去完成','逛一逛','去逛逛'];
    if(typeof enterBtnText == 'string') enterBtnText = [enterBtnText];
    
    var EnterBtnFindRegion = [titleBtn.bounds.right, titleBtn.bounds.top, device.width-titleBtn.bounds.right, titleBtn.bounds.height*4];
    if(opts.isSubTitle){
        EnterBtnFindRegion[1] = titleBtn.bounds.top-titleBtn.bounds.height;
    }
    var enterBtnFindRegionScreenOcrRsts;
    if(opts.screenOcrRsts){
        enterBtnFindRegionScreenOcrRsts = [];
        opts.screenOcrRsts.forEach(function(ocrRst){
            if(ocrRst.bounds.left<EnterBtnFindRegion[0]) return;
            if(ocrRst.bounds.top<EnterBtnFindRegion[1]) return;
            if(ocrRst.bounds.right>device.width) return;
            if(ocrRst.bounds.bottom>EnterBtnFindRegion[1]+EnterBtnFindRegion[3]) return;
            enterBtnFindRegionScreenOcrRsts.push(ocrRst);
        });
    }
    var enterBtn = common.clickOcr(enterBtnText, {doClick:false,screenOcrRsts:enterBtnFindRegionScreenOcrRsts,threshold:opts.enterBtnTextThreshold,textPreProcess:(str)=>str.replace(/[^\w\u4e00-\u9fa5]/g, '')});
    if(!enterBtn) return;
    common.log('找到并点击【'+title+'】的进入', enterBtn);
    //任务结束返回时，用标题对应的图片来判断是否已返回。因为有些任务的中间页也有与标题文字高度相关的文字，所以不能只用标题文字来判断
    var titleImg = images.clip(common.captureScreenx(), titleBtn.bounds.left, titleBtn.bounds.top, titleBtn.bounds.width, titleBtn.bounds.height);
    press(enterBtn.x, enterBtn.y, 1); sleep(3000);
    
    if(opts.run) opts.run();
    
    common.log('开始返回'); ui.run(() => { w.text.setText('后退 开始返回'); });
    opts.screenOcrRsts = null;
    for(var i=0;i<3;i++){
        if(images.findImage(common.captureScreenx(), titleImg, { threshold: 0.9 })){
            common.log('找到【'+title+'】已返回');
            break;
        }
        common.log('点击返回键');
        back(); sleep(3000);
        if(i==2) throw new Error('未能返回到【'+title+'】');
    }
    
    TaskCount[title] = (TaskCount[title]||0) + 1;
    
    return true;
}

/**
 * 浏览15s/30s广告，浏览完成后返回
 */
function browser_ad(){
    common.log('检查是否已打开广告页');
    var btn = textMatches(/.*(得肥料|一起逛街咯|浏览或查看商品|搜索有福利|猜你想搜|滑动浏览得|拖动下方滑块|浏览得奖励|浏览15秒).*/).findOne(5000);
    if(!btn) throw new Error('超时未打开广告页');
    common.log('已打开广告页');
    var markText = btn.text();
    
    var guessSearchFlag = false;
    function guessSearchJump(){
        common.log('当前是【搜索有福利】页，检查【猜你想搜】'); ui.run(() => { w.text.setText('当前是【搜索有福利】页，检查【猜你想搜】'); });
        var btn = textMatches(/.*猜你想搜|历史搜索.*/).findOnce();
        if (btn) {
            common.log('找到【猜你想搜】，坐标', btn.bounds()); sleep(2000);
            var firstSearchItem = btn.parent().findOne(className('android.widget.ListView')).findOne(className('android.widget.TextView'));
            if (firstSearchItem) {
                common.log('找到【猜你想搜】的第一个搜索项，坐标', firstSearchItem.bounds(), '文案', firstSearchItem.text());
                common.clickIfParent(firstSearchItem); sleep(2000);
                guessSearchFlag = true;
            }else{
                common.log('未找到【猜你想搜】的第一个搜索项');
            }
        }else{
            common.log('未找到【猜你想搜】');
        }
    }
    if('搜索有福利'==markText || '猜你想搜'==markText) guessSearchJump();
    
    common.log('检查是否有【去浏览】 按钮'); ui.run(() => { w.text.setText('检查是否有【去浏览】 按钮'); });
    var btn = text('去浏览').findOne(2000); //有时会有额外奖励，需要看30s广告
    if(btn){
        common.log('有并点击【去浏览】 按钮，坐标', btn.bounds()); ui.run(() => { w.text.setText('点击【去浏览】 按钮'); });
        common.clickIfParent(btn); sleep(2000)
    } else {
        common.log('未找到【去浏览】 按钮');
    }
    
    var hasFertilizer = false;
    var count = btn?45000:30000;
    common.log('开始浏览广告，时长', count, 's'); ui.run(() => { w.text.setText('开始浏览广告，时长'+(count/1000)+'s'); });
    for(var i=0; i<count;){
        waitWhileBotCheck();
        
        if(!guessSearchFlag){
            common.log('检查是否有【搜索有福利|猜你想搜】标志 ');
            var btn = textMatches(/.*(搜索有福利|猜你想搜).*/).findOnce();
            if(btn) guessSearchJump();
        }
        
        common.log('检查是否有【完成】标志 ');
        var btn = textMatches(/.*(任务完成|当前页下单|浏览完成|已完成|已发放).*/).findOnce();
        if(btn){
            common.log('找到【完成】标志：', btn.text()); ui.run(() => { w.text.setText('找到【完成】标志：'+btn.text()); });
            var btn = textMatches(/.*(得肥料\(1\/2\)|浏览15秒).*/).findOnce();
            if (btn) {
                common.log('有【完成】标志，但仍有【得肥料(1/2)|浏览15秒】', btn.bounds());
            }else{
                common.log('结束广告浏览'); ui.run(() => { w.text.setText('结束广告浏览'); });
                break;
            }
        }
        
        //农场广告有肥料奖励道具
        common.log('检查是否有【可得肥料+100】 按钮');
        var btns = text('可得肥料+100').find();
        if(btns.nonEmpty()) {
            btns.forEach((btn)=>{
                var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
                common.log('找到【可得肥料+100】 按钮，坐标', btn.bounds(), '是否可见', visible);
                if(!visible) return;
                common.log('点击【可得肥料+100】 按钮'); ui.run(() => { w.text.setText('点击【可得肥料+100】 按钮'); });
                //这玩意儿的控件无法点击，只能用坐标点击方式
                press(btn.bounds().centerX(), btn.bounds().centerY(), 1); sleep(500);
                hasFertilizer = true;
                count = 45000; //有肥料奖励时，拉长看广告时间以尽量收集齐
            })
        } else {
            common.log('没有【可得肥料+100】 按钮');
        }
        
        common.log('滑动窗口'); ui.run(() => { w.text.setText('浏览广告，滑动窗口'+(i/1000)+'/'+(count/1000)); });
        if(hasFertilizer) { //有肥料奖励时，向上滑动半屏
            swipe(device.width / 2, device.height/2, device.width / 2, 0, 500);
            i+=500;
        }else{ //默认滑动是小范围上下摆动
            swipe(device.width / 2, device.height/2, device.width / 2, device.height/2-100, 500);
            sleep(500);
            swipe(device.width / 2, device.height/2, device.width / 2, device.height/2+100, 500);
            sleep(500);
            i+=2000;
        }
    }
    
    common.log('广告浏览完成，执行返回键'); ui.run(() => { w.text.setText('广告浏览完成，执行返回键'); });
    back(); sleep(2000)
    if(guessSearchFlag){
        common.log('是【搜索有福利】模式，需再执行一次返回')
        common.log('检查【搜索有福利】'); ui.run(() => { w.text.setText('检查【搜索有福利】'); });
        var btn = textMatches(/.*搜索有福利.*/).findOne(3000);
        if (btn) {
            common.log('找到【搜索有福利】再执行一次返回', btn.bounds()); ui.run(() => { w.text.setText('找到【搜索有福利】再执行一次返回'); });
            back(); sleep(2000)
        }
    }
}

/**
 * 出现人机验证时，震动提醒并等待
 * @returns true:出现且完成了人机验证；false：未出现人机验证
 */
function waitWhileBotCheck(){
    var btn = textMatches(/.*(拖动下方滑块).*/).findOnce();
    if(btn){
        common.log('当前是人机验证页'); ui.run(() => { w.text.setText('当前是人机验证页，请进行人机验证'); });
        while(btn!=null){
            device.vibrate(2000);
            sleep(2000);
            btn = textMatches(/.*(拖动下方滑块).*/).findOnce();
        }
        common.log('人机验证完成'); ui.run(() => { w.text.setText('人机验证完成'); });
        sleep(2000);
        return true;
    }
    var btn = textMatches(/.*(请进行验证).*/).findOnce();
    if(btn){
        common.log('当前是人机验证页'); ui.run(() => { w.text.setText('当前是人机验证页，请进行人机验证'); });
        while(btn!=null){
            device.vibrate(2000);
            sleep(2000);
            btn = textMatches(/.*(请进行验证).*/).findOnce();
        }
        common.log('人机验证完成'); ui.run(() => { w.text.setText('人机验证完成'); });
        sleep(2000);
        return true;
    }
}

function anti_antiBot(){
    common.log('检查当前是否是人机验证页')
    var btn = textMatches(/.*(拖动下方滑块).*/).findOnce();
    if (btn) {
        common.log('当前是人机验证页');
        
        var btn = textMatches(/.*(向右滑动验证).*/).findOnce();
        if(btn) {
            common.log('找到【向右滑动验证】，坐标', btn.bounds());
            var swipeFromX = btn.bounds().left + 50;
            var swipeFromY = btn.bounds().centerY();
            //common.debug_showPoint({x:swipeFromX, y:swipeFromY});
            var swipeToX = btn.bounds().right - 50;
            var swipeToY = btn.bounds().centerY();
            //common.debug_showPoint({x:swipeToX, y:swipeToY});
            var gesturesParams = [];
            gesturesParams.push(0);
            gesturesParams.push(100);
            gesturesParams.push([swipeFromX, swipeFromY]);
            common.debug_showPoint({x:swipeFromX, y:swipeFromY});
            
            var x = swipeFromX;
            while(x < swipeToX) {
                x = x + common.randomNumber(50, 200);
                if(x > swipeToX) x = swipeToX;
                var y = swipeFromY+common.randomNumber(-20, 20);
                gesturesParams.push([x, y]);
                common.debug_showPoint({x:x, y:y});
            }
            gestures(gesturesParams);
        }
    }
}

function closeDialog(options){
    options = options||{};
    var selectParams = textMatches(/^(关闭|关闭按钮)$/).boundsInside(0,device.height*1/5,device.width*2,device.height*2);
    
    var btn;
    if(options.dialog){
        btn = className('android.app.Dialog').find().findOne(selectParams);
    }else{
        btn = selectParams.findOnce();
    }
    if(btn){
        var visible = common.isPointVisible({x:btn.bounds().centerX(), y:btn.bounds().centerY()});
        if(visible){
            common.clickIfParent(btn); sleep(2000);
            return true;
        }
    }
    return false;
}

//==================================================================================================小鸡乐园
function manor_play_ad(){
    ui.run(() => { w.setPosition(parseInt((device.width-w.getWidth())/2), 330) });
    sleep(1000)
    
    function findAdBtn(){
        var btn = common.clickImg(['庄园-乐园-广告-钻石商城-大钻石.jpg','庄园-乐园-广告-钻石商城-体力块.jpg','庄园-乐园-广告-钻石商城-体力箱.jpg'
            ,'庄园-乐园-广告-在线奖励-小加速.jpg','庄园-乐园-广告-在线奖励-大加速.jpg','庄园-乐园-广告-在线奖励-小礼盒.jpg','庄园-乐园-广告-在线奖励-三选骰.jpg'], {threshold:0.9,offset:{y:-1}})
            ||
            common.clickImg(['庄园-乐园-广告-钻石商城.jpg','庄园-乐园-广告-轮盘抽奖.jpg','庄园-乐园-广告-体力商店.jpg','庄园-乐园-广告-双份物品.jpg'
            ,'庄园-乐园-广告-在线奖励.jpg'], {threshold:0.9});
        if(!btn) return;
        common.log('找到【广告】，坐标', btn); ui.run(() => { w.text.setText('找到【广告】'); });
        sleep(2000)
        return {
            btn: btn,
            isDraw: btn.imgName=='庄园-乐园-广告-轮盘抽奖.jpg',
            isStamina: btn.imgName=='庄园-乐园-广告-体力商店.jpg'
        }
    }
    
    function findAdBtn_waiter(){
        common.log('查找【广告-等待】'); ui.run(() => { w.text.setText('查找【广告-等待】'); });
        var btn = common.clickImg(['庄园-乐园-广告-轮盘抽奖-等待.jpg','庄园-乐园-广告-体力商店-等待.jpg'], {threshold:0.9, doClick:false});
        if(btn){
            common.log('找到【广告-等待】，坐标', btn); ui.run(() => { w.text.setText('找到【广告-等待】'); });
            return btn;
        }
    }
    
    function clickConfirm(){
        common.log('查找【确认】'); ui.run(() => { w.text.setText('查找【确认】'); });
        var btn = common.clickImg('庄园-乐园-广告-确认.jpg', {threshold:0.9,waitDisplayTimeout:2000});
        if(btn){
            common.log('找到【确认】，坐标', btn); ui.run(() => { w.text.setText('找到【确认】'); });
            press(btn.x, btn.y, 1); sleep(1000);
        }
    }
    
    function browserAd(){
        function clickClose(){
            swipe(device.width / 2, device.height/10, device.width / 2, 0, 500); //关闭前老遇到通知，上划一下干掉它
            
            common.log('查找【关闭】'); ui.run(() => { w.text.setText('查找【关闭】'); });
            var btn = textMatches('关闭').boundsInside(device.width*2/3,0,device.width,device.height/3).findOnce();
            if(btn){
                common.log('找到【关闭】', btn); ui.run(() => { w.text.setText('找到并点击【关闭】'); });
                common.clickIfParent(btn);sleep(2000);
                return btn;
            }
            btn = common.clickOcr('关闭', {doClick:false,threshold:0.8, region:[device.width*2/3,0,device.width/3,device.height/3]});
            if (btn) {
                common.log('找到【关闭】', btn); ui.run(() => { w.text.setText('找到并点击【关闭】'); });
                press(btn.x, btn.y, 1); sleep(2000);
                return btn;
            }
        }
        
        common.log('查找【浏览广告】'); ui.run(() => { w.text.setText('查找【浏览广告】'); });
        var adPattern = /.*(浏览广告.*秒后可领奖励|.*秒.*可领奖励).*/;
        var btn = common.clickOcr(adPattern, {doClick:false,threshold:0.8,waitDisplayTimeout:3000,gap:1000,region:[0,0,device.width,device.height/10]});
        if(!btn){
            common.log('未找到【浏览广告】'); ui.run(() => { w.text.setText('未找到【浏览广告】'); });
            common.log('检查是否是分享给好友'); ui.run(() => { w.text.setText('检查是否是分享给好友'); });
            var btn = text('支付宝好友').findOnce();
            if(btn){
                common.clickIfParent(btn); sleep(1000)
                common.log('查找【8066】'); ui.run(() => { w.text.setText('查找【8066】'); });
                var btn = text('8066').findOne(2000); //指定好友分享
                if(!btn){
                    common.log('未找到【8066】'); ui.run(() => { w.text.setText('未找到【8066】'); });
                    throw new Error('未找到好友【8066】');
                }
                common.log('找到【8066】，坐标', btn); ui.run(() => { w.text.setText('找到【8066】'); });
                common.clickIfParent(btn); sleep(1000)
                common.log('查找【发送】'); ui.run(() => { w.text.setText('查找【发送】'); });
                var btn = text('发送').findOne(2000);
                if (!btn) {
                    common.log('未找到【发送】'); ui.run(() => { w.text.setText('未找到【发送】'); });
                    throw new Error('未找到【发送】');
                }
                common.log('找到【发送】，坐标', btn); ui.run(() => { w.text.setText('找到【发送】'); });
                common.clickIfParent(btn); sleep(2000);
                return;
            }else{
                throw new Error('未找到【浏览广告】');
            }
        }
        common.log('找到【浏览广告】，坐标', btn); ui.run(() => { w.text.setText('找到【浏览广告】'); });
        var remainSeconds = parseInt(btn.text.match(/([0-9]+)秒.*/)[1])-1;
        common.log('剩余', remainSeconds, '秒'); ui.run(() => { w.text.setText('剩余'+remainSeconds+'秒'); });
        for(var i=0;i<remainSeconds && btn;i++){
            ui.run(() => { w.text.setText('浏览广告'+(remainSeconds-i)); });
            swipe(device.width / 2, device.height/2, device.width / 2, device.height/2-100, 500);
            sleep(500);
            i++; ui.run(() => { w.text.setText('浏览广告'+(remainSeconds-i)); });
            swipe(device.width / 2, device.height/2, device.width / 2, device.height/2+100, 500);
            sleep(500);
        }
        btn = clickClose();
        if(!btn){
            common.log('未找到【关闭】'); ui.run(() => { w.text.setText('未找到【关闭】'); });
            throw new Error('未找到【关闭】');
        }
    }
    
    var adBtn,adBtnWaiter;
    do{
        adBtn = findAdBtn();
        if(!adBtn){
            common.log('未找到【广告】，检查等待'); ui.run(() => { w.text.setText('未找到【广告】，检查等待'); });
            var isWaiting = false;
            var adBtnWaiter = findAdBtn_waiter();
            while(adBtnWaiter) {
                isWaiting = true;
                sleep(1000);
                adBtnWaiter = findAdBtn_waiter();
            }
            if(isWaiting) {
                adBtn = findAdBtn();
                if (!adBtn) {
                    common.log('未找到【广告】'); ui.run(() => { w.text.setText('未找到【广告】'); });
                    throw new Error('未找到【广告】');
                }
            }
        }
        browserAd();
        if(adBtn && adBtn.isDraw){
            common.log('【抽奖】类型，等待5秒'); ui.run(() => { w.text.setText('【抽奖】类型，等待5秒'); });
            sleep(5000);
            timestamp = common.timestampFormat(new Date().getTime()).replace(/:/g, '-').replace(/ /g, '_');
            files.create(MediaDir + "乐园抽奖/");
            images.save(common.captureScreenx(), MediaDir + '乐园抽奖/' + timestamp + '.png');
        }
        clickConfirm();
        if(adBtn && adBtn.isStamina){
            common.log('【体力商店】类型，需再点击入口'); ui.run(() => { w.text.setText('【体力商店】类型，需再点击入口'); });
            sleep(1000);
            var btn = common.clickImg('庄园-乐园-广告-体力商店-入口.jpg', {threshold:0.9});
            if(!btn){
                common.log('未找到【体力商店】入口'); ui.run(() => { w.text.setText('未找到【体力商店】入口'); });
                throw new Error('未找到【体力商店】入口');
            }
            common.log('找到【体力商店】入口，坐标', btn); ui.run(() => { w.text.setText('找到【体力商店】入口'); });
            sleep(2000)
        }
        
        adBtn = findAdBtn();
        adBtnWaiter = findAdBtn_waiter();
    }while(adBtn || adBtnWaiter);
}
