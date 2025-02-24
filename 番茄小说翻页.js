auto.waitFor();
var common = require('./common.js')

common.setCaptureScreenLandscape();

var screen = common.captureScreenx();
var pix = screen.pixel(screen.getWidth()-1, screen.getHeight()/2);
var bg = colors.toString(pix);
var NextPattern  = /([0-9]+)秒后，继续阅读下一页/;

setInterval(function(){}, 1000);

var BlockRect={
    x:0,y:device.height*1/10,w:device.width,h:device.height*9/10
};
var BlockWindow;
var BlockWindowVisible = false;
var SleepTime = 100;

threads.start(function(){
    try{
        toast('番茄广告屏蔽开始')
        while(true){
            schedule();
            sleep(SleepTime)
            SleepTime = 100;
        }
    }catch(e){
        common.log('脚本异常'+e)
        toast('脚本异常')
    }
});

function schedule(){
    var adVideoFlag = className("com.dragon.read.component.biz.lynx.behaviour.NovelLynxVideoUI").findOnce()
        || classNameStartsWith('com.lynx').findOnce();
    var adVideoFlagVisiable = adVideoFlag && common.isPointVisible({x:adVideoFlag.bounds().centerX(), y:adVideoFlag.bounds().centerY()});
    if (adVideoFlagVisiable) {
        //BlockRect.x = adVideoFlag.bounds().left-5; BlockRect.y = adVideoFlag.bounds().top-5;
        //BlockRect.w = adVideoFlag.bounds().width()+10;
        common.log('发现广告视频', adVideoFlag.bounds())
        var nextFlag = textMatches(NextPattern).findOnce();
        var nextFlagVisiable = nextFlag && common.isPointVisible({x:nextFlag.bounds().centerX(), y:nextFlag.bounds().centerY()});
        if (nextFlagVisiable) {
            common.log('发现下一页按钮', nextFlag.bounds(), nextFlag.text());
            //BlockRect.h = nextFlag.bounds().bottom-adVideoFlag.bounds().top+10;
            var remainSeconds = 0;
            try{
                remainSeconds = parseInt(nextFlag.text().match(NextPattern)[1]);
            }catch(ig){}
            if(!BlockWindow){
                common.log('初始化广告视频遮蔽窗口')
                BlockWindow = floaty.rawWindow(
                    <frame id="frame" gravity="center">
                        <text id="text" textSize="20sp" textColor="#000000" text="广告" gravity="center"/>
                    </frame>
                );
                BlockWindow.setSize(BlockRect.w, BlockRect.h);
                BlockWindow.setPosition(BlockRect.x, BlockRect.y);
                BlockWindow.text.setWidth(BlockRect.w); BlockWindow.text.setHeight(BlockRect.h);
                BlockWindow.frame.attr('bg', bg);
            }
            var text = remainSeconds+'秒广告';
            if(BlockWindow.text.getText() != text){
                ui.run(() => {
                    BlockWindow.text.setText(text);
                })
            }
            if(!BlockWindowVisible){
                ui.run(()=>{
                    BlockWindow.frame.setVisibility(android.view.View.VISIBLE)
                    BlockWindow.setTouchable(true)
                    BlockWindowVisible = true;
                })
            }
        }else{
            common.log('只有视频广告，没有5s等待按钮时，关闭广告视频遮蔽窗口，直接翻下一页')
            if(BlockWindow && BlockWindowVisible) {
                ui.run(()=>{
                    BlockWindow.frame.setVisibility(android.view.View.GONE)
                    BlockWindow.setTouchable(false)
                    BlockWindowVisible = false;
                });
            }
            swipe(device.width*4/5, BlockRect.y-5, device.width*1/5, BlockRect.y-5, 10);
            SleepTime = 1000;
        }
    }else{
        if(BlockWindow && BlockWindowVisible) {
            //common.log('关闭广告视频遮蔽窗口')
            ui.run(()=>{
                BlockWindow.frame.setVisibility(android.view.View.GONE)
                BlockWindow.setTouchable(false)
                BlockWindowVisible = false;
            });
        }
    }
}
