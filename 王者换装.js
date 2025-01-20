auto.waitFor();
var common = require('./common.js')

var MediaDir = engines.myEngine().cwd()+'/王者换装/'

common.setMediaDir(MediaDir)
common.setLogEnable(true)
common.setCaptureScreenLandscape(true) // 横屏截图
common.setSaveCaptureScreen(false)

var deviceLong = Math.max(device.width, device.height)
var deviceShort = Math.min(device.width, device.height)

var MinSwipeTime = 220 //低于这个时间王者不认为有操作
var MinSwipeDistance = 50 //低于这个距离王者不认为有操作

/** 金币字体颜色 */
var MoneyFontColor = colors.parseColor('#FEE895')
/** 金币颜色容差 */
var MoneyFontColorTolerance = 10

/** 空装备栏颜色 */
var EmptyEquipColor = colors.parseColor('#0D2338');
/** 空装备栏颜色容差 */
var EmptyEquipColorTolerance = 10;

/** 购买按钮颜色 */
var BuyBtnColor = colors.parseColor('#A1804B')
/** 购买按钮颜色容差 */
var BuyBtnColorTolerance = 10

/** 卖出按钮颜色 */
var SaleBtnColor = colors.parseColor('#376BA4')
/** 卖出按钮颜色容差 */
var SaleBtnColorTolerance = 10

//==================================================================================================存储与配置
//storages.remove("com.lvt4j.autox.honorofkings.v2")
var storage = storages.create("com.lvt4j.autox.honorofkings.v2");
/** 主窗口位置 */
var MainPoint = storage.get("MainPoint", { //默认顶部居中位置
    x: parseInt((2313/2448)*deviceLong),
    y: 156
});
/** 商店按钮区域 */
var ShopOpenBtnPoint = storage.get("ShopOpenBtnPoint", {
    x: parseInt((147/2448)*deviceLong),
    y: parseInt((390/1080)*deviceShort),
    w: parseInt((120/2448)*deviceLong),
    h: parseInt((100/1080)*deviceShort)
});
/** 商店关闭按钮区域 */
var ShopCloseBtnPoint = storage.get("ShopCloseBtnPoint", {
    x: parseInt((2010/2448)*deviceLong),
    y: parseInt((48/1080)*deviceShort),
    w: parseInt((150/2448)*deviceLong),
    h: parseInt((100/1080)*deviceShort)
});
/** 商店打开后，左上角金币区域 */
var MoneyPoint = storage.get("MoneyPoint", {
    x: parseInt((325/2448) * deviceLong),
    y: parseInt((61/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((80/1080)*deviceShort)
});
/** 商店栏目【攻击】区域 */
var ItemAttackPoint = storage.get("ItemAttackPoint", {
    x: parseInt((311/2448) * deviceLong),
    y: parseInt((274/1080) * deviceShort),
    w: parseInt((119/2448)*deviceLong),
    h: parseInt((64/1080)*deviceShort)
});
/** 商店栏目【法术】区域 */
var ItemSpellPoint = storage.get("ItemSpellPoint", {
    x: parseInt((307/2448) * deviceLong),
    y: parseInt((374/1080) * deviceShort),
    w: parseInt((129/2448)*deviceLong),
    h: parseInt((73/1080)*deviceShort)
});
/** 商店栏目【防御】区域 */
var ItemDefendPoint = storage.get("ItemDefendPoint", {
    x: parseInt((309/2448) * deviceLong),
    y: parseInt((484/1080) * deviceShort),
    w: parseInt((111/2448)*deviceLong),
    h: parseInt((61/1080)*deviceShort)
});
/** 商店栏目【游走】区域 */
var ItemAssistPoint = storage.get("ItemAssistPoint", {
    x: parseInt((309/2448) * deviceLong),
    y: parseInt((786/1080) * deviceShort),
    w: parseInt((107/2448)*deviceLong),
    h: parseInt((78/1080)*deviceShort)
});
/** 商店装备选择区域 */
var EquipSelectPoint = storage.get("EquipSelectPoint", {
    x: parseInt((603/2448) * deviceLong),
    y: parseInt((157/1080) * deviceShort),
    w: parseInt((1224/2448)*deviceLong),
    h: parseInt((688/1080)*deviceShort)
});
/** 装备1区域 */
var Equip1Point = storage.get("Equip1Point", {
    x: parseInt((589/2448) * deviceLong),
    y: parseInt((885/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((133/1080)*deviceShort)
});
/** 装备2区域 */
var Equip2Point = storage.get("Equip2Point", {
    x: parseInt((780/2448) * deviceLong),
    y: parseInt((885/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((133/1080)*deviceShort)
});
/** 装备3区域 */
var Equip3Point = storage.get("Equip3Point", {
    x: parseInt((977/2448) * deviceLong),
    y: parseInt((885/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((133/1080)*deviceShort)
});
/** 装备4区域 */
var Equip4Point = storage.get("Equip4Point", {
    x: parseInt((1171/2448) * deviceLong),
    y: parseInt((885/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((133/1080)*deviceShort)
});
/** 装备5区域 */
var Equip5Point = storage.get("Equip5Point", {
    x: parseInt((1362/2448) * deviceLong),
    y: parseInt((885/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((133/1080)*deviceShort)
});
/** 装备6区域 */
var Equip6Point = storage.get("Equip6Point", {
    x: parseInt((1567/2448) * deviceLong),
    y: parseInt((885/1080) * deviceShort),
    w: parseInt((140/2448)*deviceLong),
    h: parseInt((133/1080)*deviceShort)
});
/** 出售按钮区域 */
var SaleBtnPoint = storage.get("SaleBtnPoint", {
    x: parseInt((1950 / 2448) * deviceLong),
    y: parseInt((870 / 1080) * deviceShort),
    w: parseInt((140 / 2448) * deviceLong),
    h: parseInt((70 / 1080) * deviceShort)
});
/** 购买按钮区域 */
var BuyBtnPoint = storage.get("BuyBtnPoint", {
    x: parseInt((1950 / 2448) * deviceLong),
    y: parseInt((958 / 1080) * deviceShort),
    w: parseInt((140 / 2448) * deviceLong),
    h: parseInt((70 / 1080) * deviceShort)
});
/** 各可互换装备是否可换 */
var ChangeableEquip = storage.get("ChangeableEquip", {
    armour: false, wand: false, hand: false, blade: false, wing: false, fire: false
});

var EquipMeta = {
    armour: {
        name: '贤者的庇护', shortName: '甲',
        img: images.read(MediaDir+'装备-贤者的庇护.jpg'),
        imgColding: null,
        imgSelect: images.read(MediaDir+'装备选择-贤者的庇护.jpg'),
        item: '防御',
        itemPointKey: 'ItemDefendPoint',
        price: 2100,
        salePrice: 1250, //卖出价格
    },
    wand: {
        name: '辉月', shortName: '金',
        img: images.read(MediaDir+'装备-辉月.jpg'),
        imgV2: images.read(MediaDir+'装备-月神.jpg'),
        imgColding: images.read(MediaDir+'装备-辉月-冷却中.jpg'),
        imgColdingV2: images.read(MediaDir+'装备-月神-冷却中.jpg'),
        imgSelect: images.read(MediaDir+'装备选择-辉月.jpg'),
        item: '法术',
        itemPointKey: 'ItemSpellPoint',
        price: 1990,
        salePrice: 1194, //卖出价格
    },
    hand: {
        name: '血魔之怒', shortName: '手',
        img: images.read(MediaDir + '装备-血魔之怒.jpg'),
        imgV2: images.read(MediaDir + '装备-怒魂.jpg'),
        imgColding: images.read(MediaDir + '装备-血魔之怒-冷却中.jpg'),
        imgColdingV2: images.read(MediaDir + '装备-怒魂-冷却中.jpg'),
        imgSelect: images.read(MediaDir + '装备选择-血魔之怒.jpg'),
        item: '防御',
        itemPointKey: 'ItemDefendPoint',
        price: 2100,
        salePrice: 1260, //卖出价格
    },
    blade: {
        name: '名刀司命', shortName: '刀',
        img: images.read(MediaDir + '装备-名刀司命.jpg'),
        imgColding:null,
        imgSelect: images.read(MediaDir + '装备选择-名刀司命.jpg'),
        item: '攻击',
        itemPointKey: 'ItemAttackPoint',
        price: 1900,
        salePrice: 1140, //卖出价格
    },
    wing: {
        name: '近卫救赎', shortName: '辅',
        img: images.read(MediaDir + '装备-近卫救赎.jpg'),
        imgColding: images.read(MediaDir + '装备-近卫救赎-冷却中.jpg'),
        imgSelect: images.read(MediaDir + '装备选择-近卫救赎.jpg'),
        item: '游走',
        itemPointKey: 'ItemAssistPoint',
        price: 1900,
        salePrice: 1140, //卖出价格
    },
    fire: {
        name: '炽热支配者', shortName: '法',
        img: images.read(MediaDir + '装备-炽热支配者.jpg'),
        imgColding: null,
        imgSelect: images.read(MediaDir + '装备选择-炽热支配者.jpg'),
        item: '法术',
        itemPointKey: 'ItemSpellPoint',
        price: 1950,
        salePrice: 1170, //卖出价格
    },
    shoses: {
        imgs: [
            images.read(MediaDir + '装备-影忍之足.jpg'),
            images.read(MediaDir + '装备-抵抗之靴.jpg'),
            images.read(MediaDir + '装备-冷静之靴.jpg'),
            images.read(MediaDir + '装备-秘法之靴.jpg'),
            images.read(MediaDir + '装备-急速战靴.jpg'),
            images.read(MediaDir + '装备-疾步之靴.jpg'),
        ],
        salePrice: 426
    }
}
//================================================================================================全局变量
var EquipChangeQueue = [];
var EquipChangeQueueIndex = 0;
if(ChangeableEquip.armour) EquipChangeQueue.push('armour');
if(ChangeableEquip.wand) EquipChangeQueue.push('wand');
if(ChangeableEquip.hand) EquipChangeQueue.push('hand');
if(ChangeableEquip.blade) EquipChangeQueue.push('blade');
if(ChangeableEquip.wing) EquipChangeQueue.push('wing');
if(ChangeableEquip.fire) EquipChangeQueue.push('fire');

function equipZoneInit(){
    return [Equip1Point.x, Equip1Point.y, Equip6Point.x+Equip6Point.w-Equip1Point.x, Equip1Point.h];
}
/** 装备1到装备6的整个区域 */
var EquipZone = equipZoneInit();

/** 常用变量：当前屏幕截图 */
var Screen;
//==================================================================================================悬浮窗
var MainW = floaty.window(
    <vertical alpha="0.4">
        <horizontal>
            <text id="armour" w='28' h='20' color='#ffffff' gravity='center'>甲</text>
            <text id="wand" w='28' h='20' color='#ffffff' gravity='center'>金</text>
        </horizontal>
        <horizontal>
            <text id="hand" w='28' h='20' color='#ffffff' gravity='center'>手</text>
            <text id="blade" w='28' h='20' color='#ffffff' gravity='center'>刀</text>
        </horizontal>
        <horizontal>
            <text id="wing" w='28' h='20' color='#ffffff' gravity='center'>辅</text>
            <text id="fire" w='28' h='20' color='#ffffff' gravity='center'>法</text>
        </horizontal>
        <text id='queue' w='56' h='15' bg='#0000ff' color='#ffffff' gravity='center' textSize='9sp'>甲金手辅法</text>
        
        <text id='btn' w='56' h='60' bg='#000000' color='#ffffff' gravity='center' marginTop='20'>换装</text>
    </vertical>
);
MainW.setAdjustEnabled(false)
MainW.setSize(-2, -2)
MainW.exitOnClose()
MainW.setPosition(MainPoint.x, MainPoint.y)
refreshMainBtnTxt()

MainW.armour.attr('bg', ChangeableEquip.armour?'#00ff00':'#000000');
MainW.armour.on('click', function(){ toggleChangeable('armour'); });
MainW.wand.attr('bg', ChangeableEquip.wand?'#00ff00':'#000000');
MainW.wand.on('click', function() { toggleChangeable('wand'); });
MainW.hand.attr('bg', ChangeableEquip.hand?'#00ff00':'#000000');
MainW.hand.on('click', function() { toggleChangeable('hand'); });
MainW.blade.attr('bg', ChangeableEquip.blade?'#00ff00':'#000000');
MainW.blade.on('click', function() { toggleChangeable('blade'); });
MainW.wing.attr('bg', ChangeableEquip.wing?'#00ff00':'#000000');
MainW.wing.on('click', function() { toggleChangeable('wing'); });
MainW.fire.attr('bg', ChangeableEquip.fire?'#00ff00':'#000000');
MainW.fire.on('click', function() { toggleChangeable('fire'); });
function toggleChangeable(equip) {
    function removeEquipFromQueue(equip){
        EquipChangeQueueIndex = EquipChangeQueueIndex % EquipChangeQueue.length;
        var index = EquipChangeQueue.indexOf(equip);
        if(index >= 0) EquipChangeQueue.splice(index, 1);
        if(index<EquipChangeQueueIndex) EquipChangeQueueIndex--;
    }
    
    ChangeableEquip[equip] = !ChangeableEquip[equip];
    MainW[equip].attr('bg', ChangeableEquip[equip] ? '#00ff00' : '#000000');
    if(ChangeableEquip[equip]){
        EquipChangeQueue.push(equip);
    }else{
        removeEquipFromQueue(equip);
    }
    
    switch(equip){
        case 'wand': //金身和血手共享cd，因此只能开启一个
            if(ChangeableEquip[equip]) {
                if (ChangeableEquip.hand) {
                    ChangeableEquip.hand = false;
                    MainW.hand.attr('bg', '#000000');
                    removeEquipFromQueue('hand');
                }
            }
            break;
        case 'hand': //金身和血手共享cd，因此只能开启一个
            if(ChangeableEquip[equip]) {
                if (ChangeableEquip.wand) {
                    ChangeableEquip.wand = false;
                    MainW.wand.attr('bg', '#000000');
                    removeEquipFromQueue('wand');
                }
            }
            break;
    }
    storage.put("ChangeableEquip", ChangeableEquip)
    
    
    refreshMainBtnTxt();
}

var ShopOpenBtnW,ShopCloseBtnW,MoneyW,EquipSelectW;
var ItemAttackW,ItemSpellW,ItemDefendW,ItemAssistW;
var Equip1W,Equip2W,Equip3W,Equip4W,Equip5W,Equip6W;
var BuyBtnW,SaleBtnW;

/** 支持拖动和改变大小的窗口，用于适配不同型号手机 */
function w_pointSettingWindow(text, key, point){
    var w = floaty.rawWindow(
        <frame w="*" h="*" bg='#000000' alpha="0.4">
            <text id='cnt' w="auto" h="auto" layout_gravity="center" gravity="center" bg='#ff0000' color='#ffffff'></text>
            <text id='handler' w="auto" h="auto" layout_gravity="right|bottom" bg='#00ff00' color='#ffffff'>✚</text>
        </frame>
    );
    w.cnt.setText(text)
    w.setSize(point.w, point.h)
    w.cnt.setWidth(point.w); w.cnt.setHeight(point.h);
    w.setPosition(point.x, point.y)
    common.floatyMoveHandler(w, w.cnt, function(x, y) {
        point.x = x; point.y = y;
        storage.put(key, point)
    })
    common.floatyResizeHandler(w, w.handler, function(width, height) {
        point.w = width; point.h = height;
        w.cnt.setWidth(width); w.cnt.setHeight(height);
        storage.put(key, point)
    })
    return w;
}


function change2SettingMode() {
    MainW.setAdjustEnabled(true)
    ui.run(function() {
        MainW.btn.setText('设置');
    });
    ShopOpenBtnW = w_pointSettingWindow('商店', 'ShopOpenBtnPoint', ShopOpenBtnPoint);
    ShopCloseBtnW = w_pointSettingWindow('关商店', 'ShopCloseBtnPoint', ShopCloseBtnPoint);
    
    MoneyW = w_pointSettingWindow('金币', 'MoneyPoint', MoneyPoint);
    
    ItemAttackW = w_pointSettingWindow('攻击', 'ItemAttackPoint', ItemAttackPoint)
    ItemSpellW = w_pointSettingWindow('法术', 'ItemSpellPoint', ItemSpellPoint)
    ItemDefendW = w_pointSettingWindow('防御', 'ItemDefendPoint', ItemDefendPoint)
    ItemAssistW = w_pointSettingWindow('游走', 'ItemAssistPoint', ItemAssistPoint)
    
    EquipSelectW = w_pointSettingWindow('装备选择', 'EquipSelectPoint', EquipSelectPoint)
    
    Equip1W = w_pointSettingWindow('装备1', 'Equip1Point', Equip1Point)
    Equip2W = w_pointSettingWindow('装备2', 'Equip2Point', Equip2Point)
    Equip3W = w_pointSettingWindow('装备3', 'Equip3Point', Equip3Point)
    Equip4W = w_pointSettingWindow('装备4', 'Equip4Point', Equip4Point)
    Equip5W = w_pointSettingWindow('装备5', 'Equip5Point', Equip5Point)
    Equip6W = w_pointSettingWindow('装备6', 'Equip6Point', Equip6Point)
    
    BuyBtnW = w_pointSettingWindow('购买', 'BuyBtnPoint', BuyBtnPoint)
    SaleBtnW = w_pointSettingWindow('卖出', 'SaleBtnPoint', SaleBtnPoint)
}

function change2RunMode() {
    MainPoint.x = MainW.getX(); MainPoint.y = MainW.getY();
    storage.put("MainPoint", MainPoint)
    
    MainW.setAdjustEnabled(false)
    ui.run(function() {
        MainW.btn.setText('换装');
        refreshMainBtnTxt()
    });
    if(ShopOpenBtnW) ShopOpenBtnW.close(); if(ShopCloseBtnW) ShopCloseBtnW.close();
    if(MoneyW) MoneyW.close();
    if(ItemAttackW) ItemAttackW.close(); if(ItemSpellW) ItemSpellW.close(); if(ItemDefendW) ItemDefendW.close(); if(ItemAssistW) ItemAssistW.close();
    if(EquipSelectW) EquipSelectW.close();
    if(Equip1W) Equip1W.close(); if(Equip2W) Equip2W.close(); if(Equip3W) Equip3W.close(); if(Equip4W) Equip4W.close(); if(Equip5W) Equip5W.close(); if(Equip6W) Equip6W.close();
    
    EquipZone = equipZoneInit();
    
    if(BuyBtnW) BuyBtnW.close(); if(SaleBtnW) SaleBtnW.close();
}

function refreshMainBtnTxt(){
    if(MainW.btn.getText() == '设置') return;
    var txt = '换装';
    if(EquipChangeQueue.length) {
        var targetEquip = EquipChangeQueue[EquipChangeQueueIndex%EquipChangeQueue.length];
        var targetEquipMeta = EquipMeta[targetEquip];
        txt = '换'+targetEquipMeta.shortName;
    }
    var queueTxt = EquipChangeQueue.map(e=>EquipMeta[e].shortName).join('');
    ui.run(()=>{
        MainW.btn.setText(txt);
        MainW.queue.setText(queueTxt);
    });
}

//change2SettingMode()
//change2RunMode();

setInterval(function(){}, 1000);
//==================================================================================================主程序
/** 从设置切换回运行模式，会立刻触发一个click事件，用该变量阻止这次事件的运行 */
var JustChangeMode = false;
MainW.btn.on('click', function(){
    var mode = MainW.btn.getText();
    if(mode == '设置') return;
    if (JustChangeMode) {
        JustChangeMode = false;
        return;
    }
    threads.start(()=>{
        try {
            ui.run(()=>{MainW.btn.attr('bg', '#00ff00')});
            if(change()){
                //成功换装，切换下一件装备
                EquipChangeQueueIndex++;
                refreshMainBtnTxt()
            }
        }catch(e){
            toast('执行异常'+e)
            common.log('执行异常'+e)
        }finally{
            ui.run(()=>{MainW.btn.attr('bg', '#000000')});
        }
    });
});

MainW.btn.on('long_click', function(){
    var mode = MainW.btn.getText();
    if(mode == '设置') {
        JustChangeMode = true;
        change2RunMode()
    }else{
        change2SettingMode()
    }
});



/**
 * 换装备主逻辑
 * @returns true 成功执行换装
 */
function change(){
    if(!EquipChangeQueue.length) {
        return toast('未设置可换装备')
    }
    var targetEquip = EquipChangeQueue[EquipChangeQueueIndex%EquipChangeQueue.length];
    var targetEquipMeta = EquipMeta[targetEquip];
    common.log('目标装备', targetEquipMeta.name)
    
    var startTime = new Date().getTime();
    common.log('点开商店')
    press(ShopOpenBtnPoint.x+ShopOpenBtnPoint.w/2, ShopOpenBtnPoint.y+ShopOpenBtnPoint.h/2, 1)
    
    common.log('等待商店打开')
    while(true){
        Screen = common.captureScreenx();
        if(isShopOpen(Screen)) break;
        sleep(10);
        if(new Date().getTime() - startTime > 500) {
            throw new Error('等待商店打开超时');
        }
    }
    common.log('商店已打开')
    
    //提取金币
    var money = moneyExtract(Screen);
    if (!money) throw new Error('未识别到金币');
    common.log('金币', money)
    
    //是否已有目标装备
    for(var i=0;i<EquipChangeQueue.length;i++){
        common.log('判断是否已有目标装备', targetEquip)
        var wearedInfo = hasWeared(Screen, targetEquipMeta);
        common.log('是否已有目标装备', wearedInfo)
        if(!wearedInfo) break;
        //已有目标装备
        if(targetEquipMeta.imgColding && !wearedInfo.colding){ //目标装备支持在装备栏中显示冷却信息，且未处于冷却中
            common.log('已有【'+targetEquipMeta.name+'】且未冷却，无需购买')
            toast('已有【'+targetEquipMeta.name+'】且未冷却，无需购买')
            return shopClose();
        }
        //目标装备 （支持在装备栏中显示冷却信息，且处于冷却中） 或 （不支持在装备栏中显示冷却信息），则卖掉，且切换到新的目标装备
        common.log('已有【'+targetEquipMeta.name+'】且冷却中，准备卖掉', wearedInfo.point.x, wearedInfo.point.y)
        saleEquip(wearedInfo.point.x, wearedInfo.point.y)
        Screen = common.captureScreenx(); //卖出后为之后的判断准确，屏幕截图需重新刷新
        money += wearedInfo.meta.salePrice; //金额累加
        //切换至下一可换装备
        if(i==EquipChangeQueue.length-1) { //所有可换装备都轮了一遍，都拥有，自然没得换（选择的可换装备太少，或正常谁这样出装啊……
            toast('拥有所有可换装备')
            return shopClose();
        }
        targetEquip = EquipChangeQueue[++EquipChangeQueueIndex % EquipChangeQueue.length];
        common.log('切换目标装备', targetEquip)
        targetEquipMeta = EquipMeta[targetEquip];
        refreshMainBtnTxt();
    }
    
    if(money > targetEquipMeta.price) { //金币足够
        //是否有空位
        var hasEmptyEquipRst = hasEmptyEquip(Screen);
        common.log('是否有空位', hasEmptyEquipRst)
        if(hasEmptyEquipRst) { //有空位
            //购买目标装备
            itemChoseAndEquipSelectThenBuy(targetEquipMeta);
            shopClose();
            return true;
        }else{ //无空位
            //装备栏是否有所选可互换装备
            var hasAnyChangeableWeared = hasAnyChangeableWearedExcept(Screen, targetEquip);
            common.log('是否有可互换装备', hasAnyChangeableWeared)
            if(hasAnyChangeableWeared){
                //卖掉已有可互换装备
                common.log('卖掉已有可互换装备', hasAnyChangeableWeared.meta.name)
                saleEquip(hasAnyChangeableWeared.point.x, hasAnyChangeableWeared.point.y)
                //购买目标装备
                itemChoseAndEquipSelectThenBuy(targetEquipMeta);
                //关闭商店
                shopClose();
                return true;
            }
            //是否有鞋子
            common.log('是否有鞋子 开始判断')
            var hasShoes = hasWearedAnyShose(Screen);
            common.log('是否有鞋子 结果', hasShoes)
            if(hasShoes) {
                //卖掉鞋子
                common.log('卖掉鞋子')
                saleEquip(hasShoes.x, hasShoes.y)
                //购买目标装备
                itemChoseAndEquipSelectThenBuy(targetEquipMeta);
                //关闭商店
                shopClose();
                return true;
            }
            //卖最后一件装备
            common.log('没有空位，卖最后一件装备')
            saleEquip(Equip6Point.x+Equip6Point.w/2, Equip6Point.y+Equip6Point.h/2)
            //购买目标装备
            itemChoseAndEquipSelectThenBuy(targetEquipMeta);
            //关闭商店
            shopClose();
            return true;
        }
    }else{ //金币不足
        //装备栏是否有所选可互换装备
        common.log('金币不足 开始判断是否有可互换装备')
        var hasAnyChangeableWeared = hasAnyChangeableWearedExcept(Screen, targetEquip);
        common.log('是否有可互换装备 结果', hasAnyChangeableWeared)
        if(hasAnyChangeableWeared){
            //计算卖掉已有可互换装备金额+剩余金额是否足够
            var salePrice = hasAnyChangeableWeared.meta.salePrice;
            if(money + salePrice >= targetEquipMeta.price) {
                //卖掉已有可互换装备
                common.log('卖掉后就够了，准备卖掉已有可互换装备', hasAnyChangeableWeared.meta.name)
                saleEquip(hasAnyChangeableWeared.point.x, hasAnyChangeableWeared.point.y)
                //购买目标装备
                itemChoseAndEquipSelectThenBuy(targetEquipMeta);
                //关闭商店
                shopClose();
                return true;
            }else{
                //仍不够，再看看有没有鞋子
                var hasShoes = hasWearedAnyShose(Screen);
                common.log('是否有鞋子 结果', hasShoes)
                if(hasShoes) {
                    //计算卖掉鞋子金额是否足够
                    if (money + salePrice + EquipMeta.shoses.salePrice >= targetEquipMeta.price) {
                        //卖掉已有可互换装备
                        common.log('再卖掉鞋子后就够了，准备卖掉已有可互换装备', hasAnyChangeableWeared.meta.name)
                        saleEquip(hasAnyChangeableWeared.point.x, hasAnyChangeableWeared.point.y)
                        //卖掉鞋子
                        common.log('卖掉鞋子')
                        saleEquip(hasShoes.x, hasShoes.y)
                        //购买目标装备
                        itemChoseAndEquipSelectThenBuy(targetEquipMeta);
                        //关闭商店
                        shopClose();
                        return true;
                    }else{
                        toast('金币不足且卖掉【'+hasAnyChangeableWeared.meta.name+'】及鞋子后仍不足')
                        return shopClose();
                    }
                }else{
                    toast('金币不足且卖掉【'+hasAnyChangeableWeared.meta.name+'】后仍不足')
                    return shopClose();
                }
            }
        }else{//没有可互换装备，看看有没有鞋子
            var hasShoes = hasWearedAnyShose(Screen);
            common.log('是否有鞋子 结果', hasShoes)
            if(hasShoes) {
                //计算卖掉鞋子金额是否足够
                if(money + EquipMeta.shoses.salePrice >= targetEquipMeta.price) {
                    //卖掉鞋子
                    common.log('卖掉鞋子')
                    saleEquip(hasShoes.x, hasShoes.y)
                    //购买目标装备
                    itemChoseAndEquipSelectThenBuy(targetEquipMeta);
                    //关闭商店
                    shopClose();
                    return true;
                }else{
                    toast('金币不足且卖掉鞋子后仍不足')
                    return shopClose();
                }
            }else{
                toast('金币不足且没有可互换装备或鞋子')
                return shopClose();
            }
        }
    }
}

/**
 * 判断是否有空的装备槽位
 * @returns {Number} 有空的装备槽位则返回空槽位编号（从右往左找到的第一个），否则返回false
 */
function hasEmptyEquip(screen){
    for (var i = 6; i >= 1; i--) {
        if (isEmptyEquip(screen, i)) {
            return i;
        }
    }
    return false;
}

/**
 * 判断装备槽位是否为空
 * 提取9个点坐标判断与{@link EmptyEquipColor}是否相似
 * 如果相似数量超过一定数量，则判定为空
 * @param {Image} screen 截图
 * @param {Number} equipIdx 装备槽位[1-6]
 */
function isEmptyEquip(screen, equipIdx){
    var point = eval('Equip'+equipIdx+'Point');
    var xs = [point.x+point.w/4, point.x+point.w*2/4, point.x+point.w*3/4];
    var ys = [point.y+point.h/4, point.y+point.h*2/4, point.y+point.h*3/4];
    var similarCount = 0;
    xs.forEach(x=>{
        ys.forEach(y => {
            if(colors.isSimilar(images.pixel(screen, x, y), EmptyEquipColor, EmptyEquipColorTolerance, 'diff')) similarCount++;
        });
    });
    return similarCount>7;
}

/**
 * 判断商店是否打开
 * 从金币区域，垂直方向上下5个像素位置，水平方向从最左侧开始，向右每间隔一个像素，共提取50个像素
 * 也即3行，50列，共计150个像素，与{@link MoneyFontColor}比较，相似数量超过一定数量则认为商店打开
 * @param {Image} screen 截图
 * @returns {Boolean} 商店是否打开
 */
function isShopOpen(screen){
    var moneyPointCenterY = MoneyPoint.y + MoneyPoint.h/2;
    var ys = [moneyPointCenterY-5, moneyPointCenterY, moneyPointCenterY+5];
    var similarCount = 0;
    ys.forEach(y => {
        for(var x=MoneyPoint.x; x<MoneyPoint.x+100; x+=2){
            if(colors.isSimilar(images.pixel(screen, x, y), MoneyFontColor, MoneyFontColorTolerance, 'diff')) similarCount++;
        }
    });
    return similarCount>10;
}

/**
 * 商店打开后，进行{@link MoneyPoint}区域的金币提取
 * 耗时 111
 * @returns {Number} 金币数量，未能识别返回空
 */
function moneyExtract(screen){
    var ocrY;
    var moneyImg;
    if(MainPoint.h>common.PaddleOcrMin.h){
        ocrY = MoneyPoint.y;
    }else{
        var moneyPointCenterY = MoneyPoint.y + MoneyPoint.h/2;
        ocrY = moneyPointCenterY - common.PaddleOcrMin.h/2;
    }
    if(ocrY<0) ocrY = 0;
    moneyImg = images.clip(screen, MoneyPoint.x, ocrY, Math.max(MoneyPoint.w, common.PaddleOcrMin.w), Math.max(MoneyPoint.h, common.PaddleOcrMin.h));
    var ocrRst = paddle.ocr(moneyImg); moneyImg.recycle();
    common.log('金币ocr结果', ocrRst)
    for (var i = 0; i < ocrRst.length; i++) {
        var rst = ocrRst[i];
        var bounds = rst.bounds;
        bounds.left += MoneyPoint.x;
        bounds.top += ocrY;
        bounds.right += MoneyPoint.x;
        bounds.bottom += ocrY;
        if(bounds.left < MoneyPoint.x || bounds.top < MoneyPoint.y || bounds.right > MoneyPoint.x + MoneyPoint.w || bounds.bottom > MoneyPoint.y + MoneyPoint.h) continue;
        var numStr = rst.text.match(/\d+/g).join('')
        if(!numStr) continue;
        return parseInt(numStr);
    }
}

/**
 * 判断是否已穿戴指定装备
 * @return 空说明未穿戴，否则：<pre>{
 *  point: {x, y}, //装备中心点位置
 *  colding: false //是否冷却中（只有可在装备栏显示冷却信息的装备，且处于冷却中时，才为true）
 *  meta: EquipMeta //装备元数据
 * }</pre>
 */
function hasWeared(screen, equipMeta){
    var point = images.findImage(screen, equipMeta.img, {threshold: 0.8, region: EquipZone});
    if(point){
        return {
            point: {
                x: point.x + equipMeta.img.getWidth() / 2,
                y: point.y + equipMeta.img.getHeight() / 2
            },
            colding: false,
            meta: equipMeta
        }
    }
    if(equipMeta.imgV2){
        point = images.findImage(screen, equipMeta.imgV2, { threshold: 0.8, region: EquipZone });
        if (point) {
            return {
                point: {
                    x: point.x + equipMeta.imgV2.getWidth() / 2,
                    y: point.y + equipMeta.imgV2.getHeight() / 2
                },
                colding: false,
                meta: equipMeta
            }
        }
    }
    
    if(equipMeta.imgColding){
        point = images.findImage(screen, equipMeta.imgColding, { threshold: 0.8, region: EquipZone });
        if (point) {
            return {
                point: {
                    x: point.x + equipMeta.imgColding.getWidth() / 2,
                    y: point.y + equipMeta.imgColding.getHeight() / 2
                },
                colding: true,
                meta: equipMeta
            }
        }
    }
    if(equipMeta.imgColdingV2){
        point = images.findImage(screen, equipMeta.imgColdingV2, { threshold: 0.8, region: EquipZone });
        if (point) {
            return {
                point: {
                    x: point.x + equipMeta.imgColdingV2.getWidth() / 2,
                    y: point.y + equipMeta.imgColdingV2.getHeight() / 2
                },
                colding: true,
                meta: equipMeta
            }
        }
    }
}

/**
 * 判断是否已穿戴 任一一件可换装备
 * @return 同{@link hasWeared}
 */
function hasAnyChangeableWearedExcept(screen, exceptEquip) {
    for (var equip in ChangeableEquip) {
        if (equip == exceptEquip || !ChangeableEquip[equip]) continue;
        var wearedInfo = hasWeared(screen, EquipMeta[equip]);
        if(wearedInfo) return wearedInfo;
    }
}

/**
 * 判断是否已穿戴任何一件鞋子
 * @return <pre>{x,y}</pre>
 */
function hasWearedAnyShose(screen){
    for (var i = 0; i < EquipMeta.shoses.imgs.length; i++) {
        var point = images.findImage(screen, EquipMeta.shoses.imgs[i], { threshold: 0.8, region: EquipZone });
        if (point) return point;
    }
}

/**
 * 选中指定坐标装备，卖掉
 */
function saleEquip(x, y){
    common.log('选中装备，等待卖出按钮出现', x, y)
    var startTime = new Date().getTime();
    while(true){
        press(x, y, 1)
        Screen = common.captureScreenx();
        if(isSaleBtnShow(Screen)){
            common.log('卖出按钮已显示')
            break;
        }
        sleep(1);
        if (new Date().getTime() - startTime > 500) {
            //throw new Error('等待卖出按钮显示超时'); //某些莫名奇妙的情况下，没识别到卖出按钮出现与销售，但实际上已经卖出了
            break;
        }
    }
    //点击卖出按钮直到其消失
    common.log('点击卖出按钮')
    startTime = new Date().getTime();
    while (true) {
        press(SaleBtnPoint.x + SaleBtnPoint.w / 2, SaleBtnPoint.y + SaleBtnPoint.h / 2, 1)
        Screen = common.captureScreenx();
        if(!isSaleBtnShow(Screen)) break;
        sleep(10);
        if (new Date().getTime() - startTime > 500) {
            throw new Error('点击卖出按钮直到其消失 超时');
        }
    }
}

function isSaleBtnShow(screen){
    var saleBtnCenterX = SaleBtnPoint.x + SaleBtnPoint.w / 2;
    var saleBtnCenterY = SaleBtnPoint.y + SaleBtnPoint.h / 2;

    var ys = [saleBtnCenterY - 5, saleBtnCenterY, saleBtnCenterY + 5];
    var similarCount = 0;
    ys.forEach(y => {
        for (var x = saleBtnCenterX - 50; x < saleBtnCenterX + 50; x += 2) {
            if (colors.isSimilar(images.pixel(screen, x, y), SaleBtnColor, SaleBtnColorTolerance, 'diff')) similarCount++;
        }
    });
    return similarCount > 20;
}

/**
 * 选择装备所属栏目，并且下滑选择装备，然后点击购买
 */
function itemChoseAndEquipSelectThenBuy(meta){
//    function swipeUp(){
//        swipe(EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h*8/10, //上划不到一屏
//                EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h*2/10,
//            220); //低于这个时间王者不认为有操作
//    }
//    function swipeStop(){
//        //快速上划后会导致装备栏目持续滚动，需要再发送一个短距离滑动命令，使装备栏目停止滚动
//        swipe(EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h/2,
//                EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h/2+EquipSelectPoint.h/15, //必须有一点向下划动的距离
//            500); //必须要足够长的时间，才能阻止滚动
//    }
    var itemPoint = eval(meta.itemPointKey);
    common.log('点击栏目按钮', itemPoint.x + itemPoint.w/2, itemPoint.y + itemPoint.h/2)
    press(itemPoint.x + itemPoint.w/2, itemPoint.y + itemPoint.h/2, 1)

    common.log('等待装备出现')
    var equipSelectFindImgRst;
    var startTime = new Date().getTime();
    while(!equipSelectFindImgRst){
        Screen = common.captureScreenx();
        equipSelectFindImgRst = images.findImage(Screen, meta.imgSelect, {threshold: 0.8, region:[
            EquipSelectPoint.x, EquipSelectPoint.y, EquipSelectPoint.w, EquipSelectPoint.h
        ]});
        common.log('装备选择区找图结果', equipSelectFindImgRst);
        if(equipSelectFindImgRst){
            equipSelectFindImgRst = {
                x: equipSelectFindImgRst.x + meta.imgSelect.getWidth()/2,
                y: equipSelectFindImgRst.y + meta.imgSelect.getHeight()/2
            };
            break;
        }
        sleep(10);
        if (new Date().getTime() - startTime > 500) {
            throw new Error('等待装备出现超时');
        }
    }
    
    common.log('点击装备，等待购买按钮出现');
    var startTime = new Date().getTime();
    while(true){
        press(equipSelectFindImgRst.x, equipSelectFindImgRst.y, 1);
        Screen = common.captureScreenx();
        if(isBuyBtnShow(Screen)){
            common.log('购买按钮已显示')
            break;
        }
        sleep(10);
        if (new Date().getTime() - startTime > 500) {
            throw new Error('等待购买按钮显示超时');
        }
    }
    //点击购买按钮直到其消失
    common.log('点击购买按钮');
    startTime = new Date().getTime();
    while(true){
        press(BuyBtnPoint.x+BuyBtnPoint.w/2, BuyBtnPoint.y+BuyBtnPoint.h/2, 1) //点击购买
        Screen = common.captureScreenx();
        if(!isBuyBtnShow(Screen)) break;
        sleep(1);
        if (new Date().getTime() - startTime > 500) {
            throw new Error('点击购买按钮直到其消失 超时');
        }
    }
}

function isBuyBtnShow(screen){
    var buyBtnCenterX = BuyBtnPoint.x + BuyBtnPoint.w/2;
    var buyBtnCenterY = BuyBtnPoint.y + BuyBtnPoint.h/2;
    
    var ys = [buyBtnCenterY-5, buyBtnCenterY, buyBtnCenterY+5];
    var similarCount = 0;
    ys.forEach(y => {
        for(var x=buyBtnCenterX-50; x<buyBtnCenterX+50; x+=2){
            if(colors.isSimilar(images.pixel(screen, x, y), BuyBtnColor, BuyBtnColorTolerance, 'diff')) similarCount++;
        }
    });
    return similarCount>20;
}

function shopClose(){
    press(ShopCloseBtnPoint.x + ShopCloseBtnPoint.w / 2, ShopCloseBtnPoint.y + ShopCloseBtnPoint.h / 2, 1)
}

//==================================================================================================实验函数
/** 金币提取 */
function lab_moneyExtract(){
    var screen = common.captureScreenx();
    //ocr仅识别金币区域时会导致崩溃，可能因为金币区域图片太小，因此改为识别商店按钮加金币区域
//    var moneyImg = images.clip(screen, P.money.left, P.money.top, P.money.right-P.money.left, P.money.bottom-P.money.top);
    var moneyImg = images.clip(screen, P.shop.left, P.shop.top, P.shop.right-P.shop.left, P.shop.bottom-P.shop.top);
    var ocrRst = paddle.ocr(moneyImg);
    common.log('ocr', ocrRst);
    var text = '';
    for(var i = 0; i < ocrRst.length; i++){
        var rst = ocrRst[i];
        var bounds = rst.bounds;
        if(bounds.left < P.money2shop.left || bounds.top < P.money2shop.top || bounds.right > P.money2shop.right || bounds.bottom > P.money2shop.bottom) continue;
        text += rst.text;
    }
    return parseInt(text);
}

/**
 * 商店展开之后的左侧栏目选择
 */
function lab_shopItemSelect(item){
    var screen = common.captureScreenx();
    var itemImg = images.clip(screen, P.shopList.left, P.shopList.top, P.shopList.right-P.shopList.left, P.shopList.bottom-P.shopList.top);
    var ocrRst = paddle.ocr(itemImg);
    common.log('ocr', ocrRst);
    var bounds;
    for(var i = 0; i < ocrRst.length; i++){
        var rst = ocrRst[i];
        if(rst.text != item) continue;
        bounds = rst.bounds;
        break;
    }
    if(!bounds) return;
    var centerX = P.shopList.left + bounds.left + (bounds.right-bounds.left)/2;
    var centerY = P.shopList.top + bounds.top + (bounds.bottom-bounds.top)/2;
    common.log('center', centerX, centerY);
    press(centerX, centerY, 1);
    return true;
}

/**
 * 在已打开的商店中购买装备
 */
function lab_shopEquipBuy(item, equip) {
    var startTime = new Date().getTime();
    common.log('点开商店')
    press(ShopOpenBtnPoint.x+ShopOpenBtnPoint.w/2, ShopOpenBtnPoint.y+ShopOpenBtnPoint.h/2, 1)
    
    var screen;
    
    common.log('等待商店打开')
    var itemBounds;
    while(!itemBounds){
        screen = common.captureScreenx();
        var itemListImg = images.clip(screen, ItemListPoint.x, ItemListPoint.y,
            Math.max(ItemListPoint.w, common.PaddleOcrMin.w), Math.max(ItemListPoint.h, common.PaddleOcrMin.h));
        var itemListOcrRst = paddle.ocr(itemListImg);
        common.log('商店栏目区OCR结果', itemListOcrRst);
        
        for (var i = 0; i < itemListOcrRst.length; i++) {
            var rst = itemListOcrRst[i];
            if(rst.text != item) continue;
            itemBounds = rst.bounds;
            break;
        }
        
        if(itemBounds){
            common.log('找到栏目按钮', itemBounds);
            break;
        }
        sleep(10);
        if(new Date().getTime() - startTime > 1500) {
            throw new Error('等待商店打开超时');
        }
    }
    common.log('等待商店打开耗时', new Date().getTime() - startTime);
    
    var centerX = ItemListPoint.x + itemBounds.left + (itemBounds.right-itemBounds.left)/2;
    var centerY = ItemListPoint.y + itemBounds.top + (itemBounds.bottom-itemBounds.top)/2;
    common.log('点击栏目按钮在屏幕坐标', centerX, centerY);
    press(centerX, centerY, 1);
    
    common.log('寻找目标装备')
    var equipMeta = EquipMeta[equip];
    for(var i=0;i<equipMeta.selectSwipe;i++){
        swipe(EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h*9/10, //上划一屏
            EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h*1/10,
        220); //低于这个时间王者不认为有操作
    }
    //快速上划后会导致装备栏目持续滚动，需要再发送一个短距离滑动命令，使装备栏目停止滚动
    swipe(EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h/2,
        EquipSelectPoint.x + EquipSelectPoint.w/2, EquipSelectPoint.y + EquipSelectPoint.h/2+EquipSelectPoint.h/15, //必须有一点向下划动的距离
        500); //必须要足够长的时间，才能阻止滚动
    
    var equipSelectFindImgRst = images.findImage(common.captureScreenx(), EquipMeta[equip].img, {threshold: 0.8, region:[
        EquipSelectPoint.x, EquipSelectPoint.y, EquipSelectPoint.w, EquipSelectPoint.h
    ]});
    common.log('装备选择区找图结果', equipSelectFindImgRst);
    
    if(!equipSelectFindImgRst){
        throw new Error('未找到装备');
    }
    press(equipSelectFindImgRst.x, equipSelectFindImgRst.y, 1);
    common.log('寻找目标装备耗时', new Date().getTime() - startTime);
}


function lab_test(){
    
}

function lab_isEmptyEquip(screen, equipIdx){
    var point = eval('Equip'+equipIdx+'Point');
    var xs = [point.x+point.w/4, point.x+point.w*2/4, point.x+point.w*3/4];
    var ys = [point.y+point.h/4, point.y+point.h*2/4, point.y+point.h*3/4];
    var similarCount = 0;
    xs.forEach(x=>{
        ys.forEach(y => {
            var color = images.pixel(screen, x, y);
            var similar = colors.isSimilar(color, EmptyEquipColor, EmptyEquipColorTolerance, 'diff');
            common.log('color', x, y, colors.toString(color), similar);
            if(similar) similarCount++;
        });
    });
    common.log('similarCount', similarCount);
    return similarCount>7;
}

/**
 * 实验函数：对比 图片搜索 和 ocr 速度
 * 结论：ocr太慢，近乎20倍差距
 */
function lab_compare_speed_ocr_img(){
    var startTime = new Date().getTime();
    
    var tmp = images.read(MediaDir+'装备-贤者的庇护.jpg')
    for(var i=0;i<10;i++){
        screen = common.captureScreenx();
        var equipSelectImg = images.clip(screen, EquipSelectPoint.x, EquipSelectPoint.y,
            Math.max(EquipSelectPoint.w, common.PaddleOcrMin.w), Math.max(EquipSelectPoint.h, common.PaddleOcrMin.h));
        var rst = images.matchTemplate(screen, tmp, {threshold:0.9})
    }
    var endTime = new Date().getTime();
    common.log('matchTemplate耗时', endTime-startTime); //399
    
    startTime = new Date().getTime();
    for(var i=0;i<10;i++){
        screen = common.captureScreenx();
        var equipSelectImg = images.clip(screen, EquipSelectPoint.x, EquipSelectPoint.y,
            Math.max(EquipSelectPoint.w, common.PaddleOcrMin.w), Math.max(EquipSelectPoint.h, common.PaddleOcrMin.h));
        var ocrRst = paddle.ocr(equipSelectImg);
    }
    endTime = new Date().getTime();
    common.log('ocr耗时', endTime-startTime); //8169
}

/**
 * 实验函数：对比ocr识别大图 和 小图 速度
 * 结论：ocr识别小图确实比大图快不少
 */
function lab_compare_ocr_big_small(){
    var screen = images.read(MediaDir+'场景/有空槽位.jpg')
    var moneyImg = images.clip(screen, MoneyPoint.x, MoneyPoint.y, Math.max(MoneyPoint.w, common.PaddleOcrMin.w), Math.max(MoneyPoint.h, common.PaddleOcrMin.h));
    var ocrPoint = {
        left: Math.min(MoneyPoint.x, ItemListPoint.x),
        top: Math.min(MoneyPoint.y, ItemListPoint.y),
        right: Math.max(MoneyPoint.x+MoneyPoint.w, ItemListPoint.x+ItemListPoint.w),
        bottom: Math.max(MoneyPoint.y+MoneyPoint.h, ItemListPoint.y+ItemListPoint.h)
    };
    ocrPoint.w = Math.max(ocrPoint.right - ocrPoint.left, common.PaddleOcrMin.w);
    ocrPoint.h = Math.max(ocrPoint.bottom - ocrPoint.top, common.PaddleOcrMin.h);
    
    var moneyAndItemListImg = images.clip(screen, ocrPoint.left, ocrPoint.top, ocrPoint.w, ocrPoint.h);
    
    var startTime = new Date().getTime();
    for(var i=0;i<10;i++){
        var ocrRst = paddle.ocr(moneyImg);
        common.log('money ocrRst', ocrRst);
    }
    var endTime = new Date().getTime();
    common.log('money ocr耗时', endTime-startTime); //822
    
    startTime = new Date().getTime();
    for (var i = 0; i < 10; i++) {
        var ocrRst = paddle.ocr(moneyAndItemListImg);
        common.log('moneyAndItemList ocrRst', ocrRst);
    }
    endTime = new Date().getTime();
    common.log('moneyAndItemList ocr耗时', endTime - startTime); //1725
}

/**
 * 实验函数：对比 paddle ocr 和 gmlkit ocr 速度
 * 结论 gmlkit ocr不可用
 */
function lab_compare_ocr_paddle_gmlkit(){
    var screen = images.read(MediaDir+'场景/有空槽位.jpg')
    var moneyImg4Paddle = images.clip(screen, MoneyPoint.x, MoneyPoint.y, Math.max(MoneyPoint.w, common.PaddleOcrMin.w), Math.max(MoneyPoint.h, common.PaddleOcrMin.h));
    var moneyImg = images.clip(screen, MoneyPoint.x, MoneyPoint.y, MoneyPoint.w, MoneyPoint.h);
    
    var startTime = new Date().getTime();
    for(var i=0;i<10;i++){
        var ocrRst = paddle.ocr(moneyImg4Paddle);
        common.log('paddle ocrRst', ocrRst);
    }
    var endTime = new Date().getTime();
    common.log('paddle ocr耗时', endTime-startTime); //
    
    startTime = new Date().getTime();
    for (var i = 0; i < 10; i++) {
        var ocrRst = gmlkit.ocr(moneyImg, 'en');
        common.log('gmlkit ocrRst', ocrRst);
    }
    endTime = new Date().getTime();
    common.log('gmlkit ocr耗时', endTime - startTime); //
}

/**
 * 实验函数：能否识别出是否已有指定装备及指定装备是否已冷却中
 */
function lab_check_exist_equip_and_is_colding_or_not(){
    var region = [Equip1Point.x, Equip1Point.y, Equip6Point.x+Equip6Point.w, Equip1Point.h];
    
    common.log('图：金身冷却中.jpg', '1金身冷却中、2复活甲')
    var screen = images.read(MediaDir+'场景/金身冷却中.jpg')

    var rst = images.findImage(screen, EquipMeta.wand.img, {threshold: 0.8, region: region});
    common.log('应无金身', rst)
    var rst = images.findImage(screen, EquipMeta.wand.imgColding, {threshold: 0.8, region: region});
    var isEquip1 = rst && rst.x > Equip1Point.x && rst.x < Equip1Point.x+Equip1Point.w;
    common.log('应有槽1金身冷却中', isEquip1, rst)
    
    var rst = images.findImage(screen, EquipMeta.armour.img, {threshold: 0.8, region: region});
    var isEquip2 = rst && rst.x > Equip2Point.x && rst.x < Equip2Point.x+Equip2Point.w;
    common.log('应有槽2复活甲', isEquip2, rst)
    
    var rst = images.findImage(screen, EquipMeta.hand.img, {threshold: 0.8, region: region});
    common.log('应无血手', rst)
    
    var rst = images.findImage(screen, EquipMeta.blade.img, {threshold: 0.8, region: region});
    common.log('应无名刀', rst)
    
    var rst = images.findImage(screen, EquipMeta.wing.img, {threshold: 0.8, region: region});
    common.log('应无救赎', rst)
    var rst = images.findImage(screen, EquipMeta.wing.imgColding, {threshold: 0.8, region: region});
    common.log('应无救赎冷却中', rst)
    
    var rst = images.findImage(screen, EquipMeta.fire.img, {threshold: 0.8, region: region});
    common.log('应无炽热', rst)
    
    common.log('图：有空槽位.jpg', '1名刀、3炽热、4复活甲、6救赎冷却中');
    screen = images.read(MediaDir+'场景/有空槽位.jpg')
    
    var rst = images.findImage(screen, EquipMeta.wand.img, {threshold: 0.8, region: region});
    common.log('应无金身', rst)
    var rst = images.findImage(screen, EquipMeta.wand.imgColding, {threshold: 0.8, region: region});
    common.log('应无金身冷却中', rst)
    
    var rst = images.findImage(screen, EquipMeta.armour.img, {threshold: 0.8, region: region});
    var isEquip4 = rst && rst.x > Equip4Point.x && rst.x < Equip4Point.x+Equip4Point.w;
    common.log('应有槽4复活甲', isEquip4, rst)
    
    var rst = images.findImage(screen, EquipMeta.hand.img, {threshold: 0.8, region: region});
    common.log('应无血手', rst)
    
    var rst = images.findImage(screen, EquipMeta.blade.img, {threshold: 0.8, region: region});
    var isEquip1 = rst && rst.x > Equip1Point.x && rst.x < Equip1Point.x+Equip1Point.w;
    common.log('应有槽1名刀', isEquip1, rst)
    
    var rst = images.findImage(screen, EquipMeta.wing.img, {threshold: 0.8, region: region});
    common.log('应无救赎', rst)
    var rst = images.findImage(screen, EquipMeta.wing.imgColding, {threshold: 0.8, region: region});
    var isEquip6 = rst && rst.x > Equip6Point.x && rst.x < Equip6Point.x+Equip6Point.w
    common.log('应有槽6救赎冷却中', isEquip6, rst)
    
    var rst = images.findImage(screen, EquipMeta.fire.img, {threshold: 0.8, region: region});
    var isEquip3 = rst && rst.x > Equip3Point.x && rst.x < Equip3Point.x+Equip3Point.w;
    common.log('应有槽3炽热', isEquip3, rst)
}