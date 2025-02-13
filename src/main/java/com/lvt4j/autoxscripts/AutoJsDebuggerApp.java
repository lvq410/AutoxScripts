package com.lvt4j.autoxscripts;

import java.util.concurrent.CountDownLatch;
import java.util.function.Consumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@EnableWebSocket
@SpringBootApplication
public class AutoJsDebuggerApp{

    public static final CountDownLatch RunningLatch = new CountDownLatch(1);
    
    private static ApplicationContext context;
    
    public static void main(String[] args){
        Window.init();
    }
    
    public static void startWebSocketServer(String serverHost, int serverPort, Runnable  postStart, Consumer<Exception> postException){
        System.setProperty("server.address", serverHost);
        System.setProperty("server.port", serverPort+"");
        new Thread(()->{
            try{
                context = SpringApplication.run(AutoJsDebuggerApp.class);
                RunningLatch.countDown();
                if(postStart!=null) postStart.run();
            }catch(Exception e){
                if(postException!=null) postException.accept(e);
            }
        }, "AutoJsDebuggerApp").start();
    }

    public static void stopWebSocketServer(){
        if(context==null) return;
        SpringApplication.exit(context);
    }
    
    @Bean
    public ServletServerContainerFactoryBean createServletServerContainerFactoryBean() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(32768);
        container.setMaxBinaryMessageBufferSize(32768);
        return container;
    }

    
}
