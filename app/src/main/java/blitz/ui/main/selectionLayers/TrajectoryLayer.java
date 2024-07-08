package blitz.ui.main.selectionLayers;

import java.awt.Component;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.FocusAdapter;
import java.awt.event.FocusEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;

import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

import blitz.configs.MainFrameConfig;
import blitz.models.Active;
import blitz.models.TrajectoriesList;
import blitz.models.Trajectory;

public class TrajectoryLayer extends JPanel {

    private Trajectory relatedTrajectory;
    private GridBagConstraints panelGBC;

    private JPanel controlPointsPanel; // Stores ControlPointLayers
    private ArrayList<ControlPointLayer> controlPointLayers;
    private GridBagConstraints cpGBC;

    private JPanel trajectoryPanelElements;
    private JButton activeButton; // Set/show active trajectory
    private JButton visibilityButton; // Set visible on/off
    private JButton lockButton; // Lock all ControlPoints
    private JButton moveUpButton; // Bring trajectory up
    private JButton moveDownButton; // Bring trajectory down
    private JButton collapseButton; // Hide/show all ControlPoints
    private JLabel indexLabel; // Display trajectory's index in the trajectoriesList
    private JLabel nameLabel; // Display name
    private JTextField nameTextField; // Edit name
    private GridBagConstraints trLayerGBC;

    private boolean isCollapsed;

    private final int INSETS_DEFAULT = 4;

    public TrajectoryLayer(Trajectory tr) {
        setLayout(new GridBagLayout());
        panelGBC = new GridBagConstraints();
        trLayerGBC = new GridBagConstraints();
        cpGBC = new GridBagConstraints();
        relatedTrajectory = tr;

        constructTrajectoryPanelElements();
        constructControlPointsPanel();
    }

    private void constructTrajectoryPanelElements() {
        trajectoryPanelElements = new JPanel(new GridBagLayout());
        trajectoryPanelElements.setPreferredSize(MainFrameConfig.TRAJECTORY_LAYER_PREFERRED_DIMENSION);
        trajectoryPanelElements.setMinimumSize(MainFrameConfig.TRAJECTORY_LAYER_PREFERRED_DIMENSION);
        trajectoryPanelElements.setMaximumSize(MainFrameConfig.TRAJECTORY_LAYER_PREFERRED_DIMENSION);
        trajectoryPanelElements.setBackground(MainFrameConfig.TRAJECTORY_LAYER_BACKGROUND_COLOR);
        add(trajectoryPanelElements);

        panelGBC.anchor = GridBagConstraints.WEST;
        panelGBC.weightx = 1.0;

        // Active Button
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        panelGBC.gridx = 0;
        panelGBC.gridy = 0;
        activeButton = new JButton();
        configureLayerButton(activeButton, true);
        setLayerButtonImage(activeButton, relatedTrajectory == Active.getActiveTrajectory(), MainFrameConfig.PATH_TO_SELECTED_LAYER_SELECTION_ICON, MainFrameConfig.PATH_TO_UNSELECTED_LAYER_SELECTION_ICON);
        trajectoryPanelElements.add(activeButton, panelGBC);
    
        // Name Label
        panelGBC.gridx++;
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        nameLabel = new JLabel(relatedTrajectory.getName());
        nameLabel.setPreferredSize(MainFrameConfig.TRAJECTORY_LAYER_NAME_ELEMENT_PREFERRED_DIMENSION);
        nameLabel.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                switchToTextField();
            }
        });
        trajectoryPanelElements.add(nameLabel, panelGBC);
    
        // Name TextField
        nameTextField = new JTextField(relatedTrajectory.getName());
        nameTextField.setPreferredSize(MainFrameConfig.TRAJECTORY_LAYER_NAME_ELEMENT_PREFERRED_DIMENSION);
        nameTextField.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                switchToLabel();
                Component window = SwingUtilities.getWindowAncestor(nameTextField);
                if (window != null) {
                    window.requestFocusInWindow();
                }
            }
        });

        // FocusAdapter for focus lost
        nameTextField.addFocusListener(new FocusAdapter() {
            @Override
            public void focusLost(FocusEvent e) {
                switchToLabel();
                Component window = SwingUtilities.getWindowAncestor(nameTextField);
                if (window != null) {
                    window.requestFocusInWindow();
                }
            }
        });
        nameTextField.setVisible(false);
        trajectoryPanelElements.add(nameTextField, panelGBC);

        // Index
        panelGBC.gridx++;
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        panelGBC.insets = new Insets(5, 5, 5, 5);
        indexLabel = new JLabel("" + TrajectoriesList.getTrajectoryIndex(relatedTrajectory));
        trajectoryPanelElements.add(indexLabel, panelGBC);
    
        // Visibility Button
        panelGBC.gridx++;
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        visibilityButton = new JButton();
        configureLayerButton(visibilityButton, true);
        setLayerButtonImage(visibilityButton, relatedTrajectory.isVisible(),MainFrameConfig.PATH_TO_SHOWN_LAYER_SELECTION_ICON, MainFrameConfig.PATH_TO_HIDDEN_LAYER_SELECTION_ICON);
        trajectoryPanelElements.add(visibilityButton, panelGBC);
    
        // Lock Button
        panelGBC.gridx++;
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        lockButton = new JButton();
        configureLayerButton(lockButton, true);
        setLayerButtonImage(lockButton, relatedTrajectory.isLocked(), MainFrameConfig.PATH_TO_LOCKED_LAYER_SELECTION_ICON, MainFrameConfig.PATH_TO_UNLOCKED_LAYER_SELECTION_ICON);
        trajectoryPanelElements.add(lockButton, panelGBC);
    

        // Move Up & Down
        panelGBC.gridx++;
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        JPanel movePanel = new JPanel();
        movePanel.setLayout(new BoxLayout(movePanel, BoxLayout.Y_AXIS));
        movePanel.setOpaque(false);
        trajectoryPanelElements.add(movePanel);

        // Move Up
        moveUpButton = new JButton();
        configureLayerButton(moveUpButton, false);
        moveUpButton.setIcon(new ImageIcon(MainFrameConfig.PATH_TO_MOVE_UP_LAYER_SELECTION_ICON));
        movePanel.add(moveUpButton);
    
        // Move Down
        panelGBC.gridx++;
        moveDownButton = new JButton();
        configureLayerButton(moveDownButton, false);
        moveDownButton.setIcon(new ImageIcon(MainFrameConfig.PATH_TO_MOVE_DOWN_LAYER_SELECTION_ICON));
        movePanel.add(moveDownButton);
    
        // Collapse Button
        panelGBC.gridx++;
        panelGBC.insets = new Insets(INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT, INSETS_DEFAULT);
        collapseButton = new JButton();
        configureLayerButton(collapseButton, true);
        setLayerButtonImage(collapseButton, true, MainFrameConfig.PATH_TO_COLLAPSE_LAYERS_SELECTION_ICON, null);
        trajectoryPanelElements.add(collapseButton, panelGBC);
    
    }

    private void configureLayerButton(JButton b, boolean isRegular){
        if(isRegular){
            b.setPreferredSize(MainFrameConfig.TRAJECTORY_LAYER_REGULAR_BUTTON_PREFERRED_DIMENSION);
        } else {
            b.setPreferredSize(MainFrameConfig.TRAJECTORY_LAYER_HALF_SIZE_BUTTON_PREFERRED_DIMENSION);
        }
        b.setContentAreaFilled(false);
        b.setBorderPainted(false);
        b.setOpaque(false);
        b.setFocusPainted(false);
        b.setMaximumSize(b.getPreferredSize());
    }

    private void setLayerButtonImage(JButton b, Boolean condition, String path1, String path2){
        ImageIcon image;
        if(condition){
            image = new ImageIcon(path1);
        } else {
            image = new ImageIcon(path2);
        }
        b.setIcon(image);
    }
    
    private void constructControlPointsPanel() {
        
        // controlPointsPanel = new JPanel(new GridBagLayout());
        // controlPointsPanel.setBackground(Color.GREEN);
    
        // cpGBC = new GridBagConstraints();
        // cpGBC.gridx = 0;
        // cpGBC.gridy = 1;
        // cpGBC.weightx = 1.0;
        // cpGBC.fill = GridBagConstraints.HORIZONTAL;
        // add(controlPointsPanel, cpGBC);

    }    

    private void switchToTextField() {
        nameLabel.setVisible(false);
        nameTextField.setVisible(true);
        nameTextField.requestFocusInWindow();
        nameTextField.selectAll();
    }

    private void switchToLabel() {
        relatedTrajectory.setName(nameTextField.getText());
        nameLabel.setText(relatedTrajectory.getName());
        nameLabel.setVisible(true);
        nameTextField.setVisible(false);
    }

    public void setIndexLabel(int index) {
        indexLabel.setText("Index: " + index);
    }
}
