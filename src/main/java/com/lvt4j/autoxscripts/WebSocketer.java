package com.lvt4j.autoxscripts;
import java.net.URLDecoder;
import java.util.Map;
import java.util.Timer;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.SneakyThrows;

@Configuration
public class WebSocketer extends TextWebSocketHandler implements WebSocketConfigurer{

    private static final long HeartbeatTimeout = 3000;
    
    private static Map<String, SessionMeta> Sessions = new java.util.concurrent.ConcurrentHashMap<>();
    
    private Timer timer = new Timer();
    
    @PostConstruct
    private void init(){
        timer.scheduleAtFixedRate(new java.util.TimerTask(){
            public void run(){
                heartbeat();
            }
        }, 1000, 1000);
    }
    
    @PreDestroy
    private void destory(){
        timer.cancel();
    }
    
    private static void heartbeat(){
        Sessions.forEach((id,meta)->{
            send(id, "heartbeat");
            if(System.currentTimeMillis() - meta.lastHeartbeat > HeartbeatTimeout){
                try{
                    meta.session.close(new CloseStatus(CloseStatus.SESSION_NOT_RELIABLE.getCode(), "心跳超时"));
                }catch(Exception e){
                    e.printStackTrace();
                }
            }
        });
    }
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry){
        registry.addHandler(this, "/").setAllowedOrigins("*");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{
        String id = id(session);
        if(StringUtils.isBlank(id)) {
            Window.console("非法客户端连接请求");
            session.close();
            return;
        }
        SessionMeta meta = new SessionMeta();
        meta.session = session;
        meta.lastHeartbeat = System.currentTimeMillis();
        
        SessionMeta origMeta = Sessions.get(id);
        Sessions.put(id, meta);
        if(origMeta!=null) {
            //断开旧连接
            origMeta.session.close();
            Window.mobileConsole(id, "旧连接断开");
        }
        Window.mobileEstablished(id);
        Window.console("客户端连接成功：" + id);
        Window.mobileConsole(id, "客户端连接成功：" + id);
        
        Window.enable_command();
    }
    protected String parseIPFromReq(HttpHeaders headers, String remote) {
        String ip = headers.getFirst("X-Forwarded-For");
        if(StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) return ip.split(",")[0];
        ip = headers.getFirst("Proxy-Client-IP");
        if(StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) return ip;
        ip = headers.getFirst("WL-Proxy-Client-IP");
        if(StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) return ip;
        ip = headers.getFirst("X-Real-IP");
        if(StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) return ip;
        return remote;
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception{
        String id = id(session);
        if(id!=null) {
            Window.console("客户端断开连接：" + id + "，" + status);
            Window.mobileConsole(id, "客户端断开连接：" + status);
            Sessions.remove(id);
            Window.mobileConnectionClosed(id);
        }
        if(Sessions.isEmpty()) Window.disable_command();
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception{
        String id = id(session);
        if(StringUtils.isBlank(id)) return;
        if(message.getPayload().equals("heartbeat")) {
            SessionMeta meta = Sessions.get(id);
            if(meta!=null) meta.lastHeartbeat = System.currentTimeMillis();
            return;
        }
        Window.mobileConsole(id, message.getPayload());
    }
    
    @SneakyThrows
    private static String id(WebSocketSession session){
        String id = UriComponentsBuilder.fromUri(session.getUri()).build().getQueryParams().getFirst("id");
        if(StringUtils.isBlank(id)) return null;
        return URLDecoder.decode(id, "UTF-8");
    }
    
    public static void send(String id, String msg){
        SessionMeta meta = Sessions.get(id);
        if(meta==null) return;
        try{
            meta.session.sendMessage(new TextMessage(msg));
        }catch(Exception e){
            Window.console("发送消息失败：" + e.getMessage());
            Window.console(e);
        }
    }
    
    private static class SessionMeta {
        public WebSocketSession session;
        
        public long lastHeartbeat;
    }
    
}
