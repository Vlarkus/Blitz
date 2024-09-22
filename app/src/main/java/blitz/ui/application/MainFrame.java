package blitz.ui.application;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Image;
import java.awt.Point;
import java.awt.Taskbar;
import java.awt.event.ActionEvent;
import java.awt.event.InputEvent;
import java.awt.event.KeyEvent;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import javax.imageio.ImageIO;
import javax.swing.AbstractAction;
import javax.swing.ActionMap;
import javax.swing.BoxLayout;
import javax.swing.InputMap;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JViewport;
import javax.swing.KeyStroke;
import javax.swing.text.JTextComponent;

import blitz.configs.Config;
import blitz.services.FieldImage;
import blitz.services.Utils;
import blitz.ui.application.menu.Export;
import blitz.ui.application.menu.Open;
import blitz.ui.application.menu.Save;
import blitz.ui.application.panels.canvasInteractionPanel.CanvasInteractionPanel;
import blitz.ui.application.panels.canvasPanel.CanvasPanel;
import blitz.ui.application.panels.infoPanel.InfoPanel;
import blitz.ui.application.panels.selectionPanel.SelectionPanel;
import blitz.ui.application.panels.toolPanel.ToolPanel;
import blitz.ui.application.panels.toolPanel.tools.Tool.Tools;

public class MainFrame extends JFrame {
    
    private JPanel mainPanel;
    private ToolPanel toolPanel;
    private CanvasPanel canvasPanel;
    private JPanel sidePanel;
    private JPanel centerPanel;
    private InfoPanel infoPanel;
    private SelectionPanel selectionPanel;
    private JScrollPane scrollPane;
    
    private JMenuBar menuBar;
    private ArrayList<FieldImage> fieldImages;

    // -=-=-=- CONSTRUCTOR -=-=-=-

    /**
     * Constructs JFrame and creates working Trajectory.
     */
    public MainFrame(){
        super(Config.FRAME_TITLE);
        constructMenuBar();
        constructFrame();
        setupKeyBindings();
        requestFocusInWindow();
        toFront();
    }

    // -=-=-=- METHODS -=-=-=-

    private void setupKeyBindings() {
        InputMap inputMap = this.getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        ActionMap actionMap = this.getRootPane().getActionMap();
    
        // Define a method to check if the focus is in a text field or similar component
        java.util.function.BooleanSupplier isFocusOnTextField = () -> {
            return getFocusOwner() instanceof JTextComponent;
        };
    
        // Key Bindings
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_V, 0), "moveTool");
        actionMap.put("moveTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.MOVE);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_A, 0), "addTool");
        actionMap.put("addTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.ADD);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_I, 0), "insertTool");
        actionMap.put("insertTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.INSERT);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_D, 0), "removeTool");
        actionMap.put("removeTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.REMOVE);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_C, 0), "cutTool");
        actionMap.put("cutTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.CUT);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_S, 0), "showRobotTool");
        actionMap.put("showRobotTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.SHOW_ROBOT);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_M, 0), "mergeTool");
        actionMap.put("mergeTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.MERGE);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_R, 0), "renderAllTool");
        actionMap.put("renderAllTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.RENDER_ALL);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_P, 0), "panTool");
        actionMap.put("panTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.PAN);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_T, 0), "editTimeTool");
        actionMap.put("editTimeTool", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    toolPanel.setActiveTool(Tools.EDIT_TIME);
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_EQUALS, 0), "zoomIn");
        actionMap.put("zoomIn", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    canvasPanel.zoomInMouse();
                }
            }
        });
    
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_MINUS, 0), "zoomOut");
        actionMap.put("zoomOut", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    canvasPanel.zoomOutMouse();
                }
            }
        });

        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_N, 0), "newTrajectory");
        actionMap.put("newTrajectory", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    selectionPanel.createEmptyTrajectory();
                }
            }
        });

        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_BACK_SPACE, InputEvent.SHIFT_DOWN_MASK), "deleteActive");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_BACK_SPACE, InputEvent.META_DOWN_MASK), "deleteActive");
        actionMap.put("deleteActive", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    selectionPanel.removeActiveElement();
                }
            }
        });

        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_E, InputEvent.SHIFT_DOWN_MASK), "Export");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_E, InputEvent.META_DOWN_MASK), "Export");
        actionMap.put("Export", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                if (!isFocusOnTextField.getAsBoolean()) {
                    Export.createExportDialogue();
                }
            }
        });


    }
    
    
    
    private void constructMenuBar() {
        menuBar = new JMenuBar();
        setJMenuBar(menuBar);



        // -=- File Menu -=-
        JMenu fileMenu = new JMenu("File");
        menuBar.add(fileMenu);

        // Open
        JMenuItem openMenuItem = new JMenuItem("Open");
        openMenuItem.addActionListener((ActionEvent e) -> { Open.open(); });
        fileMenu.add(openMenuItem);
        
        // Save As
        JMenuItem saveAsMenuItem = new JMenuItem("Save As");
        saveAsMenuItem.addActionListener((ActionEvent e) -> { Save.saveAs(); });
        fileMenu.add(saveAsMenuItem);

        // Export
        JMenuItem exportAsMenuItem = new JMenuItem("Export");
        exportAsMenuItem.addActionListener((ActionEvent e) -> {Export.createExportDialogue();});
        fileMenu.add(exportAsMenuItem);



        // -=- View Menu -=-
        JMenu viewMenu = new JMenu("View");
        menuBar.add(viewMenu);

        // Change Field Options
        JMenu changeFieldMenu = new JMenu("Change Field");
        viewMenu.add(changeFieldMenu);

        fillChangeFieldMenu(changeFieldMenu);

        // Import Field
        JMenuItem importFieldMenu = new JMenuItem("Import Field");
        viewMenu.add(importFieldMenu);

        // One-Time-Use Field
        JMenuItem OneTimeUseFieldMenu = new JMenuItem("One-Time-Use Field");
        viewMenu.add(OneTimeUseFieldMenu);



        // -=- Preferences Menu -=-
        JMenu preferencesMenu = new JMenu("Preferences");
        menuBar.add(preferencesMenu);

        // Units
        JMenuItem unitsMenuItem = new JMenuItem("Units");
        unitsMenuItem.addActionListener((ActionEvent e) -> {});
        preferencesMenu.add(unitsMenuItem);

        // Theme
        JMenuItem themeMenuItem = new JMenuItem("Theme");
        themeMenuItem.addActionListener((ActionEvent e) -> {});
        preferencesMenu.add(themeMenuItem);



        // -=- Preferences Menu -=-
        JMenu helpMenu = new JMenu("Help");
        menuBar.add(helpMenu);

        // Tutorials
        JMenuItem tutorialsMenu = new JMenuItem("Tutorials");
        tutorialsMenu.addActionListener((ActionEvent e) -> {});
        helpMenu.add(tutorialsMenu);

        // About
        JMenuItem aboutMenu = new JMenuItem("About");
        aboutMenu.addActionListener((ActionEvent e) -> {});
        helpMenu.add(aboutMenu);

    }

    private void fillChangeFieldMenu(JMenu changeFieldMenu) {
        fieldImages = Utils.searchForPngImages(Config.PATH_TO_FIELDS_DIRECTORY);

        for (FieldImage fieldImage : fieldImages) {
            JMenuItem matchFieldOption = new JMenuItem(fieldImage.getFieldName());
            matchFieldOption.addActionListener((ActionEvent e) -> {
                canvasPanel.setFieldImage(fieldImage.getPath());
            });
            changeFieldMenu.add(matchFieldOption);
        }
    }

    /**
     * Constructs JFrame and adds Panels onto it.
     */
    private void constructFrame() {
        // Constructing the Main Frame
        setTitle(Config.FRAME_TITLE);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(Config.DEFAULT_FRAME_DIMENSIONS);
        setMinimumSize(Config.MINIMUM_FRAME_DIMENSIONS);
        setResizable(true);
        setLocationRelativeTo(null);

        // Initializing Panels:
        mainPanel = new JPanel();
        mainPanel.setPreferredSize(new Dimension(Config.DEFAULT_FRAME_DIMENSIONS));
        mainPanel.setLayout(new BorderLayout());
        fillMainPanelWithContent();
        add(mainPanel);

        Image icon = null;
        try {
            icon = ImageIO.read(new File(Config.PATH_TO_APP_ICON));
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Set the icon for the application
        if (icon != null) {
            Taskbar.getTaskbar().setIconImage(icon);
            this.setIconImage(icon);
        }

        pack();
        setVisible(true);
    }

    private void fillMainPanelWithContent() {
        toolPanel = new ToolPanel();
        mainPanel.add(toolPanel, BorderLayout.WEST);

        canvasPanel = new CanvasPanel();
        scrollPane = new JScrollPane(canvasPanel);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_ALWAYS);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        canvasPanel.setScrollPane(scrollPane);
        JViewport viewport = scrollPane.getViewport();
        viewport.setViewPosition(new Point((int) (Config.CANVAS_PANEL_PREFERRED_DIMENSIONS.width / 3), (int) (Config.CANVAS_PANEL_PREFERRED_DIMENSIONS.height / 3)));

        centerPanel = new JPanel(new BorderLayout());
        centerPanel.add(scrollPane, BorderLayout.CENTER);
        CanvasInteractionPanel CanvasInteractionPanel = new CanvasInteractionPanel(canvasPanel);
        canvasPanel.setCanvasInteractionPanel(CanvasInteractionPanel);
        centerPanel.add(CanvasInteractionPanel, BorderLayout.SOUTH);
        mainPanel.add(centerPanel, BorderLayout.CENTER);

        sidePanel = new JPanel();
        sidePanel.setPreferredSize(Config.SIDE_PANEL_PREFERRED_DIMENSIONS);
        sidePanel.setLayout(new BoxLayout(sidePanel, BoxLayout.Y_AXIS));
        mainPanel.add(sidePanel, BorderLayout.EAST);

        infoPanel = new InfoPanel();
        sidePanel.add(infoPanel);

        selectionPanel = new SelectionPanel();
        sidePanel.add(selectionPanel);
    }
}
