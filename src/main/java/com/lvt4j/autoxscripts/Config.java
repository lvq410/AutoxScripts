package com.lvt4j.autoxscripts;

import java.io.File;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.SneakyThrows;

public class Config{

    private static final int MaxSaveOptionsNum = 3;
    
    private static final String[] Default_ftp_sync_mobileHostOptions = {"192.168.0.1"};
    private static final String[] Default_ftp_sync_mobilePortOptions = {"3721"};
    private static final String[] Default_ftp_sync_mobileFolderOptions = {"/脚本"};
    
    private static final String[] Default_serverPortOptions = {"8080"};
    
    private static final String ConfigFileName = "debugger.conf";

    /**
     * 手机端用的配置文件名
     */
    private static final String MobileConfigFileName = "debug_server_conf.json";
    
    public static ObjectMapper mapper = new ObjectMapper();
    
    private static Config instance;
    
    static {
        init();
    }
    
    @SneakyThrows
    private static void init(){
        File configFile = new File(ConfigFileName);
        if(!configFile.exists()) {
            instance = new Config();
            instance.ftp_sync_mobileHostOptions = Default_ftp_sync_mobileHostOptions;
            instance.ftp_sync_mobilePortOptions = Default_ftp_sync_mobilePortOptions;
            instance.ftp_sync_mobileFolderOptions = Default_ftp_sync_mobileFolderOptions;
            instance.serverPortOptions = Default_serverPortOptions;
            instance.commandHistories = new java.util.HashMap<>();
            mapper.writeValue(configFile, instance);
        }
        instance = mapper.readValue(configFile, Config.class);
    }
    
    public static String[] ftp_sync_mobileHostOptions(){
        return instance.ftp_sync_mobileHostOptions;
    }
    public static String[] ftp_sync_mobilePortOptions(){
        return instance.ftp_sync_mobilePortOptions;
    }
    public static String[] ftp_sync_mobileFolderOptions(){
        return instance.ftp_sync_mobileFolderOptions;
    }
    
    @SneakyThrows
    public static void ftp_sync_mobile(String mobileHost, String mobilePort, String mobileFolder){
        // 保存选项，最多保存MaxSaveOptionsNum个选项，最近选项在最前
        List<String> mobileHostOptions = new ArrayList<>(Arrays.asList(instance.ftp_sync_mobileHostOptions));
        mobileHostOptions.remove(mobileHost);
        mobileHostOptions.add(0, mobileHost);
        if(mobileHostOptions.size()>MaxSaveOptionsNum) mobileHostOptions.remove(mobileHostOptions.size()-1);
        instance.ftp_sync_mobileHostOptions = mobileHostOptions.toArray(new String[mobileHostOptions.size()]);
        
        List<String> mobilePortOptions = new ArrayList<>(Arrays.asList(instance.ftp_sync_mobilePortOptions));
        mobilePortOptions.remove(mobilePort);
        mobilePortOptions.add(0, mobilePort);
        if(mobilePortOptions.size()>MaxSaveOptionsNum) mobilePortOptions.remove(mobilePortOptions.size()-1);
        instance.ftp_sync_mobilePortOptions = mobilePortOptions.toArray(new String[mobilePortOptions.size()]);
        
        List<String> mobileFolderOptions = new ArrayList<>(Arrays.asList(instance.ftp_sync_mobileFolderOptions));
        mobileFolderOptions.remove(mobileFolder);
        mobileFolderOptions.add(0, mobileFolder);
        if(mobileFolderOptions.size()>MaxSaveOptionsNum) mobileFolderOptions.remove(mobileFolderOptions.size()-1);
        instance.ftp_sync_mobileFolderOptions = mobileFolderOptions.toArray(new String[mobileFolderOptions.size()]);
        
        mapper.writeValue(new File(ConfigFileName), instance);
    }
    
    public static String[] serverHostOptions(){
        LinkedHashSet<String> hostOptions = new LinkedHashSet<>();
        if(instance.serverHostOptions!=null) hostOptions.addAll(Arrays.asList(instance.serverHostOptions));
        hostOptions.addAll(localIps());
        return instance.serverHostOptions = hostOptions.toArray(new String[hostOptions.size()]);
    }
    public static String[] serverPortOptions(){
        return instance.serverPortOptions;
    }
    
    @SneakyThrows
    public static void server(String serverHost, String serverPort, boolean enable){
        // 保存选项，最多保存MaxSaveOptionsNum个选项，最近选项在最前
        List<String> hostOptions = new ArrayList<>(Arrays.asList(instance.serverHostOptions));
        hostOptions.remove(serverHost);
        hostOptions.add(0, serverHost);
        if(hostOptions.size() > MaxSaveOptionsNum) hostOptions.remove(hostOptions.size() - 1);
        instance.serverHostOptions = hostOptions.toArray(new String[hostOptions.size()]);

        List<String> portOptions = new ArrayList<>(Arrays.asList(instance.serverPortOptions));
        portOptions.remove(serverPort);
        portOptions.add(0, serverPort);
        if(portOptions.size() > MaxSaveOptionsNum) portOptions.remove(portOptions.size() - 1);
        instance.serverPortOptions = portOptions.toArray(new String[portOptions.size()]);

        mapper.writeValue(new File(ConfigFileName), instance);
        
        ObjectNode mobileConf = mapper.createObjectNode();
        mobileConf.put("enable", enable);
        mobileConf.put("server", "ws://"+serverHost+":"+serverPort);
        mapper.writeValue(new File(MobileConfigFileName), mobileConf);
    }
    
    public static List<String> commandHistories(String scriptFileName){
        if(instance.commandHistories==null) instance.commandHistories = new java.util.HashMap<>();
        return instance.commandHistories.getOrDefault(scriptFileName, new LinkedList<>());
    }
    
    @SneakyThrows
    public static void commandHistories(String scriptFileName, List<String> commandHistories){
        if(instance.commandHistories==null) instance.commandHistories = new java.util.HashMap<>();
        instance.commandHistories.put(scriptFileName, commandHistories);
        mapper.writeValue(new File(ConfigFileName), instance);
    }
    
    public String[] ftp_sync_mobileHostOptions;
    public String[] ftp_sync_mobilePortOptions;
    public String[] ftp_sync_mobileFolderOptions;
    
    public String[] serverHostOptions;
    public String[] serverPortOptions;
    
    public Map<String, List<String>> commandHistories;
    
    @SneakyThrows
    private static List<String> localIps() {
        List<String> ips = new LinkedList<String>();
        Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
        while (interfaces.hasMoreElements()) {
            NetworkInterface networkInterface = interfaces.nextElement();
            Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
            while (addresses.hasMoreElements()) {
                InetAddress address = addresses.nextElement();
                if (!address.isLoopbackAddress() && address instanceof Inet4Address) {
                    ips.add(address.getHostAddress());
                }
            }
        }
        return ips;
    }
}
