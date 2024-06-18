var img = images.read("/storage/emulated/0/Autox/AntForest/截屏/淘宝-农场-弹窗-今日施肥全返.jpg");

//二值化图片
var thresholdImg = images.threshold(img, 220, 255);

images.save(thresholdImg, "/storage/emulated/0/Autox/AntForest/截屏/淘宝-农场-弹窗-今日施肥全返-二值化.jpg", "jpg", 100);