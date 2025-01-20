package com.lvt4j.autoxscripts;

import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridLayout;
import java.awt.Toolkit;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.List;
import java.util.Map;

import javax.swing.BoxLayout;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JCheckBox;
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

import lombok.SneakyThrows;

public class Window{

    private static final Font font = new Font("YaHei Consolas Hybrid", Font.PLAIN, 16);
    
    private static final int MaxCommandHistoryNum = 10;
    
    private static JFrame main_frame;
    private static JPanel main_panel;
    
    private static JPanel ftp_sync_panel;
    private static JComboBox<String> mobileHost_comboBox;
    private static JComboBox<String> mobilePort_comboBox;
    private static JComboBox<String> mobileFolder_comboBox;
    private static JButton ftp_sync_btn_confirm;
    
    private static JPanel server_panel;
    private static JCheckBox server_enable_checkBox;
    private static JComboBox<String> serverHost_comboBox;
    private static JComboBox<String> serverPort_comboBox;
    private static JButton server_start_btn;
    private static JButton start_all_btn;
    
    private static JPanel console_parent_panel;
    private static JScrollPane server_console_panel;
    private static JTextArea server_console;
    
    private static JComboBox<String> mobiles_list;
    private static JComboBox<String> command_history_list;
    private static JButton command_send_btn;
    private static JTextArea command_input;
    private static JButton mobile_console_clear_btn;
    private static JTextArea mobile_console;
    
    private static Map<String, MobileData> mobileDatas = new java.util.concurrent.ConcurrentHashMap<>();
    
    public static void init(){
        main_frame = new JFrame("AutoXScripts");
        main_frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        main_frame.setSize(1200, 500);
        main_frame.addWindowListener(new WindowAdapter() {
            @SneakyThrows
            public void windowClosing(WindowEvent e) {
                String serverHost = (String)serverHost_comboBox.getSelectedItem();
                String serverPort = (String)serverPort_comboBox.getSelectedItem();
                Config.server(serverHost, serverPort, false);
                Thread.sleep(1000);
                AutoJsDebuggerApp.stopWebSocketServer();
            }
        });
        
        main_panel = new JPanel();
        main_panel.setLayout(new BoxLayout(main_panel, BoxLayout.Y_AXIS));
        
        init_ftp_sync_panel();
        main_panel.add(ftp_sync_panel);
        
        init_server_panel();
        main_panel.add(server_panel);
        
        init_console();
        main_panel.add(console_parent_panel);
        
        main_frame.add(main_panel);
        
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize(); // 获取屏幕尺寸
        int x = (screenSize.width - main_frame.getWidth()) / 2; // 计算窗口位置使其居中
        int y = (screenSize.height - main_frame.getHeight()) / 2;
        main_frame.setLocation(x, y); // 设置窗口位置
        main_frame.setVisible(true);
    }
    
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
                    server_enable_checkBox.setEnabled(true);
                    start_all_btn.setEnabled(false);
                });
            }catch(Exception ig){
                console("启动FTP同步失败"); console(ig);
                JOptionPane.showMessageDialog(main_frame, "启动FTP同步失败", "错误", JOptionPane.ERROR_MESSAGE);
                ftp_sync_btn_confirm.setEnabled(true);
                return;
            }
        }).start();
    };

    private static void init_server_panel() {
        server_panel = new JPanel();
        server_panel.setLayout(new BoxLayout(server_panel, BoxLayout.X_AXIS));
        
        server_enable_checkBox = new JCheckBox("启用WebSocket调试"); server_enable_checkBox.setEnabled(false);
        server_enable_checkBox.addItemListener(on_server_enable_checkBox);
        server_panel.add(server_enable_checkBox);
        
        JLabel serverHost_label = new JLabel("  ws://");
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
        
        server_start_btn = new JButton("启动"); server_start_btn.setEnabled(false);
        server_start_btn.setMaximumSize(new Dimension(80, server_start_btn.getPreferredSize().height)); // 设置按钮的最大尺寸为固定宽度
        server_start_btn.addActionListener(on_server_start_btn_click);
        server_panel.add(server_start_btn);
        
        start_all_btn = new JButton("一键启动");
        start_all_btn.setMaximumSize(new Dimension(80, start_all_btn.getPreferredSize().height)); // 设置按钮的最大尺寸为固定宽度
        start_all_btn.addActionListener(e->{
            ftp_sync_btn_confirm.doClick();
            server_enable_checkBox.setSelected(true);
            server_start_btn.doClick();
            start_all_btn.setEnabled(false);
        });
        server_panel.add(start_all_btn);
    }
    
    private static ItemListener on_server_enable_checkBox = new ItemListener(){
        @Override
        public void itemStateChanged(ItemEvent e){
            String serverHost = (String)serverHost_comboBox.getSelectedItem();
            String serverPort = (String)serverPort_comboBox.getSelectedItem();
            if(e.getStateChange() == ItemEvent.SELECTED) {
                server_start_btn.setEnabled(true);
            }else if (e.getStateChange() == ItemEvent.DESELECTED) {
                server_start_btn.setEnabled(false);
                Config.server(serverHost, serverPort, false);
            }
        }
    };
    
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
                    Config.server(serverHost, serverPort, true);
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
    
    private static void init_console(){
        console_parent_panel = new JPanel();
        console_parent_panel.setLayout(new GridLayout(1, 2));
//        console_parent_panel.setLayout(new GridBagLayout());
        
        {//左侧服务器控制台部分
            JPanel server_console_box_panel = new JPanel();
            server_console_box_panel.setLayout(new BoxLayout(server_console_box_panel, BoxLayout.Y_AXIS));
            //顶部label
            JLabel server_console_label = new JLabel("服务器控制台");
            server_console_box_panel.add(server_console_label);
            //下部控制台
            server_console = new JTextArea(); server_console.setFont(font);
            server_console_panel = new JScrollPane(server_console);
            server_console.setEditable(false);
            server_console_box_panel.add(server_console_panel);
            
            GridBagConstraints gbc = new GridBagConstraints();
            gbc.fill = GridBagConstraints.BOTH;
            gbc.weightx = 1; gbc.weighty = 1;
            gbc.gridx = 0; gbc.gridy = 0;
            console_parent_panel.add(server_console_box_panel, gbc);
        }
        
        {//右侧手机端部分
            JPanel mobile_console_box_panel = new JPanel();
            mobile_console_box_panel.setLayout(new BoxLayout(mobile_console_box_panel, BoxLayout.Y_AXIS));
            {//第一排手机会话选择
                JPanel mobile_list_panel = new JPanel();
                mobile_list_panel.setLayout(new BoxLayout(mobile_list_panel, BoxLayout.X_AXIS));
                JLabel mobile_list_lable = new JLabel("当前手机会话");
                mobile_list_panel.setMaximumSize(new Dimension(Integer.MAX_VALUE, mobile_list_panel.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
                mobile_list_panel.add(mobile_list_lable);
                mobiles_list = new JComboBox<>(new String[]{});
                mobiles_list.setMaximumSize(new Dimension(Integer.MAX_VALUE, mobiles_list.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
                mobiles_list.addItemListener(on_mobiles_list_select);
                mobile_list_panel.add(mobiles_list);
                command_send_btn = new JButton("执行脚本"); command_send_btn.setEnabled(false);
                command_send_btn.setMaximumSize(new Dimension(80, 80)); // 设置按钮的最大尺寸为固定宽度
                command_send_btn.addActionListener(on_command_send_btn_click);
                mobile_list_panel.add(command_send_btn);
                mobile_console_box_panel.add(mobile_list_panel);
            }
            {//第二排历史命令选择
                JPanel command_history_panel = new JPanel();
                command_history_panel.setLayout(new BoxLayout(command_history_panel, BoxLayout.X_AXIS));
                JLabel command_history_label = new JLabel("历史命令");
                command_history_label.setMaximumSize(new Dimension(10, command_history_label.getPreferredSize().height)); // 设置标签的最大尺寸为固定宽度
                command_history_panel.add(command_history_label);
                command_history_list = new JComboBox<>(new String[]{});
                command_history_list.setMaximumSize(new Dimension(Integer.MAX_VALUE, command_history_list.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
                command_history_list.addItemListener(on_command_history_list_select);
                command_history_panel.add(command_history_list);
                mobile_console_box_panel.add(command_history_panel);
            }
            //命令输入和控制台均分剩余高度
            JPanel command_input_and_console_panel = new JPanel();
            command_input_and_console_panel.setLayout(new GridLayout(2, 1));
            {//命令输入区
                command_input = new JTextArea(); command_input.setFont(font); command_input.setEditable(false);
                JScrollPane command_input_scroll = new JScrollPane(command_input);
                command_input_and_console_panel.add(command_input_scroll);
            }
            {//手机控制台
                JPanel mobile_label_and_console_panel = new JPanel();
                mobile_label_and_console_panel.setLayout(new BoxLayout(mobile_label_and_console_panel, BoxLayout.Y_AXIS));
                //第一排label
                JPanel mobile_console_label_panel = new JPanel();
                mobile_console_label_panel.setLayout(new BoxLayout(mobile_console_label_panel, BoxLayout.X_AXIS));
                JLabel mobile_console_label = new JLabel("手机消息");
                mobile_console_label_panel.setMaximumSize(new Dimension(Integer.MAX_VALUE, mobile_console_label_panel.getPreferredSize().height)); // 设置文本输入框的最大尺寸为水平方向最大
                mobile_console_label_panel.add(mobile_console_label);
                mobile_console_clear_btn = new JButton("清空");
                mobile_console_clear_btn.setMaximumSize(new Dimension(80, mobile_console_clear_btn.getPreferredSize().height)); // 设置按钮的最大尺寸为固定宽度
                mobile_console_clear_btn.addActionListener(e->{
                    String id = (String)mobiles_list.getSelectedItem();
                    if(StringUtils.isBlank(id)) return;
                    mobileDatas.get(id).console.setLength(0);
                    mobile_console.setText("");
                });
                mobile_console_label_panel.add(mobile_console_clear_btn);
                mobile_label_and_console_panel.add(mobile_console_label_panel);
                //第二排控制台
                mobile_console = new JTextArea(); mobile_console.setFont(font);
                JScrollPane mobile_console_panel = new JScrollPane(mobile_console);
                mobile_console.setEditable(false);
                mobile_label_and_console_panel.add(mobile_console_panel);
                //label和控制台合一起 与 命令输入区 均分剩余高度
                command_input_and_console_panel.add(mobile_label_and_console_panel);
            }
            mobile_console_box_panel.add(command_input_and_console_panel);
            
            GridBagConstraints gbc = new GridBagConstraints();
            gbc.fill = GridBagConstraints.BOTH;
            gbc.weightx = 2; gbc.weighty = 1;
            gbc.gridx = 1; gbc.gridy = 0;
            console_parent_panel.add(mobile_console_box_panel, gbc);
        }
    }
    
    private static ItemListener on_mobiles_list_select = e->{
        String id = (String)mobiles_list.getSelectedItem();
        if(StringUtils.isNotBlank(id)) {
            mobile_console.setText(mobileDatas.get(id).console.toString());
            mobile_console.setCaretPosition(mobile_console.getText().length());
            
            command_input.setText("");
            
            DefaultComboBoxModel<String> model = (DefaultComboBoxModel<String>) command_history_list.getModel();
            model.removeAllElements();
            List<String> commandHistory = Config.commandHistories(scriptFileNameFromId(id));
            for(String command: commandHistory){
                model.addElement(command);
            }
            if(commandHistory.size() > 0)
                command_history_list.setSelectedItem(commandHistory.get(0));
            else
                command_history_list.setSelectedItem(null);
        }else{
            mobile_console.setText("");
            command_input.setText("");
            DefaultComboBoxModel<String> model = (DefaultComboBoxModel<String>) command_history_list.getModel();
            model.removeAllElements();
            command_history_list.setSelectedItem(null);
        }
    };
    private static ActionListener on_command_send_btn_click = e->{
        String id = (String)mobiles_list.getSelectedItem();
        if(StringUtils.isBlank(id)) return;
        String command = command_input.getText();
        WebSocketer.send(id, command);
        
        String scriptFileName = scriptFileNameFromId(id);
        List<String> commandHistory = Config.commandHistories(scriptFileName);
        commandHistory.remove(command);
        commandHistory.add(0, command);
        if(commandHistory.size() > MaxCommandHistoryNum) commandHistory.remove(commandHistory.size()-1);
        Config.commandHistories(scriptFileName, commandHistory);
        
        DefaultComboBoxModel<String> model = (DefaultComboBoxModel<String>) command_history_list.getModel();
        model.removeElement(command);
        model.insertElementAt(command, 0);
        if(model.getSize() > MaxCommandHistoryNum) model.removeElementAt(model.getSize()-1);
        command_history_list.setSelectedItem(command);
    };
    private static String scriptFileNameFromId(String id){
        return id.split("-", 2)[1];
    }

    private static ItemListener on_command_history_list_select = e->{
        String command = (String)command_history_list.getSelectedItem();
        if(StringUtils.isNotBlank(command)) {
            command_input.setText(command);
        }
    };
    
    public static synchronized void enable_command(){
        command_send_btn.setEnabled(true);
        command_input.setEditable(true);
    }
    
    public static synchronized void disable_command(){
        command_send_btn.setEnabled(false);
        command_input.setEditable(false);
    }
    
    public static synchronized void console(String msg){
        if(server_console==null) return;
        server_console.append(DateFormatUtils.format(System.currentTimeMillis(), "HH:mm:ss.SSS"));
        server_console.append(" ");
        server_console.append(msg);
        server_console.append("\n");
        server_console.setCaretPosition(server_console.getText().length());
    }
    
    public static synchronized void console(Throwable e){
        if(server_console == null) return;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        e.printStackTrace(new PrintStream(baos));
        server_console.append(DateFormatUtils.format(System.currentTimeMillis(), "HH:mm:ss.SSS"));
        server_console.append(" ");
        server_console.append(baos.toString());
        server_console.append("\n");
        server_console.setCaretPosition(server_console.getText().length());
    }
    
    public static synchronized void mobileEstablished(String id){
        if(!mobileDatas.containsKey(id)) {
            mobileDatas.put(id, new MobileData());
        }
        
        DefaultComboBoxModel<String> model = (DefaultComboBoxModel<String>) mobiles_list.getModel();
        if(model.getIndexOf(id)<0) model.addElement(id);
    }
    
    public static synchronized void mobileConnectionClosed(String id){
        if(!mobileDatas.containsKey(id)) return;
        
        DefaultComboBoxModel<String> model = (DefaultComboBoxModel<String>) mobiles_list.getModel();
        model.removeElement(id);
    }
    
    public static synchronized void mobileConsole(String id, String msg){
        if(mobile_console == null) return;
        String logData = DateFormatUtils.format(System.currentTimeMillis(), "HH:mm:ss.SSS") + " " + msg + "\n";
        
        mobileDatas.get(id).console.append(logData);
        
        String currentId = (String)mobiles_list.getSelectedItem();
        if(id.equals(currentId)){
            mobile_console.append(logData);
            mobile_console.setCaretPosition(mobile_console.getText().length());
        }
    }
    
    private static class MobileData {
        StringBuilder console = new StringBuilder();
    }
}