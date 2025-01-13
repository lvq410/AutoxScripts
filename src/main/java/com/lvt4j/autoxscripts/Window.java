package com.lvt4j.autoxscripts;

import java.awt.Dimension;
import java.awt.Toolkit;
import java.awt.event.ActionListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateFormatUtils;

import com.google.common.net.HostAndPort;

public class Window{

    private static JFrame main_frame;
    private static JPanel main_panel;
    
    private static JPanel server_panel;
    private static JComboBox<String> serverHost_comboBox;
    private static JComboBox<String> serverPort_comboBox;
    private static JButton server_start_btn;
    
    private static JPanel ftp_sync_panel;
    private static JComboBox<String> mobileHost_comboBox;
    private static JComboBox<String> mobilePort_comboBox;
    private static JComboBox<String> mobileFolder_comboBox;
    private static JButton ftp_sync_btn_confirm;
    
    private static JPanel console_parent_panel;
    private static JPanel server_console_box_panel;
    private static JScrollPane server_console_panel;
    private static JTextArea server_console;
    private static JPanel mobile_console_box_panel;
    private static JScrollPane mobile_console_panel;
    private static JTextArea mobile_console;
    
    
    private static JPanel command_panel;
    private static JButton command_send_btn;
    private static JTextArea command_input;
    
    
    public static void init(){
        main_frame = new JFrame("AutoXScripts");
        main_frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        main_frame.setSize(1200, 500);
        main_frame.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent e) {
                AutoJsDebuggerApp.stopWebSocketServer();
            }
        });
        
        main_panel = new JPanel();
        main_panel.setLayout(new BoxLayout(main_panel, BoxLayout.Y_AXIS));
        
        init_server_panel();
        main_panel.add(server_panel);
        
        init_ftp_sync_panel();
        main_panel.add(ftp_sync_panel);
        
        init_command();
        main_panel.add(command_panel);
        
        init_console();
//        main_panel.add(server_console_panel);
        main_panel.add(console_parent_panel);
        
        main_frame.add(main_panel);
        
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize(); // 获取屏幕尺寸
        int x = (screenSize.width - main_frame.getWidth()) / 2; // 计算窗口位置使其居中
        int y = (screenSize.height - main_frame.getHeight()) / 2;
        main_frame.setLocation(x, y); // 设置窗口位置
        main_frame.setVisible(true);
    }
    
    private static void init_server_panel() {
        server_panel = new JPanel();
        server_panel.setLayout(new BoxLayout(server_panel, BoxLayout.X_AXIS));
        
        JLabel serverHost_label = new JLabel("Websocket服务器地址  ws://");
        server_panel.add(serverHost_label);
        serverHost_label.setMaximumSize(new Dimension(10, serverHost_label.getPreferredSize().height)); // 设置标签的最大尺寸为固定宽度
        server_panel.add(serverHost_label);
        
        serverHost_comboBox = new JComboBox<>(Config.serverHostOptions()); serverHost_comboBox.setEditable(true);
        serverHost_comboBox.setMaximumSize(new Dimension(Integer.MAX_VALUE, serverHost_comboBox.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
        server_panel.add(serverHost_comboBox);
        
        JLabel serverPort_label = new JLabel(":");
        server_panel.add(serverPort_label);
        serverPort_label.setMaximumSize(new Dimension(10, serverPort_label.getPreferredSize().height)); // 设置标签的最大尺寸为固定宽度
        server_panel.add(serverPort_label);
        
        serverPort_comboBox = new JComboBox<>(Config.serverPortOptions()); serverPort_comboBox.setEditable(true);
        serverPort_comboBox.setMaximumSize(new Dimension(50, serverPort_comboBox.getPreferredSize().height)); // 设置文本输入框的最大尺寸为固定宽度
        server_panel.add(serverPort_comboBox);
        
        server_start_btn = new JButton("启动");
        server_start_btn.setMaximumSize(new Dimension(80, server_start_btn.getPreferredSize().height)); // 设置按钮的最大尺寸为固定宽度
        server_start_btn.addActionListener(on_server_start_btn_click);
        server_panel.add(server_start_btn);
    }
    
    private static ActionListener on_server_start_btn_click = e->{
        String serverHost = (String)serverHost_comboBox.getSelectedItem();
        if(StringUtils.isBlank(serverHost)){
            JOptionPane.showMessageDialog(main_frame, "服务器地址为空", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        String serverPort = (String)serverPort_comboBox.getSelectedItem();
        if(StringUtils.isBlank(serverPort)){
            JOptionPane.showMessageDialog(main_frame, "服务器端口为空", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        if(!StringUtils.isNumeric(serverPort)){
            JOptionPane.showMessageDialog(main_frame, "服务器端口不是数字", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        try{
            HostAndPort.fromParts(serverHost,Integer.parseInt(serverPort));
        }catch(Exception ig){
            JOptionPane.showMessageDialog(main_frame, "服务器地址端口不合法", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }

        server_start_btn.setEnabled(false);

        console("开始启动WebSocket服务器...");
        new Thread(()->{
            try{
                AutoJsDebuggerApp.startWebSocketServer(serverHost, Integer.valueOf(serverPort), ()->{
                    console("WebSocket服务器启动成功");
                    Config.server(serverHost, serverPort);
                });
            }catch(Exception ig){
                console("WebSocket服务器启动失败");
                console(ig);
                JOptionPane.showMessageDialog(main_frame, "启动服务器失败", "错误", JOptionPane.ERROR_MESSAGE);
                server_start_btn.setEnabled(true);
                return;
            }
        }).start();
    };
    
    private static void init_ftp_sync_panel(){
        ftp_sync_panel = new JPanel();
        ftp_sync_panel.setLayout(new BoxLayout(ftp_sync_panel, BoxLayout.X_AXIS));
        
        JLabel ftp_sync_label = new JLabel("FTP同步代码到手机  ftp://");
        ftp_sync_panel.add(ftp_sync_label);
        ftp_sync_label.setMaximumSize(new Dimension(10, ftp_sync_label.getPreferredSize().height)); // 设置标签的最大尺寸为固定宽度
        ftp_sync_panel.add(ftp_sync_label);
        
        mobileHost_comboBox = new JComboBox<>(Config.ftp_sync_mobileHostOptions()); mobileHost_comboBox.setEditable(true);
        mobileHost_comboBox.setMaximumSize(new Dimension(Integer.MAX_VALUE, mobileHost_comboBox.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
        ftp_sync_panel.add(mobileHost_comboBox);
        
        JLabel ftp_sync_port_label = new JLabel(":");
        ftp_sync_panel.add(ftp_sync_port_label);
        ftp_sync_port_label.setMaximumSize(new Dimension(10, ftp_sync_port_label.getPreferredSize().height)); // 设置标签的最大尺寸为固定宽度
        ftp_sync_panel.add(ftp_sync_port_label);
        
        mobilePort_comboBox = new JComboBox<>(new String[]{"3721"}); mobilePort_comboBox.setEditable(true);
        mobilePort_comboBox.setMaximumSize(new Dimension(50, mobilePort_comboBox.getPreferredSize().height)); // 设置文本输入框的最大尺寸为固定宽度
        ftp_sync_panel.add(mobilePort_comboBox);
        
        JLabel ftp_sync_folder_label = new JLabel("手机路径");
        ftp_sync_panel.add(ftp_sync_folder_label);
        ftp_sync_folder_label.setMaximumSize(new Dimension(10, ftp_sync_folder_label.getPreferredSize().height)); // 设置标签的最大尺寸为固定宽度
        ftp_sync_panel.add(ftp_sync_folder_label);
        
        mobileFolder_comboBox = new JComboBox<>(Config.ftp_sync_mobileFolderOptions()); mobileFolder_comboBox.setEditable(true);
        mobileFolder_comboBox.setMaximumSize(new Dimension(Integer.MAX_VALUE, mobileFolder_comboBox.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
        ftp_sync_panel.add(mobileFolder_comboBox);
        
        ftp_sync_btn_confirm = new JButton("确定");
        ftp_sync_btn_confirm.setMaximumSize(new Dimension(80, ftp_sync_btn_confirm.getPreferredSize().height)); // 设置按钮的最大尺寸为固定宽度
        ftp_sync_btn_confirm.addActionListener(on_ftp_sync_btn_confirm_click);
        ftp_sync_panel.add(ftp_sync_btn_confirm);
    }
    private static ActionListener on_ftp_sync_btn_confirm_click = e->{
        String mobileHost = (String)mobileHost_comboBox.getSelectedItem();
        if(StringUtils.isBlank(mobileHost)) {
            JOptionPane.showMessageDialog(main_frame, "手机地址为空", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        String mobilePort = (String)mobilePort_comboBox.getSelectedItem();
        if(StringUtils.isBlank(mobilePort)){
            JOptionPane.showMessageDialog(main_frame, "手机端口为空", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        if(!StringUtils.isNumeric(mobilePort)){
            JOptionPane.showMessageDialog(main_frame, "手机端口不是数字", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        HostAndPort mobileHostPort = HostAndPort.fromParts(mobileHost, Integer.parseInt(mobilePort));
        
        String mobileFolder = (String)mobileFolder_comboBox.getSelectedItem();
        if(StringUtils.isBlank(mobileFolder)){
            JOptionPane.showMessageDialog(main_frame, "手机脚本路径为空", "错误", JOptionPane.ERROR_MESSAGE);
            return;
        }
        ftp_sync_btn_confirm.setEnabled(false);
        
        console("开始启动FTP同步...");
        new Thread(()->{
            try{
                FtpSyncer.init(mobileHostPort, mobileFolder, ()->{
                    Config.ftp_sync_mobile(mobileHost, mobilePort, mobileFolder);
                });
            }catch(Exception ig){
                console("启动FTP同步失败"); console(ig);
                JOptionPane.showMessageDialog(main_frame, "启动FTP同步失败", "错误", JOptionPane.ERROR_MESSAGE);
                ftp_sync_btn_confirm.setEnabled(true);
                return;
            }
        }).start();
    };
    
    private static void init_command() {
        command_panel = new JPanel();
        command_panel.setLayout(new BoxLayout(command_panel, BoxLayout.X_AXIS));
        
        command_send_btn = new JButton("执行脚本"); command_send_btn.setEnabled(false);
        command_send_btn.setMaximumSize(new Dimension(80, 80)); // 设置按钮的最大尺寸为固定宽度
        command_send_btn.addActionListener(on_command_send_btn_click);
        command_panel.add(command_send_btn);
        
        command_input = new JTextArea(); command_input.setEditable(false);
        JScrollPane command_input_scroll = new JScrollPane(command_input);
        command_panel.add(command_input_scroll);
    }
    
    private static ActionListener on_command_send_btn_click = e->{
        String command = command_input.getText();
        WebSocketer.send(command);
    };

    public static void enable_command(){
        command_send_btn.setEnabled(true);
        command_input.setEditable(true);
    }

    public static void disable_command(){
        command_send_btn.setEnabled(false);
        command_input.setEditable(false);
    }
    
    private static void init_console(){
        console_parent_panel = new JPanel();
        console_parent_panel.setLayout(new BoxLayout(console_parent_panel, BoxLayout.X_AXIS));
        
        server_console_box_panel = new JPanel();
        server_console_box_panel.setLayout(new BoxLayout(server_console_box_panel, BoxLayout.Y_AXIS));
        JLabel server_console_label = new JLabel("服务器控制台");
        server_console_box_panel.add(server_console_label);
        
        server_console = new JTextArea();
        server_console_panel = new JScrollPane(server_console);
        server_console.setEditable(false);
//        server_console.setLineWrap(true);
//        server_console.setWrapStyleWord(true);
        server_console_box_panel.add(server_console_panel);
        
        console_parent_panel.add(server_console_box_panel);
        
        mobile_console_box_panel = new JPanel();
        mobile_console_box_panel.setLayout(new BoxLayout(mobile_console_box_panel, BoxLayout.Y_AXIS));
        JLabel mobile_console_label = new JLabel("手机消息");
        mobile_console_box_panel.add(mobile_console_label);
        
        mobile_console = new JTextArea();
        mobile_console_panel = new JScrollPane(mobile_console);
        mobile_console.setEditable(false);
        mobile_console_box_panel.add(mobile_console_panel);
        
        console_parent_panel.add(mobile_console_box_panel);
    }
    
    public static void console(String msg){
        if(server_console==null) return;
        server_console.append(msg);
        server_console.append("\n");
        server_console.setCaretPosition(server_console.getText().length());
    }
    
    public static void console(Throwable e){
        if(server_console == null) return;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        e.printStackTrace(new PrintStream(baos));
        server_console.append(baos.toString());
        server_console.append("\n");
        server_console.setCaretPosition(server_console.getText().length());
    }
    
    public static void mobileConsole(String msg){
        if(mobile_console == null) return;
        mobile_console.append(DateFormatUtils.format(System.currentTimeMillis(), "yyyy-MM-dd HH:mm:ss.SSS"));
        mobile_console.append(" ");
        mobile_console.append(msg);
        mobile_console.append("\n");
        mobile_console.setCaretPosition(mobile_console.getText().length());
    }
}