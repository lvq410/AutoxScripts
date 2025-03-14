
/** 飞浆ocr识别时的最小宽高，低于这个宽高会导致内存泄漏，进而脚本崩溃 */
module.exports.PaddleOcrMin = {w:360, h:260}

var WsServer,WsOkHttpClient,WebSocket,WsListener = {
    onOpen: function (webSocket, response) {
        log("websocket 连接服务端成功");
        WebSocket = webSocket;
    },
    onMessage: function (webSocket, msg) { //msg为待执行脚本
        if(msg == 'heartbeat') return;
        log("websocket 收到消息", msg);
        threads.start(function(){
            try {
                var rst = eval(msg);
                log('脚本执行return', rst);
                if(WebSocket!=null) WebSocket.send('脚本执行return：'+JSON.stringify(rst));
            } catch (e) {
                log('脚本执行异常', e.message, e);
                if(WebSocket!=null) WebSocket.send('脚本执行异常' + e.message+' at '+e.stack);
            }
        });
    },
    onClosing: function (webSocket, code, reason) {
        log("websocket 关闭中", code, reason);
        WebSocket.close(1000, '主动关闭');
        WebSocket = null;
    },
    onClosed: function (webSocket, code, response) {
        WebSocket = null;
        log("websocket 关闭", code);
        setTimeout(websocket_init, 5000); //n秒后重连
    },
    onFailure: function (webSocket, t, response) {
        log("websocket 异常，5秒后重试连接", t);
        WebSocket = null;
        setTimeout(websocket_init, 5000); //n秒后重连
    }
};
function websocket_init(){
    log("websocket 开始连接服务端", WsServer);
    var request = new Request.Builder().url(WsServer).build();
    WsOkHttpClient.newWebSocket(request, new WebSocketListener(WsListener)); //创建链接
}

/**
 * 判断是否启动 与调试服务器的websocket连接
 */
var wsDebugConfFile = files.cwd() + '/debug_server_conf.json';
var DebugConf = {};
if(files.exists(wsDebugConfFile)){
    DebugConf = JSON.parse(files.read(wsDebugConfFile));
    if(DebugConf.enable) { //建立与调试服务器的websocket连接
        log("启动websocket调试服务："+DebugConf.server);
        
        importPackage(Packages["okhttp3"]); //导入包
        
        var engineId = engines.myEngine().getId();
        var scriptFileName = files.getName(engines.myEngine().getSource().toString());
        var id = engineId + '-' + scriptFileName;
        WsServer = DebugConf.server+'?id='+encodeURIComponent(id);
        
        if(!WsOkHttpClient){
            WsOkHttpClient = new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
            WsOkHttpClient.dispatcher().cancelAll();//清理一次
        }
        
        websocket_init();
        
        setInterval(()=>{
            websocket_sendAsync('heartbeat');
        }, 1000);
    }
}

function websocket_sendAsync(msg){
    if(WebSocket == null) return;
    threads.start(()=>{
        try{
            WebSocket.send(msg);
        }catch(e){
            log('websocket异步发送消息失败', msg.substr(0,200), e.message, e);
        }
    });
}

/**
 * 是否启用common模块里的日志输出
 */
var LogEnable = false;
module.exports.setLogEnable = function(enable) {
    LogEnable = enable;
}

/**
 * common脚本所用媒体资源的目录
 */
var MediaDir = files.cwd()+"/";
module.exports.setMediaDir = function(dir) {
    MediaDir = dir;
    if (MediaDir.charAt(MediaDir.length - 1) != '/') MediaDir += '/';
}

/**
 * 时长格式化
 */
var timeFormat = module.exports.timeFormat = function(time) {
    time = parseInt(time / 1000);
    var s = time % 60; s = s < 10 ? "0" + s : s; time = parseInt(time / 60);
    var m = time % 60; m = m < 10 ? "0" + m : m; time = parseInt(time / 60);
    return m + ":" + s;
};

/** 时间戳格式化为'yyyy-MM-dd HH:mm:ss'函数 */
var timestampFormat = module.exports.timestampFormat = function(time) {
    if (time == null) return;
    time = new Date(time);
    var year = time.getFullYear();
    var month = time.getMonth() + 1 < 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1;
    var date = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
    var hour = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    var minute = time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
    var second = time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
};

/**
 * 点击图片操作
 * @param imgNames
 * <pre>
 * 图片文件名，在MediaDir下找。
 * ●可以是单个字符串，如 'a.jpg'
 * ●也可以是多个字符串构成的数组，如 ['b.jpeg', 'c.png']
 * ●也可以是正则表达式，如 /^abc.*.jpg$/<br>
 * 代表多个值时时会依次查找，任意一个找到即算
 * </pre>
 * @param options
 * <pre>
 * 　{
 * 　　offset:{x:null,y:null},//点击位置相对于图片坐标的偏移。默认null表示图片正中心。{x:0,y:0}格式：x正数表示从最左向右偏移，负数表示从最右向左偏移；y同理
 * 　　gap:50,//等待图片出现/消失时的扫描间隔ms，默认50
 * 　　waitDisplayTimeout:0,//等待图片出现超时ms，默认0。0表示立刻进行图片扫描并点击
 * 　　doClick:true,//是否执行点击，默认true；false时直接返回点击位置，且不会再等待其消失
 * 　　clickDuration:100,//点击时长ms，默认100
 * 　　waitDisappearTimeout:0,//等待图片消失超时ms，默认0。0表示只点击一次立刻返回且不判断图片消失
 * 　　loopClickWhileWaitDisappear:true,//等待图片消失期间是否循环点击，默认true
 * 　　exitWhileTimeout:false,//执行超时时是否退出程序，默认false
 * 　　region:null,//找色区域。是一个两个或四个元素的数组。(region[0], region[1])表示找色区域的左上角；region[2]*region[3]表示找色区域的宽高。如果只有 region 只有两个元素，则找色区域为(region[0], region[1])到屏幕右下角。如果不指定 region 选项，则找色区域为整张图片。
 * 　　imgThreshold:null //是否对图片做二值化，0~255之间。默认null表示不做二值化。
 * 　　threshold:0.9 //相似度阈值，0~1之间。默认0.9
 * 　}
 * </pre>
 * @return 
 * <pre>
 * 图片未出现返回null。出现则返回
 * 　{
 * 　　imgName: 'a.jpg', //出现的图片文件名，当imgNames为数组或正则时，有助于识别出现的是哪张图片
 * 　　x: 123, //点击坐标
 * 　　y: 456 //点击坐标
 * 　　bounds:{ 图片坐标区域
 * 　　　left,top,right,bottom,width,height 
 * 　　}
 * 　　//,stillExists: true //等待图片消失超时时返回的对象中会多出该字段，表示超时时图片仍然存在
 * 　}
 * </pre>
 **/
var clickImg = module.exports.clickImg = function(imgNames, options) {
    options = options || {};

    var gap = options.gap || 50;
    var waitDisplayTimeout = options.waitDisplayTimeout || 0;
    var doClick = options.doClick == null ? true : options.doClick;
    var clickDuration = options.clickDuration || 100;
    var waitDisappearTimeout = options.waitDisappearTimeout || 0;
    var loopClickWhileWaitDisappear = options.loopClickWhileWaitDisappear==null?true:options.loopClickWhileWaitDisappear;
    var exitWhileTimeout = options.exitWhileTimeout || false;
    var region = options.region;
    var threshold = options.threshold || 0.9;
    var offset = options.offset || {};

    if(typeof imgNames == 'string') imgNames = [imgNames];
    if(imgNames instanceof RegExp) {
        var filtered = files.listDir(MediaDir , function(name){
            if(!imgNames.test(name)) return false;
            var isFile = files.isFile(files.join(MediaDir, name));
            if(!isFile) return false;
            var ext = (files.getExtension(name)||'').toLowerCase();
            var isImg = ext == 'jpg' || ext == 'jpeg' || ext == 'png';
            if(!isImg) return false;
            return true;
        });
        imgNames = filtered;
    }
    var imgMetas = imgNames.map(n=>{
        var img = images.read(MediaDir + n);
        if (!img){
            if(LogEnable) log('图片文件不存在', n);
            return null;
        }
        return {
            img: img,
            name: n
        };
    }).filter(i=>i);
    try {
        if (options.imgThreshold != null) {
            imgMetas.forEach(imgMeta => {
                var thresholdImg = images.threshold(imgMeta.img, options.imgThreshold, 255);
                imgMeta.img.recycle();
                imgMeta.img = thresholdImg;
            });
        }
        if (LogEnable) log('等待图片出现', imgNames);
        var imgMeta; var imgPoint; //找到的图片及其位置
        var waitBeginTime = new Date().getTime();
        var clickPoint; //点击位置
        while (true) {
            var screen = captureScreenx();
            if (options.imgThreshold != null) {
                screen = images.threshold(screen, options.imgThreshold, 255);
                CaptureScreenxs.push(screen);
            }
            for(var i=0;i<imgMetas.length; i++){
                imgMeta = imgMetas[i];
                imgPoint = images.findImage(screen, imgMeta.img, { region: region, threshold: threshold });
                if(imgPoint) break;
            }
            if (imgPoint) {
                if (LogEnable) log('图片出现', imgPoint);
                clickPoint = {
                    imgName: imgMeta.name,
                    bounds: {
                        left: imgPoint.x,
                        top: imgPoint.y,
                        width: imgMeta.img.getWidth(),
                        height: imgMeta.img.getHeight(),
                        right: imgPoint.x + imgMeta.img.getWidth(),
                        bottom: imgPoint.y + imgMeta.img.getHeight()
                    }
                }
                if (offset.x == null) {
                    clickPoint.x = imgPoint.x + imgMeta.img.getWidth() / 2;
                } else if (offset.x >= 0) {
                    clickPoint.x = imgPoint.x + offset.x;
                } else {
                    clickPoint.x = imgPoint.x + imgMeta.img.getWidth() + offset.x;
                }
                clickPoint.x = parseInt(clickPoint.x)
                if (offset.y == null) {
                    clickPoint.y = imgPoint.y + imgMeta.img.getHeight() / 2;
                } else if (offset.y >= 0) {
                    clickPoint.y = imgPoint.y + offset.y;
                } else {
                    clickPoint.y = imgPoint.y + imgMeta.img.getHeight() + offset.y;
                }
                clickPoint.y = parseInt(clickPoint.y)
                break;
            }
            if (waitDisplayTimeout == 0) break;
            if (LogEnable) log('未出现');
            if(new Date().getTime() - waitBeginTime >= waitDisplayTimeout) break;
            sleep(gap);
        }

        if (!clickPoint) {
            if (LogEnable) log('等待图片出现超时');
            if (exitWhileTimeout) return exit();
            return null;
        }

        if (LogEnable) log('点击图片位置', clickPoint)
        if (doClick) press(clickPoint.x, clickPoint.y, clickDuration);
        else return clickPoint;

        if (waitDisappearTimeout == 0) return clickPoint;

        if (LogEnable) log('等待图片消失'); var waitBeginTime = new Date().getTime();
        while (true) {
            var screen = captureScreenx();
            if (options.imgThreshold != null) {
                screen = images.threshold(screen, options.imgThreshold, 255);
                CaptureScreenxs.push(screen);
            }
            imgPoint = images.findImage(screen, imgMeta.img, { region: region, threshold: threshold });
            if (!imgPoint) {
                if (LogEnable) log('图片消失');
                return clickPoint;
            }
            if (LogEnable) log('未消失');
            if(new Date().getTime() - waitBeginTime >= waitDisappearTimeout) break;
            sleep(gap);
            if (loopClickWhileWaitDisappear) press(clickPoint.x, clickPoint.y, clickDuration);
        }

        if (LogEnable) log('等待图片消失超时');
        if (exitWhileTimeout) return exit();
        clickPoint.stillExists = true;
        return clickPoint;
    } finally {
        imgMetas.forEach(m=>m.img.recycle());
    }
}

var SaveCaptureScreenIdx = {};
/**
 * 屏幕截图方向
 * true 横屏截图; false 竖屏截图；null：由当前设备屏幕方向决定截图方向
 */
var CaptureScreenLandscape = null;
module.exports.setCaptureScreenLandscape = function(landscape) {
    CaptureScreenLandscape = landscape;
    if (!requestScreenCapture(landscape)) {
        toastLog('没有授予脚本屏幕截图权限');
        exit();
    }
}

/**
 * 截图优化函数创建的截图对象清单，记录在此用于回收
 */
var CaptureScreenxs = [];
/**
 * 截图优化<br>
 * 横屏截图时，如果截出来的图是竖屏图
 * 小米平板横屏截出来的图，缩放到了竖屏方向上。
 * 该函数自动判断是否是竖屏图，是的话按照此规律剪切并缩放成横屏模式
 **/
var captureScreenx = module.exports.captureScreenx = function() {
    if (CaptureScreenxs.length > 0) {
        for (var i = 0; i < CaptureScreenxs.length; i++) CaptureScreenxs[i].recycle();
        CaptureScreenxs = [];
    }
    var screen = captureScreen();
    var timestamp;
    if(DebugConf.enable) {
        timestamp = timestampFormat(new Date().getTime()).replace(/:/g, '-').replace(/ /g, '_');
        var idx = SaveCaptureScreenIdx[timestamp];
        if (idx == null) idx = SaveCaptureScreenIdx[timestamp] = 1;
        else idx = SaveCaptureScreenIdx[timestamp] = idx + 1;
        var captureScreenFileName = timestamp + '_' + idx + '.png';
        var img64 = images.toBase64(screen);
        websocket_sendAsync('_screen:'+captureScreenFileName+':'+img64);
        common.log('截图', captureScreenFileName);
    }
    if (CaptureScreenLandscape == null) return screen;
    if (!CaptureScreenLandscape) return screen;

    var shouldWidth = Math.max(device.width, device.height); //横屏截图时，应该的图片宽是设备最长的边
    if (screen.getWidth() == shouldWidth) return screen;
    var shouldHeight = Math.min(device.width, device.height);
    //错误的截图后，设备的长边被缩小到了短边上，设备的短边放在了长边居中的位置上
    //则被缩放的实际图片高度 为 (短边/长边)*短边
    var shrinkHeight = parseInt((shouldHeight / shouldWidth) * shouldHeight);
    var clipX = 0;
    var clipY = parseInt((shouldWidth - shrinkHeight) / 2);
    var clipW = shouldHeight;
    var clipH = shrinkHeight;

    var cliped = images.clip(screen, clipX, clipY, clipW, clipH);
    var resized = images.resize(cliped, [shouldWidth, shouldHeight])
    cliped.recycle()
    if (DebugConf.enable) {
        var idx = SaveCaptureScreenIdx[timestamp];
        var captureScreenFileName = timestamp + '_' + idx + '_调整.png';
        var img64 = images.toBase64(resized);
        websocket_sendAsync('_screen:'+captureScreenFileName+':'+img64);
        common.log('截图调整', captureScreenFileName);
    }
    //经过clip再resize的图片似乎有问题，提取像素，图片查找等函数会报错，将图片保存再读取一次可以避免这个问题
    images.save(resized, './临时.png', 'png');
    resized.recycle();
    screen = images.read('./临时.png');
    files.remove('./临时.png');
    CaptureScreenxs.push(screen);
    return screen;
}

/**
 * 为悬浮窗设置一个拖动控件，拖动控件时悬浮窗同时移动
 * @param window 悬浮窗对象
 * @param moveHandler 拖动控件对象
 * @param moveCallback 拖动回调函数，参数为悬浮窗的新位置{x,y}
 */
var floatyMoveHandler = module.exports.floatyMoveHandler = function(window, moveHandler, moveCallback) {
    var origX = 0, origY = 0; //记录按键被按下时的触摸坐标
    var windowX, windowY; //记录按键被按下时的悬浮窗位置
    moveHandler.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                origX = event.getRawX();
                origY = event.getRawY();
                windowX = window.getX();
                windowY = window.getY();
                return true;
            case event.ACTION_MOVE: //移动手指时调整悬浮窗位置
                var x = windowX + (event.getRawX() - origX);
                var y = windowY + (event.getRawY() - origY);
                window.setPosition(x, y);
                if (moveCallback) moveCallback(x, y, window);
                return true;
        }
        return true;
    });
}

var floatyResizeHandler = module.exports.floatyResizeHandler = function(window, resizeHandler, resizeCallback) {
    var origX = 0, origY = 0; //记录按键被按下时的触摸坐标
    var windowOrigWidth, windowOrigHeight; //记录按键被按下时的悬浮窗宽高
    var handlerWidth, handlerHeight; //记录按键被按下时的触摸控件宽高
    resizeHandler.setOnTouchListener(function(view, event) {
        switch (event.getAction()) {
            case event.ACTION_DOWN:
                origX = event.getRawX(); origY = event.getRawY();
                windowOrigWidth = window.getWidth(); windowOrigHeight = window.getHeight();
                //common.log('windowOrigWidth', windowOrigWidth, 'windowOrigHeight', windowOrigHeight);
                return true;
            case event.ACTION_MOVE: //移动手指时调整悬浮窗位置
                var widthDelta = event.getRawX() - origX;
                var heightDelta = event.getRawY() - origY;
                var width = windowOrigWidth + widthDelta; if(width<1) width=1;
                var height = windowOrigHeight + heightDelta; if(height<1) height=1;
                window.setSize(width, height);
                if (resizeCallback) resizeCallback(width, height, window);
                return true;
        }
        return true;
    });
}

/**
 * 为悬浮窗设置一个拖动控件，拖动控件时悬浮窗同时移动，同时设置一个关闭控件，点击关闭控件时退出脚本
 */
var floatyMoveCloseHandler = module.exports.floatyMoveCloseHandler = function(window, moveHandler, closeHandler) {
    floatyMoveHandler(window, moveHandler);
    closeHandler.click(exit);
}

/**
 * 尝试点击一个控件，如果控件不可点击则尝试点击其父控件，直到根控件
 * @return 是否点击成功
 */
var clickIfParent = module.exports.clickIfParent = function(widget) {
    while (widget != null) {
        if (widget.clickable()) return widget.click();
        widget = widget.parent();
    }
}

/**
 * 通过ocr点击文字操作
 * @param textPattern 
 * <pre>
 * 找寻文案：
 *  可以为正则
 *  也可以为字符串或字符串数组
 *  也可以为一个函数，为函数时，传入参数为一段ocrRst，需返回confidence
 * </pre>
 * @param options 
 * <pre>{
 *  screenOcrRsts: //用给定屏幕ocr结果进行识别。null时则重新截图识别
 *                 //如果指定了region参数，则给定的screenOcrRsts必须为对应region的
 *  textPreProcess: //用ocr结果中文本与textPattern对比之前，可选择对ocr结果中的文本进行处理。默认null为不处理
 *                  //如(str)=>str.replace(/[^\w\u4e00-\u9fa5]/g, '')，只保留中文和英文
 *                  //textPattern为函数时，此参数无效
 *  offset:{x:null,y:null}, //点击位置相对于文字坐标的偏移。默认null表示文字正中心。{x:0,y:0}格式：x正数表示从最左向右偏移，负数表示从最右向左偏移；y同理
 *  gap:50, //等待文字出现/消失时的扫描间隔ms，默认50
 *  waitDisplayTimeout:0, //等待文字出现超时ms，默认0。0表示立刻进行文字扫描并点击
 *                        //注意如果给定了screenOcrRsts参数时，不要设置此参数>0，否则未找到结果时，会白白等待
 *  doClick:true, //是否执行点击，默认true；false时直接返回点击位置，且不会再等待其消失
 *  clickDuration:100, //点击时长ms，默认100
 *  waitDisappearTimeout:0, //等待文字消失超时ms，默认0。0表示只点击一次立刻返回且不判断文字消失
 *                          //注意如果给定了screenOcrRsts参数时，不要设置此参数>0，否则未找到结果时，会白白等待
 *  loopClickWhileWaitDisappear:true, //等待文字消失期间是否循环点击，默认true
 *  exitWhileTimeout:false, //执行超时时是否退出程序，默认false
 *  region:null, //寻找区域。是一个两个或四个元素的数组。
 *               //(region[0], region[1])表示寻找区域的左上角，region[2]*region[3]表示寻找区域的宽高
 *               //如果只有 region 只有两个元素，则寻找区域为(region[0], region[1])到屏幕右下角
 *               //如果不指定 region 选项，则寻找区域为整个屏幕。
 *  threshold:0.9 //相似度阈值，0~1之间。
 *                //textPattern为正则时，用ocr结果中的confidence与此值比较，默认0.9
 *                //textPattern为字符串时，用编辑距离与此值比较，默认0.6
 *                //textPattern为函数时，用函数返回结果作为confidence与此值比较，默认0.9
 * }</pre>
 * @return 
 * <pre>
 * 文字未出现返回null。否则返回
 * {
 *  text: 实际文字,
 *  x: 点击坐标,
 *  y: 点击坐标,
 *  bounds:{ 实际文字坐标区域
 *   left,top,right,bottom,width,height 
 *  }
 *  //,stillExists: true //等待文字消失超时 时，返回的对象中会多出该字段，表示超时时文字仍然存在
 * }
 * </pre>
 **/
var clickOcr = module.exports.clickOcr = function(textPattern, options) {
    var mode;
    if(typeof textPattern == 'string'){
        mode = 'string';
        textPattern = [textPattern];
    }else if(Array.isArray(textPattern)) mode = 'string';
    else if(textPattern instanceof RegExp) mode = 'regexp';
    else if (typeof textPattern == 'function') mode = 'function';
    else throw 'textPattern参数类型错误';
    
    if(typeof textPattern == 'string') 
    
    options = options || {};
    var gap = options.gap || 50;
    var waitDisplayTimeout = options.waitDisplayTimeout || 0;
    var doClick = options.doClick == null ? true : options.doClick;
    var clickDuration = options.clickDuration || 100;
    var waitDisappearTimeout = options.waitDisappearTimeout || 0;
    var loopClickWhileWaitDisappear = options.loopClickWhileWaitDisappear==null?true:options.loopClickWhileWaitDisappear;
    var exitWhileTimeout = options.exitWhileTimeout || false;
    var region = options.region;
    var threshold = options.threshold; if(!threshold) threshold = mode=='string'?0.6:0.9;
    var offset = options.offset || {};
    
    //因为paddleOcr有最小图片识别的宽高要求，因此region有设置值时，需要检查并调整
    var origRegion; //原始区域参数
    var insideRegion; //将原始区域参数投影到截图区域后，相对于截图区域的参数
    if(region){
        origRegion = [region[0], region[1], region[2], region[3]];
        
        if(!region[2]) region[2] = device.width - region[0];
        if(region[2] < module.exports.PaddleOcrMin.w) region[2] = module.exports.PaddleOcrMin.w;
        if(region[0]+region[2] > device.width) region[0] = device.width - region[2];
        
        if(!region[3]) region[3] = device.height - region[1];
        if(region[3] < module.exports.PaddleOcrMin.h) region[3] = module.exports.PaddleOcrMin.h;
        if(region[1]+region[3] > device.height) region[1] = device.height - region[3];
        
        insideRegion = [origRegion[0]-region[0], origRegion[1]-region[1], origRegion[2], origRegion[3]];
    }

    function ocrFind(){
        var screen;
        var screenOcrRsts = options.screenOcrRsts;
        if(!screenOcrRsts){
            screen = captureScreenx();
            if(region){
                screen = images.clip(screen, region[0], region[1], region[2], region[3]);
                CaptureScreenxs.push(screen);
            }
            for(var oi=0;oi<3;oi++){ //坑爹的ocr有时识别结果为空，因此多试几次
                screenOcrRsts = paddle.ocr(screen, 4, false);
                if(screenOcrRsts.length) break;
            }
            if(LogEnable) common.log('ocr结果', screenOcrRsts);
        }

        if(DebugConf.enable && !options.screenOcrRsts){
            timestamp = timestampFormat(new Date().getTime()).replace(/:/g, '-').replace(/ /g, '_');
            var idx = SaveCaptureScreenIdx[timestamp];
            if (idx == null) idx = SaveCaptureScreenIdx[timestamp] = 1;
            else idx = SaveCaptureScreenIdx[timestamp] = idx + 1;
            var captureScreenFileName = timestamp + '_' + idx + '.png';
            var img64 = images.toBase64(screen);
            websocket_sendAsync('_screen:'+captureScreenFileName+':'+img64);
            var captureScreenOcrFileName = timestamp + '_' + idx + '.ocr';
            websocket_sendAsync('_ocr:'+captureScreenOcrFileName+':'+JSON.stringify(screenOcrRsts, null, 2));
            common.log('ocr截图', captureScreenFileName, 'ocr结果', captureScreenOcrFileName);
        }
        var matches = [];
        screenOcrRsts.forEach(ocrRst=>{
            var ocrText = options.textPreProcess?options.textPreProcess(ocrRst.text):ocrRst.text;
            var confidence = 0;
            switch(mode){
            case 'string':
                textPattern.forEach(text=>{
                    if(ocrText==text){
                        textMatch = true; confidence = 1;
                        return;
                    }
                    var _confidence = 1 - editDistance(ocrText, text) / text.length;
                    if(_confidence > confidence) confidence = _confidence;
                })
            break;
            case 'regexp':
                confidence = textPattern.test(ocrText) ? ocrRst.confidence : 0;
                break;
            case 'function':
                confidence = textPattern(ocrRst);
                break;
            }
            if(confidence < threshold) return;
            if(region){
                if(ocrRst.bounds.left < insideRegion[0]) return;
                if(ocrRst.bounds.top < insideRegion[1]) return;
                if(ocrRst.bounds.right > insideRegion[0]+insideRegion[2]) return;
                if(ocrRst.bounds.bottom > insideRegion[1]+insideRegion[3]) return;
            }
            matches.push({
                ocrRst: ocrRst,
                confidence: confidence
            });
        });
        matches.sort((a,b)=>a.confidence-b.confidence);
        var bestMatch = matches[0];
        if(!bestMatch) return;
        var rst = {
            x: bestMatch.ocrRst.bounds.left,
            y: bestMatch.ocrRst.bounds.top,
            width: bestMatch.ocrRst.bounds.right - bestMatch.ocrRst.bounds.left,
            height: bestMatch.ocrRst.bounds.bottom - bestMatch.ocrRst.bounds.top,
            text: bestMatch.ocrRst.text
        };
        if(region){
            rst.x += region[0];
            rst.y += region[1];
        }
        return rst;
    }

    var clickPoint;
    if (LogEnable) common.log('等待文字出现', textPattern);
    var textPoint; var waitBeginTime = new Date().getTime();
    while (true) {
        var textPoint = ocrFind(textPattern)
        if (textPoint) {
            if (LogEnable) common.log('文字出现', textPoint);
            clickPoint = {
                text: textPoint.text,
                bounds: {
                    left: textPoint.x,
                    top: textPoint.y,
                    width: textPoint.width,
                    height: textPoint.height,
                    right: textPoint.x + textPoint.width,
                    bottom: textPoint.y + textPoint.height
                }
            }
            if (offset.x == null) {
                clickPoint.x = textPoint.x + textPoint.width / 2;
            } else if (offset.x >= 0) {
                clickPoint.x = textPoint.x + offset.x;
            } else {
                clickPoint.x = textPoint.x + textPoint.width + offset.x;
            }
            clickPoint.x = parseInt(clickPoint.x)
            if (offset.y == null) {
                clickPoint.y = textPoint.y + textPoint.height / 2;
            } else if (offset.y >= 0) {
                clickPoint.y = textPoint.y + offset.y;
            } else {
                clickPoint.y = textPoint.y + textPoint.height + offset.y;
            }
            clickPoint.y = parseInt(clickPoint.y)
            break;
        }
        if (waitDisplayTimeout == 0) break;
        if (LogEnable) log('未出现')
        if(new Date().getTime() - waitBeginTime >= waitDisplayTimeout) break;
        sleep(gap);
    }

    if (!clickPoint) {
        if (LogEnable) log('等待文字出现超时');
        if (exitWhileTimeout) return exit();
        return null;
    }

    if (LogEnable) log('点击文字位置', clickPoint)
    if (doClick) press(clickPoint.x, clickPoint.y, clickDuration);
    else return clickPoint;
    
    if (waitDisappearTimeout == 0) return clickPoint;
    
    if (LogEnable) log('等待文字消失'); var waitBeginTime = new Date().getTime();
    while (true) {
        var textPoint = ocrFind(textPattern)
        if (!textPoint) {
            if (LogEnable) log('文字消失');
            return clickPoint;
        }
        if (LogEnable) log('未消失');
        if(new Date().getTime() - waitBeginTime >= waitDisappearTimeout) break;
        sleep(gap);
        if (loopClickWhileWaitDisappear) press(clickPoint.x, clickPoint.y, clickDuration);
    }
    
    if (LogEnable) log('等待文字消失超时');
    if (exitWhileTimeout) return exit();
    clickPoint.stillExists = true;
    return clickPoint;
}


var closeApp = module.exports.closeApp = function(packageName) {
    openAppSetting(packageName);
    var btn = textMatches(/^强行停止|强制停止$/).findOne(5000);
    if (btn) {
        if (clickIfParent(btn)) {
            btn = textMatches(/^确定|OK$/).findOne(5000);
            if (btn) {
                clickIfParent(btn);
            }
            sleep(2000)
        }
    }
}

var reopenApp = module.exports.reopenApp = function(packageName) {
    closeApp(packageName);
    launch(packageName);
    sleep(2000)
}

/**
 * 给定一个超出屏幕的点，滚动屏幕使其显示出来
 * @param point 超出屏幕的点
 * @param swipablePoint 滑动操作时允许按下的点，默认为屏幕中心
 */
var scrollToShow = module.exports.scrollToShow = function(point, swipablePoint) {
    if (!swipablePoint) swipablePoint = { x: device.width / 2, y: device.height / 2 };

    var newPoint = { x: point.x, y: point.y };

    while (newPoint.x < 0) {
        var dx = Math.min(device.width - swipablePoint.x, -newPoint.x);
        swipe(swipablePoint.x, swipablePoint.y, swipablePoint.x + dx, swipablePoint.y, 200);
    }
    while (newPoint.x > device.width) {
        var dx = Math.min(swipablePoint.x, newPoint.x - device.width);
        swipe(swipablePoint.x, swipablePoint.y, swipablePoint.x - dx, swipablePoint.y, 200);
    }
    while (newPoint.y < 0) {
        var dy = Math.min(device.height - swipablePoint.y, -newPoint.y);
        swipe(swipablePoint.x, swipablePoint.y, swipablePoint.x, swipablePoint.y + dy, 200);
    }
    while (newPoint.y > device.height) {
        var dy = Math.min(swipablePoint.y, newPoint.y - device.height);
        swipe(swipablePoint.x, swipablePoint.y, swipablePoint.x, swipablePoint.y - dy, 200);
    }
}

var isPointVisible = module.exports.isPointVisible = function(point) {
    return point.x >= 0 && point.x < device.width && point.y >= 0 && point.y < device.height;
}

/**
 * 启动一个提示点位的悬浮窗
 */
var debug_showPoint = module.exports.debug_showPoint = function(point) {
    var pointW = floaty.rawWindow(
        <vertical bg='#ff0000'></vertical>
    );
    pointW.setPosition(point.x - 5, point.y - 5)
    pointW.setTouchable(false)
    pointW.setSize(10, 10)
    setTimeout(function() { pointW.close() }, 1000);
}

var randomNumber = module.exports.randomNumber = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 打印日志，如果已经建立了websocket连接则发送日志到调试服务器
 */
module.exports.log = function() {
    var msg = '';
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg == 'object') arg = JSON.stringify(arg);
        if (i > 0) msg += ', ';
        msg += arg;
    }
    log(msg)
    websocket_sendAsync(msg);
};

/** 编辑距离计算 */
var editDistance = module.exports.editDistance = function(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp = [];

  for (let i = 0; i <= len1; i++) {
    dp[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[len1][len2];
}