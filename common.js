
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
                log('脚本执行异常', e);
                if(WebSocket!=null) WebSocket.send('脚本执行异常' + e);
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
if(files.exists(wsDebugConfFile)){
    var wsDebugConf = JSON.parse(files.read(wsDebugConfFile));
    if(wsDebugConf.enable) { //建立与调试服务器的websocket连接
        log("启动websocket调试服务："+wsDebugConf.server);
        
        importPackage(Packages["okhttp3"]); //导入包
        
        var engineId = engines.myEngine().getId();
        var scriptFileName = files.getName(engines.myEngine().getSource().toString());
        var id = engineId + '-' + scriptFileName;
        WsServer = wsDebugConf.server+'?id='+encodeURIComponent(id);
        
        if(!WsOkHttpClient){
            WsOkHttpClient = new OkHttpClient.Builder().retryOnConnectionFailure(true).build();
            WsOkHttpClient.dispatcher().cancelAll();//清理一次
        }
        
        websocket_init();
        
        setInterval(()=>{
            if(WebSocket==null) return;
            try{
                WebSocket.send('heartbeat');
            }catch(ig){}
        }, 1000);
    }
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
 * 点击图片
 * @param imgNames 图片文件名，在MediaDir下找。<pre>
 * ●可以是单个字符串，如 'a.jpg'
 * ●也可以是多个字符串构成的数组，如 ['b.jpeg', 'c.png']
 * ●也可以是正则表达式，如 /^abc.*.jpg$/<br>
 * 代表多个值时时会依次查找，任意一个找到即算
 * </pre>
 * @param options<pre>
 * 　{
 * 　　offset:{x:null,y:null},//点击位置相对于图片坐标的偏移。默认null表示图片正中心。{x:0,y:0}格式：x正数表示从最左向右便宜，负数表示从最右向左偏移；y同理
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
 * @return <pre>图片未出现返回null。出现则返回
 * 　{
 * 　　imgName: 'a.jpg', //出现的图片文件名，当imgNames为数组或正则时，有助于识别出现的是哪张图片
 * 　　x: 123, //点击坐标
 * 　　y: 456 //点击坐标
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
    var loopClickWhileWaitDisappear = options.loopClickWhileWaitDisappear || true;
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
        if (!img && LogEnable){
            log('图片文件不存在', n);
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

/**
 * 是否保存截图
 */
var SaveCaptureScreen = false;
module.exports.setSaveCaptureScreen = function(save) {
    SaveCaptureScreen = save;
    files.create(MediaDir + "截屏/");
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
    if (SaveCaptureScreen) {
        timestamp = timestampFormat(new Date().getTime()).replace(/:/g, '-').replace(/ /g, '_');
        var idx = SaveCaptureScreenIdx[timestamp];
        if (idx == null) idx = SaveCaptureScreenIdx[timestamp] = 1;
        else idx = SaveCaptureScreenIdx[timestamp] = idx + 1;
        images.save(screen, MediaDir + '截屏/' + timestamp + '_' + idx + '.png');
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
    if (SaveCaptureScreen) {
        var idx = SaveCaptureScreenIdx[timestamp];
        images.save(resized, MediaDir + '截屏/' + timestamp + '_' + idx + '_调整.png');
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
 * ocr文字点击
 * @param textPattern 文案正则
 * @param options<pre>
 * 　{
 * 　　offset:{x:null,y:null},//点击位置相对于文字坐标的偏移。默认null表示文字正中心。{x:0,y:0}格式：x正数表示从最左向右偏移，负数表示从最右向左偏移；y同理
 * 　　gap:50,//等待文字出现/消失时的扫描间隔ms，默认50
 * 　　waitDisplayTimeout:0,//等待文字出现超时ms，默认0。0表示立刻进行文字扫描并点击
 * 　　doClick:true,//是否执行点击，默认true；false时直接返回点击位置，且不会再等待其消失
 * 　　clickDuration:100,//点击时长ms，默认100
 * 　　waitDisappearTimeout:0,//等待文字消失超时ms，默认0。0表示只点击一次立刻返回且不判断文字消失
 * 　　loopClickWhileWaitDisappear:true,//等待文字消失期间是否循环点击，默认true
 * 　　exitWhileTimeout:false,//执行超时时是否退出程序，默认false
 * 　　region:null,//寻找区域。是一个两个或四个元素的数组。(region[0], region[1])表示寻找区域的左上角；region[2]*region[3]表示寻找区域的宽高。如果只有 region 只有两个元素，则寻找区域为(region[0], region[1])到屏幕右下角。如果不指定 region 选项，则寻找区域为整个屏幕。
 * 　　threshold:0.9 //相似度阈值，0~1之间。默认0.9
 * 　}
 * </pre>
 * @return 点击坐标{x,y,text}。文字未出现返回null。等待文字消失超时时返回的对象中会多一个字段stillExists=true表示超时时文字仍然存在
 **/
var clickOcr = module.exports.clickOcr = function(textPattern, options) {
    options = options || {};
    var gap = options.gap || 50;
    var waitDisplayTimeout = options.waitDisplayTimeout || 0;
    var doClick = options.doClick == null ? true : options.doClick;
    var clickDuration = options.clickDuration || 100;
    var waitDisappearTimeout = options.waitDisappearTimeout || 0;
    var loopClickWhileWaitDisappear = options.loopClickWhileWaitDisappear || true;
    var exitWhileTimeout = options.exitWhileTimeout || false;
    var region = options.region;
    var threshold = options.threshold || 0.9;
    var offset = options.offset || {};

    function ocrFind(textPattern){
        var screen = captureScreenx();
        var ocrRst = paddle.ocr(screen);

        if(SaveOcrRst){
            timestamp = timestampFormat(new Date().getTime()).replace(/:/g, '-').replace(/ /g, '_');
            var idx = SaveCaptureScreenIdx[timestamp];
            if (idx == null) idx = SaveCaptureScreenIdx[timestamp] = 1;
            else idx = SaveCaptureScreenIdx[timestamp] = idx + 1;
            images.save(screen, MediaDir + 'ocr/' + timestamp + '_' + idx + '.png');
            files.write(MediaDir + 'ocr/' + timestamp + '_' + idx + '.json', JSON.stringify(ocrRst, null, 2));
        }
        for(var i = 0; i < ocrRst.length; i++){
            var rst = ocrRst[i];
            if(!textPattern.test(rst.text)) continue;
            if(rst.confidence < threshold) continue;
            var bounds = rst.bounds;
            if(region){
                var regionLeft = region[0];
                var regionTop = region[1];
                var regionRight = region[2]?(region[0] + region[2]):device.width;
                var regionBottom = region[3]?(region[1] + region[3]):device.height;
                if(bounds.left < regionLeft || bounds.left > regionRight) continue;
                if(bounds.top < regionTop || bounds.top > regionBottom) continue;
                if(bounds.right < regionLeft || bounds.right > regionRight) continue;
                if(bounds.bottom < regionTop || bounds.bottom > regionBottom) continue;
            }
            return {
                x: bounds.left,
                y: bounds.top,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top,
                text: rst.text
            };
        }
    }

    var clickPoint;
    if (LogEnable) log('等待文字出现', textPattern);
    var textPoint; var waitBeginTime = new Date().getTime();
    while (true) {
        var textPoint = ocrFind(textPattern)
        if (textPoint) {
            if (LogEnable) log('文字出现', textPoint);
            clickPoint = {}
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
            clickPoint.text = textPoint.text;
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

/**
 * 是否保存ocr识别结果
 */
var SaveOcrRst = false;
module.exports.setSaveOcrRst = function(save) {
    SaveOcrRst = save;
    files.create(MediaDir + "ocr/");
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
    if(!WebSocket) return;
    try {
        WebSocket.send(msg);
    }catch(e){
        log('websocket发送消息异常', msg, e);
    }
};