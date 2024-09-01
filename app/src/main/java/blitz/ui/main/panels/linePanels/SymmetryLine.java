package blitz.ui.main.panels.linePanels;

import java.awt.Component;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

import javax.swing.Box;
import javax.swing.JComboBox;
import javax.swing.JLabel;

import blitz.configs.Config;
import blitz.models.Active;
import blitz.models.ActiveListener;
import blitz.models.ControlPoint;
import blitz.models.Trajectory;
import blitz.models.calculations.Calculations;

public class SymmetryLine extends AbstractLinePanel implements ActiveListener {

    private JComboBox<String> symmetryComboBox;
    private final String[] SYMMETRY_TYPES = ControlPoint.ALL_INTERPOLATION_TYPES;

    public SymmetryLine() {
        super();

        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;

        JLabel symmetryLabel = new JLabel("Symmetry:");

        // Initialize the drop-down menu
        symmetryComboBox = new JComboBox<>(SYMMETRY_TYPES);
        Dimension dim = Config.LINE_PANEL_COMBO_BOX_DIMENSITONS;
        symmetryComboBox.setPreferredSize(dim);
        symmetryComboBox.setMaximumSize(dim);
        symmetryComboBox.setMinimumSize(dim);
        symmetryComboBox.addActionListener(e -> {
            if (isInteractable()) {
                String selectedSymmetry = (String) symmetryComboBox.getSelectedItem();
                if (selectedSymmetry != null) {
                    ControlPoint cp = Active.getActiveControlPoint();
                    cp.setSymmetryType(selectedSymmetry);
                    Active.notifyActiveControlPointStateEdited();
                }
            }
        });

        // Add components using GridBagLayout

        gbc.gridx = 0;
        gbc.gridy = 0;
        Component horizontalStrut = Box.createHorizontalStrut(58);
        add(horizontalStrut, gbc);

        gbc.gridx++;
        add(symmetryLabel, gbc);

        gbc.gridx++;
        add(symmetryComboBox, gbc);

        displayInteractability();

        Active.addActiveListener(this);
    }

    private void updateComboBox() {
        ControlPoint cp = Active.getActiveControlPoint();
        if (cp == null) return;
        ControlPoint.SYMMETRY symmetry = cp.getSymmetryType();
        switch (symmetry) {
            case BROKEN:
                symmetryComboBox.setSelectedItem(ControlPoint.BROKEN_SYMMETRY_KEY);
                break;
            case ALIGNED:
                symmetryComboBox.setSelectedItem(ControlPoint.ALIGNED_SYMMETRY_KEY);
                break;
            case MIRRORED:
                symmetryComboBox.setSelectedItem(ControlPoint.MIRRORED_SYMMETRY_KEY);
                break;
        }
    }

    @Override
    public boolean isInteractable() {
        ControlPoint cp = Active.getActiveControlPoint();
        Trajectory tr = Active.getActiveTrajectory();
        if (cp == null)          return false;
        if (tr.getSplineType().equals(Calculations.LINEAR_SPLINE))   return false;
        if (cp == tr.getFirst()) return false;
        if (cp == tr.getLast())  return false;
        return true;
    }

    @Override
    protected void displayInteractability() {
        super.displayInteractability();
        boolean isInteractable = isInteractable();
        symmetryComboBox.setEnabled(isInteractable);
    }

    @Override
    public void activeTrajectoryChanged(Trajectory tr) {
    }

    @Override
    public void activeControlPointChanged(ControlPoint cp) {
        displayInteractability();
        updateComboBox();
    }

    @Override
    public void activeControlPointStateEdited(ControlPoint cp) {
        updateComboBox();
    }

    @Override
    public void activeTrajectoryStateEdited(Trajectory tr) {
        displayInteractability();
        updateComboBox();
    }
}
