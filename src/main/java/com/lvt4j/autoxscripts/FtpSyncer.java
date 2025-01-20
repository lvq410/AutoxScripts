package com.lvt4j.autoxscripts;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.function.Consumer;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.time.DateFormatUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;

import com.google.common.net.HostAndPort;

import lombok.Cleanup;

/**
 * 将本地文件改动实时同步到ftp服务器上
 *
 * @author chanceylee on 2024年6月3日
 */
public class FtpSyncer {

    private static final String FtpUser = "anonymous";
    private static final String FtpPassword = "";
    
    public static final CountDownLatch RunningLatch = new CountDownLatch(1);
    
    private static FTPClient ftpClient;
    private static WatchService watchService;
    private static String LocalWorkPath;
    private static Path localFolder;
    private static Map<WatchKey, Path> watchedKeys;
    
    public static void init(HostAndPort ftpServer, String ftpWorkPath, Runnable postStart, Consumer<Exception> postException) {
        new Thread(()->{
            try{
                init_ftp(ftpServer, ftpWorkPath);
            }catch(Exception e){
                if(postException!=null) postException.accept(e);
                return;
            }
            
            RunningLatch.countDown();
            System.out.println("开始同步["+LocalWorkPath+"] > ftp["+ftpWorkPath+"]");
            Window.console("开始同步["+LocalWorkPath+"] > ftp["+ftpWorkPath+"]");
            if(postStart!=null) postStart.run();
            
            try{
                watch();
            }catch(Exception e){
                Window.console("ftp同步异常："); Window.console(e);
            }
        }, "FtpSyncer").start();
    }
    
    private static void init_ftp(HostAndPort ftpServer, String ftpWorkPath) throws Exception {
        ftpClient = new FTPClient();
        ftpClient.setControlEncoding("UTF-8");
        ftpClient.setCharset(Charset.forName("UTF-8"));
        ftpClient.connect(ftpServer.getHost(), ftpServer.getPort());
        ftpClient.login(FtpUser, FtpPassword);
        ftpClient.enterLocalPassiveMode();
        ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
        ftpClient.changeWorkingDirectory(ftpWorkPath);
        
        watchService = java.nio.file.FileSystems.getDefault().newWatchService();
        LocalWorkPath = new File("").getAbsolutePath();
        localFolder = Paths.get(LocalWorkPath);
        watchedKeys = new HashMap<>();
        
        Files.walk(localFolder).filter(Files::isDirectory).forEach(dir -> {
            try {
                WatchKey key = dir.register(watchService, StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_MODIFY, StandardWatchEventKinds.ENTRY_DELETE);
                watchedKeys.put(key, dir);
            } catch (IOException e) {
                throw new RuntimeException("注册监视目录["+dir+"]失败", e);
            }
        });
    }
    
    private static void watch() throws Exception{
        while(true){
            WatchKey key = watchService.take();
            
            Path eventDir = watchedKeys.get(key);
            
            for(WatchEvent<?> event : key.pollEvents()) {
                WatchEvent.Kind<?> kind = event.kind();
                if(kind == StandardWatchEventKinds.OVERFLOW) continue;
                
                @SuppressWarnings("unchecked")
                Path path = eventDir.resolve((((WatchEvent<Path>) event)).context());
                path = localFolder.relativize(path);
                String pathStr = FilenameUtils.normalize(path.toString(), true);
                String ext = FilenameUtils.getExtension(pathStr);
                if(!"js".equalsIgnoreCase(ext) && !"json".equalsIgnoreCase(ext)) continue;
                
                File file = new File(LocalWorkPath + "/" + pathStr);
                @Cleanup FileInputStream fis = new FileInputStream(file);
                boolean rst = ftpClient.storeFile(pathStr, fis);
                System.out.println("上传文件["+pathStr+"] : 结果："+rst+" 修改时间："+DateFormatUtils.format(file.lastModified(), "HH:mm:ss"));
                Window.console("上传文件["+pathStr+"] : 结果："+rst+" 修改时间："+DateFormatUtils.format(file.lastModified(), "HH:mm:ss"));
            }
            key.reset();
        }
    }
    
}
