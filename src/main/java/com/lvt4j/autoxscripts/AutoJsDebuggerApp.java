package com.lvt4j.autoxscripts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

@EnableWebSocket
@SpringBootApplication
public class AutoJsDebuggerApp{

    private static ApplicationContext context;
    
    public static void main(String[] args){
        Window.init();
    }
    
    public static void startWebSocketServer(String serverHost, int serverPort, Runnable postStart){
        System.setProperty("server.address", serverHost);
        System.setProperty("server.port", serverPort+"");
        context = SpringApplication.run(AutoJsDebuggerApp.class);
        postStart.run();
    }

    public static void stopWebSocketServer(){
        if(context==null) return;
        SpringApplication.exit(context);
    }
    
}
