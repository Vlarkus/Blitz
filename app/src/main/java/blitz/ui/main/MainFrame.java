package blitz.ui.main;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.ArrayList;

import javax.swing.BoxLayout;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JViewport;

import blitz.configs.MainFrameConfig;
import blitz.models.ControlPoint;
import blitz.models.TrajectoriesList;
import blitz.models.Trajectory;
import blitz.servises.FieldImage;
import blitz.servises.Utils;
import blitz.ui.main.panels.CanvasPanel;
import blitz.ui.main.panels.InfoPanel;
import blitz.ui.main.panels.SelectionPanel;
import blitz.ui.main.panels.ToolPanel;
import blitz.ui.main.tools.Tool.Tools;

public class MainFrame extends JFrame implements KeyListener{
    
    private JPanel mainPanel;
    private ToolPanel toolPanel;
    private CanvasPanel canvasPanel;
    private JPanel sidePanel;
    private InfoPanel infoPanel;
    private SelectionPanel SelectionPanel;
    private JScrollPane scrollPane;
    
    private JMenuBar menuBar;
    private ArrayList<FieldImage> fieldImages;

    // -=-=-=- CONSTRUCTOR -=-=-=-

    /**
     * Contstructs JFrame and creates working Trajectory.
     */
    public MainFrame(){
        super(MainFrameConfig.FRAME_TITLE);
        constructMenuBar();
        constructFrame();
        requestFocusInWindow();
        toFront();
        addKeyListener(this);
        testing();// TODO: Delete this line.
    }


    private void testing(){
        Trajectory tr = new Trajectory("Trajectory 1");
        TrajectoriesList.addTrajectory(tr);

        tr.addControlPoint(new ControlPoint("CP1"));
        tr.addControlPoint(new ControlPoint("CP2", 6, 6));
        // tr.addControlPoint(new ControlPoint("CP3", -150, 100, 100, 45, 50, 90));
        // tr.addControlPoint(new ControlPoint("CP4", -200, -100, 90.0, -90));

        canvasPanel.setVisibleTrajectories(TrajectoriesList.getTrajectoriesList());
        // Active.setActiveControlPoint(tr.getControlPoint("CP3"));
    }


    
    // -=-=-=- METHODS -=-=-=-

    private void constructMenuBar(){
        
        menuBar = new JMenuBar();
        setJMenuBar(menuBar);

        // -=- File Menu -=-
        JMenu fileMenu = new JMenu("File");
        menuBar.add(fileMenu);

        // Open
        JMenuItem openMenuItem = new JMenuItem("Open");
        openMenuItem.addActionListener((ActionEvent e) -> {});
        fileMenu.add(openMenuItem);
        
        // Save As
        JMenuItem saveAsMenuItem = new JMenuItem("Save As");
        saveAsMenuItem.addActionListener((ActionEvent e) -> {});
        fileMenu.add(saveAsMenuItem);

        // Export
        JMenuItem exportAsMenuItem = new JMenuItem("Export");
        exportAsMenuItem.addActionListener((ActionEvent e) -> {});
        fileMenu.add(exportAsMenuItem);





        // -=- View Menu -=-
        JMenu viewMenu = new JMenu("View");
        menuBar.add(viewMenu);

        // Change Field Options
        JMenu changeFieldMenu = new JMenu("Change Field");
        viewMenu.add(changeFieldMenu);

        fillChangeFieldMenu(changeFieldMenu);
        
        // View Options
        JMenuItem viewSettingsMenu = new JMenuItem("View Options");
        viewMenu.add(viewSettingsMenu);
        viewSettingsMenu.addActionListener((ActionEvent e) -> {});

    }

    private void fillChangeFieldMenu(JMenu changeFieldMenu){

        fieldImages = Utils.searchForPngImages(MainFrameConfig.PATH_TO_FIELDS_DIRECTORY);

        for (FieldImage fieldImage : fieldImages) {
            JMenuItem matchFieldOption = new JMenuItem(fieldImage.getFieldName());
            matchFieldOption.addActionListener((ActionEvent e) -> {canvasPanel.setFieldImage(fieldImage);});
            changeFieldMenu.add(matchFieldOption);
        }

    }

    /**
     * Contstructs JFrame and adds Panels onto it.
     */
    private void constructFrame(){

        // Constructing the Main Frame
        setTitle(MainFrameConfig.FRAME_TITLE);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize( MainFrameConfig.DEFAULT_FRAME_DIMENSIONS);
        setMinimumSize(MainFrameConfig.MINIMUM_FRAME_DIMENSIONS);
        setResizable(true);
        setLocationRelativeTo(null);

        // Initializing Panels:
        mainPanel = new JPanel();
        mainPanel.setPreferredSize(new Dimension(MainFrameConfig.DEFAULT_FRAME_DIMENSIONS));
        mainPanel.setLayout(new BorderLayout());
        fillMainPanelwithContent();
        add(mainPanel);

        pack();
        setVisible(true);

    }

    private void fillMainPanelwithContent(){

        toolPanel = new ToolPanel();
        mainPanel.add(toolPanel, BorderLayout.WEST);

        canvasPanel = new CanvasPanel();
        scrollPane = new JScrollPane(canvasPanel);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_ALWAYS);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        canvasPanel.setScrollPane(scrollPane);
        JViewport viewport = scrollPane.getViewport();
        viewport.setViewPosition(new Point( (int)(MainFrameConfig.CANVAS_PANEL_PREFFERED_DIMENSION.width/3), (int)(MainFrameConfig.CANVAS_PANEL_PREFFERED_DIMENSION.height/3)));
        mainPanel.add(scrollPane, BorderLayout.CENTER);

        sidePanel = new JPanel();
        sidePanel.setPreferredSize(MainFrameConfig.SIDE_PANEL_PREFFERED_DIMENSIONS);
        sidePanel.setLayout(new BoxLayout(sidePanel, BoxLayout.Y_AXIS));
        mainPanel.add(sidePanel, BorderLayout.EAST);

        infoPanel = new InfoPanel();
        sidePanel.add(infoPanel);

        SelectionPanel selectionPanel = new SelectionPanel();
        sidePanel.add(selectionPanel);

    }
    
    @Override
    public void keyTyped(KeyEvent e) {

    }

    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();
        switch (code) {
            case KeyEvent.VK_V:
                toolPanel.setActiveTool(Tools.MOVE);
                break;

            case KeyEvent.VK_A:
                toolPanel.setActiveTool(Tools.ADD);
                break;

            case KeyEvent.VK_I:
                toolPanel.setActiveTool(Tools.INSERT);
                break;

            case KeyEvent.VK_D:
                toolPanel.setActiveTool(Tools.REMOVE);
                break;

            case KeyEvent.VK_C:
                toolPanel.setActiveTool(Tools.CUT);
                break;

            case KeyEvent.VK_S:
                toolPanel.setActiveTool(Tools.SHOW_ROBOT);
                break;

            case KeyEvent.VK_M:
                toolPanel.setActiveTool(Tools.MERGE);
                break;

            case KeyEvent.VK_R:
                toolPanel.setActiveTool(Tools.RENDER_ALL);
                break;

            case KeyEvent.VK_P:
                toolPanel.setActiveTool(Tools.PAN);
                break;

            case KeyEvent.VK_T:
                toolPanel.setActiveTool(Tools.EDIT_TIME);
                break;
        }
    }

    @Override
    public void keyReleased(KeyEvent e) {

    }

}
