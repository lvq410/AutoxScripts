package com.lvt4j.autoxscripts;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Configuration
public class WebSocketer extends TextWebSocketHandler implements WebSocketConfigurer{

    private static WebSocketSession session;
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry){
        registry.addHandler(this, "/").setAllowedOrigins("*");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{
        if(WebSocketer.session!=null) {
            //断开旧连接
            WebSocketer.session.close();
            Window.mobileConsole("旧连接断开");
        }
        WebSocketer.session = session;
        String ip = parseIPFromReq(session.getHandshakeHeaders(), session.getRemoteAddress().getAddress().getHostAddress());
        Window.mobileConsole("客户端连接成功：" + ip);
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
        WebSocketer.session = null;
        Window.mobileConsole("客户端断开连接：" + status);
        Window.disable_command();
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception{
        Window.mobileConsole(message.getPayload());
    }
    
    public static void send(String msg){
        if(session==null) return;
        try{
            session.sendMessage(new TextMessage(msg));
        }catch(Exception e){
            Window.console("发送消息失败：" + e.getMessage());
            Window.console(e);
        }
    }
    
}
