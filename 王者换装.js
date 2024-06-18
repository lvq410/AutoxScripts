auto.waitFor();
var common = require('./common.js')

var MediaDir = '/storage/emulated/0/Autox/王者荣耀/'

common.setMediaDir(MediaDir)
common.setLogEnable(true)
common.setCaptureScreenLandscape(false)
common.setSaveCaptureScreen(false)

var deviceLong = Math.max(device.width, device.height)
var deviceShort = Math.min(device.width, device.height)

//==================================================================================================存储与配置
//storages.remove("com.lvt4j.autox.honorofkings")
var storage = storages.create("com.lvt4j.autox.honorofkings");
/** 主窗口位置 */
var mainPoint = storage.get("mainPoint", { x: parseInt((deviceLong-40)/2), y: 50 });
/** 商店按钮位置 */
var shopOpenBtnPoint = storage.get("shopOpenBtnPoint", {
    x: parseInt((200/2448)*deviceLong),
    y: parseInt((445/1080)*deviceShort)
});
/** 商店关闭按钮位置 */
var shopCloseBtnPoint = storage.get("shopCloseBtnPoint", {
    x: parseInt((2075/2448)*deviceLong),
    y: parseInt((114/1080)*deviceShort),
});
/** 待售卖物品位置 */
var sellItemPoint = storage.get("sellItemPoint", {
    x: parseInt((1655 / 2448) * deviceLong),
    y: parseInt((945 / 1080) * deviceShort)
});
/** 售卖按钮位置 */
var sellBtnPoint = storage.get("sellBtnPoint", {
    x: parseInt((2029 / 2448) * deviceLong),
    y: parseInt((861 / 1080) * deviceShort)
});
/** 购买按钮位置 */
var buyBtnPoint = storage.get("buyBtnPoint", {
    x: parseInt((330 / 2448) * deviceLong),
    y: parseInt((445 / 1080) * deviceShort)
});
//==================================================================================================悬浮窗
var mainW = floaty.window(
    <text id='btn' bg='#000000' alpha="0.4" w='40' h='30' color='#ffffff' gravity='center'>设置</text>
);
mainW.setAdjustEnabled(true)
mainW.setSize(-2, -2)
mainW.exitOnClose()
mainW.setPosition(mainPoint.x, mainPoint.y)

var shopOpenBtnW;
function w_shopOpenBtnW(){
    var w = floaty.rawWindow(
        <text id='btn' bg='#ff0000'  alpha="0.4" w='40' h='30' color='#ffffff' gravity='center'>商店</text>
    );
    w.setSize(-2, -2)
    w.setPosition(shopOpenBtnPoint.x, shopOpenBtnPoint.y)
    common.floatyMoveHandler(w, w.btn, function(x, y) {
        storage.put("shopOpenBtnPoint", shopOpenBtnPoint={ x: x, y: y })
    })
    return w;
}

var shopCloseBtnW;
function w_shopCloseBtnW() {
    var w = floaty.rawWindow(
        <text id='btn' bg='#ff0000' alpha="0.4" w='60' h='30' color='#ffffff' gravity='center'>关商店</text>
    );
    w.setSize(-2, -2)
    w.setPosition(shopCloseBtnPoint.x, shopCloseBtnPoint.y)
    common.floatyMoveHandler(w, w.btn, function(x, y) {
        storage.put("shopCloseBtnPoint", shopCloseBtnPoint = { x: x, y: y })
    })
    return w;
}

var sellItemW;
function w_sellItemW() {
    var w = floaty.rawWindow(
        <text id='btn' bg='#ff0000' alpha="0.4" w='60' h='30' color='#ffffff' gravity='center'>卖这个</text>
    );
    w.setSize(-2, -2)
    w.setPosition(sellItemPoint.x, sellItemPoint.y)
    common.floatyMoveHandler(w, w.btn, function(x, y) {
        storage.put("sellItemPoint", sellItemPoint = { x: x, y: y })
    })
    return w;
}

var sellBtnW;
function w_sellBtnW() {
    var w = floaty.rawWindow(
        <text id='btn' bg='#ff0000' alpha="0.4" w='80' h='30' color='#ffffff' gravity='center'>卖出按钮</text>
    );
    w.setSize(-2, -2)
    w.setPosition(sellBtnPoint.x, sellBtnPoint.y)
    common.floatyMoveHandler(w, w.btn, function(x, y) {
        storage.put("sellBtnPoint", sellBtnPoint = { x: x, y: y })
    })
    return w;
}

var buyBtnW;
function w_buyBtnW() {
    var w = floaty.rawWindow(
        <text id='btn' bg='#ff0000' alpha="0.4" w='20' h='30' color='#ffffff' gravity='center'>买</text>
    );
    w.setSize(-2, -2)
    w.setPosition(buyBtnPoint.x, buyBtnPoint.y)
    common.floatyMoveHandler(w, w.btn, function(x, y) {
        storage.put("buyBtnPoint", buyBtnPoint = { x: x, y: y })
    })
    return w;
}

function change2SettingMode() {
    mainW.setAdjustEnabled(true)
    ui.run(function() {
        mainW.btn.setText('设置');
    });
    shopOpenBtnW = w_shopOpenBtnW()
    shopCloseBtnW = w_shopCloseBtnW()
    sellItemW = w_sellItemW()
    sellBtnW = w_sellBtnW()
    buyBtnW = w_buyBtnW()
}

function change2RunMode() {
    storage.put("mainPoint", mainPoint={ x: mainW.getX(), y: mainW.getY() })
    
    mainW.setAdjustEnabled(false)
    ui.run(function() {
        mainW.btn.setText('换装');
    });
    shopOpenBtnW.close()
    shopCloseBtnW.close()
    sellItemW.close()
    sellBtnW.close()
    buyBtnW.close()
}

change2SettingMode()

setInterval(function(){}, 1000);
//==================================================================================================主程序
mainW.btn.on('click', function(){
    threads.start(function(){
        var mode = mainW.btn.getText();
        if(mode == '设置') return;
        if (justChangeMode) {
            justChangeMode = false;
            return;
        }
        
        log('点击商店', shopOpenBtnPoint.x, shopOpenBtnPoint.y)
        press(shopOpenBtnPoint.x, shopOpenBtnPoint.y, 1)
        sleep(10)
        
        log('点击待售卖物品', sellItemPoint.x, sellItemPoint.y)
        press(sellItemPoint.x, sellItemPoint.y, 1)
        sleep(50)
        
        log('点击卖出按钮', sellBtnPoint.x, sellBtnPoint.y)
        press(sellBtnPoint.x, sellBtnPoint.y, 1)
        sleep(10)
        
        log('点击关闭商店按钮', buyBtnPoint.x, buyBtnPoint.y)
        press(shopCloseBtnPoint.x, shopCloseBtnPoint.y, 1)
        sleep(50)
        
        log('点击购买按钮', buyBtnPoint.x, buyBtnPoint.y)
        press(buyBtnPoint.x, buyBtnPoint.y, 1)
    });
});
var justChangeMode = false;
mainW.btn.on('long_click', function(){
    var mode = mainW.btn.getText();
    if(mode == '设置') {
        justChangeMode = true;
        change2RunMode()
    }else{
        change2SettingMode()
    }
});

