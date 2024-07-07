package blitz.ui.main.panels;

import java.awt.Component;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.FocusAdapter;
import java.awt.event.FocusEvent;
import java.text.DecimalFormat;
import java.util.ArrayList;

import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.text.AbstractDocument;

import blitz.configs.MainFrameConfig;
import blitz.models.Active;
import blitz.models.ActiveListener;
import blitz.models.ControlPoint;
import blitz.models.Trajectory;
import blitz.servises.DecimalFilter;

/**
 * A panel displaying information about an active control point, allowing for editing if the control point is active.
 */
public class InfoPanel extends JPanel implements ActiveListener{

    private ControlPoint activeControlPoint;
    private ArrayList<JTextField> textFields;

    /**
     * Constructs an InfoPanel with a default layout and appearance.
     */
    public InfoPanel() {
        setBackground(MainFrameConfig.INFO_PANEL_BACKGROUND_COLOR);
        setPreferredSize(MainFrameConfig.INFO_PANEL_PREFERRED_DIMENSIONS);
        setMinimumSize(getPreferredSize());
        setMaximumSize(getPreferredSize());
        setLayout(new GridBagLayout());

        textFields = new ArrayList<>();
        fillWithContent();

        Active.addActiveListener(this);
    }

    /**
     * Fills the panel with labels and text fields for displaying and editing control point details.
     */
    private void fillWithContent() {
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.anchor = GridBagConstraints.CENTER;
        gbc.insets = new Insets(5, 10, 5, 10);

        JLabel infoLabel = new JLabel("Info Menu", SwingConstants.CENTER);
        infoLabel.setFont(MainFrameConfig.INFO_PANEL_TITLE_LABEL_FONT);
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        add(infoLabel, gbc);

        gbc.gridwidth = 1;
        gbc.gridy++;

        // Left column fields
        gbc.gridx = 0;
        addField(gbc, "x:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getX());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getX());
                activeControlPoint.setX(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        addField(gbc, "r start:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getRStart());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getRStart());
                activeControlPoint.setRStart(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        addField(gbc, "r end:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getREnd());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getREnd());
                activeControlPoint.setREnd(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        addField(gbc, "num segments:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getNumSegments());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                int parsedValue = parseInt(value, activeControlPoint.getNumSegments());
                activeControlPoint.setNumSegments(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        // Right column fields
        gbc.gridx = 1;
        gbc.gridy = 1;

        addField(gbc, "y:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getY());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getY());
                activeControlPoint.setY(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        addField(gbc, "theta start:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getThetaStart());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getThetaStart());
                activeControlPoint.setThetaStart(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        addField(gbc, "theta end:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getThetaEnd());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getThetaEnd());
                activeControlPoint.setThetaEnd(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

        addField(gbc, "time:", () -> {
            if (activeControlPoint != null) {
                return String.valueOf(activeControlPoint.getTime());
            }
            return "";
        }, (value) -> {
            if (activeControlPoint != null) {
                double parsedValue = parseDouble(value, activeControlPoint.getTime());
                activeControlPoint.setTime(parsedValue);
                Active.notifyActiveControlPointStateEdited();
            }
        });

    }

    /**
     * Adds a label and a text field to the panel for editing a specific property of the control point.
     *
     * @param gbc       The GridBagConstraints specifying the position and size of the components.
     * @param labelText The label text describing the property being edited.
     * @param getter    A function that retrieves the current value of the property as a String.
     * @param setter    A function that sets the new value of the property based on the provided String value.
     */
    private void addField(GridBagConstraints gbc, String labelText, ValueGetter getter, ValueSetter setter) {
        JLabel label = new JLabel(labelText, SwingConstants.LEFT);
        label.setFont(MainFrameConfig.INFO_PANEL_NORMAL_LABEL_FONT);
        gbc.gridy++;
        gbc.insets = new Insets(10, 10, 1, 10);
        add(label, gbc);

        JTextField textField = new JTextField(5);
        textField.putClientProperty("ValueGetter", getter);
        textField.putClientProperty("ValueSetter", setter);

        AbstractDocument doc = (AbstractDocument) textField.getDocument();
        doc.setDocumentFilter(new DecimalFilter(MainFrameConfig.INFO_PANEL_TEXT_FIELD_REGEX));

        if (activeControlPoint != null) {
            textField.setText(getter.getValue());
        }


        // ActionListener for Enter key press
        textField.addActionListener(e -> {
            if (activeControlPoint != null) {
                String oldValue = getter.getValue();
                String newValue = textField.getText();
                try {
                    setter.setValue(newValue);
                    textField.setText(getter.getValue());
                } catch (NumberFormatException ex) {
                    textField.setText(oldValue);
                }
            }

            // Transfer focus back to the main window or another component
            Component window = SwingUtilities.getWindowAncestor(textField);
            if (window != null) {
                window.requestFocusInWindow();
            }
        });

        // FocusAdapter for focus lost
        textField.addFocusListener(new FocusAdapter() {
            @Override
            public void focusLost(FocusEvent e) {
                if (activeControlPoint != null) {
                    String oldValue = getter.getValue();
                    String newValue = textField.getText();
                    try {
                        setter.setValue(newValue);
                        textField.setText(getter.getValue());
                    } catch (NumberFormatException ex) {
                        textField.setText(oldValue);
                    }
                } else {
                    textField.setText(""); // Clear text field if activeControlPoint is null
                }

                // Transfer focus back to the main window or another component
                Component window = SwingUtilities.getWindowAncestor(textField);
                if (window != null) {
                    window.requestFocusInWindow();
                }
            }
        });


        gbc.gridy++;
        gbc.insets = new Insets(1, 10, 10, 10);
        textFields.add(textField);
        add(textField, gbc);
        gbc.insets = new Insets(10, 10, 10, 10);

    }

    /**
     * Parses a String value to a double, returning a default value if parsing fails.
     *
     * @param value        The String value to parse.
     * @param defaultValue The default value to return if parsing fails.
     * @return The parsed double value or the default value if parsing fails.
     */
    private double parseDouble(String value, double defaultValue) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    /**
     * Parses a String value to an integer, returning a default value if parsing fails.
     *
     * @param value        The String value to parse.
     * @param defaultValue The default value to return if parsing fails.
     * @return The parsed integer value or the default value if parsing fails.
     */
    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private void updateTextFields() {
        for (JTextField textField : textFields) {
            if (textField != null) {
                ValueGetter getter = (ValueGetter) textField.getClientProperty("ValueGetter");
                if (getter != null) {
                    String value = getter.getValue();
                    try {
                        double parsedValue = Double.parseDouble(value);
                        DecimalFormat decimalFormat = new DecimalFormat("###0.####"); // Adjust pattern as needed
                        String formattedValue = decimalFormat.format(parsedValue);
                        textField.setText(formattedValue);
                    } catch (NumberFormatException e) {
                        // Handle parsing error, if necessary
                        textField.setText(value); // fallback to original text
                    }
                }
            }
        }
    }
    
    

    /**
     * Functional interface for retrieving the current value of a property as a String.
     */
    @FunctionalInterface
    private interface ValueGetter {
        String getValue();
    }

    /**
     * Functional interface for setting the new value of a property based on a provided String value.
     */
    @FunctionalInterface
    private interface ValueSetter {
        void setValue(String value);
    }

    @Override
    public void activeTrajectoryChanged(Trajectory tr) {

    }

    @Override
    public void activeControlPointChanged(ControlPoint cp) {
        activeControlPoint = cp;
        updateTextFields();
    }

    @Override
    public void activeControlPointStateEdited(ControlPoint cp) {
        updateTextFields();
    }
}
