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
public class FtpSyncHelper{

    private static final HostAndPort FtpServer = HostAndPort.fromParts("10.236.223.90", 3721);
    private static final String FtpUser = "anonymous";
    private static final String FtpPassword = "";
    private static final String FtpWorkPath = "/脚本";
    
    private static final String LocalWorkPath = "D:\\Workspace4Mine\\AutoxScripts";
    
    public static void main(String[] args) throws Exception{
        @Cleanup("disconnect") FTPClient ftpClient = new FTPClient();
        ftpClient.setControlEncoding("UTF-8");
        ftpClient.setCharset(Charset.forName("UTF-8"));
        ftpClient.connect(FtpServer.getHost(), FtpServer.getPort());
        ftpClient.login(FtpUser, FtpPassword);
        ftpClient.enterLocalPassiveMode();
        ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
        ftpClient.changeWorkingDirectory(FtpWorkPath);

        Path localFolder = Paths.get(LocalWorkPath);
        Map<WatchKey, Path> watchedKeys = new HashMap<>();
        WatchService watchService = java.nio.file.FileSystems.getDefault().newWatchService();
        Files.walk(localFolder).filter(Files::isDirectory).forEach(dir -> {
            try {
                WatchKey key = dir.register(watchService, StandardWatchEventKinds.ENTRY_CREATE,
                StandardWatchEventKinds.ENTRY_MODIFY, StandardWatchEventKinds.ENTRY_DELETE);
                watchedKeys.put(key, dir);
            } catch (IOException e) {
                throw new RuntimeException("注册监视目录["+dir+"]失败", e);
            }
        });
        
        System.out.println("开始同步["+LocalWorkPath+"] > ftp["+FtpWorkPath+"]");
        
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
                if(!"js".equalsIgnoreCase(ext)) continue;
                
                File file = new File(LocalWorkPath + "/" + pathStr);
                @Cleanup FileInputStream fis = new FileInputStream(file);
                boolean rst = ftpClient.storeFile(pathStr, fis);
                System.out.println("上传文件["+pathStr+"] : "+rst+" "+DateFormatUtils.format(file.lastModified(), "yyyy-MM-dd HH:mm:ss"));
            }
            key.reset();
        }
        
    }
    
}
