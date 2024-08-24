package blitz.ui.main.panels.linePanels;

import java.awt.event.FocusAdapter;
import java.awt.event.FocusEvent;

import javax.swing.BoxLayout;
import javax.swing.JPanel;
import javax.swing.JTextField;

import blitz.configs.MainFrameConfig;
import blitz.models.Active;
import blitz.services.Utils;

public abstract class LinePanel extends JPanel{

    public LinePanel(){
        setPreferredSize(MainFrameConfig.LINE_PANEL_DIMENSITONS);
        setMinimumSize(MainFrameConfig.LINE_PANEL_DIMENSITONS);
        setMaximumSize(MainFrameConfig.LINE_PANEL_DIMENSITONS);
        setLayout(new BoxLayout(this, BoxLayout.X_AXIS));
    }

    public abstract boolean isInteractable();

    protected  double parseDouble(String value, double defaultValue) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    protected  int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    protected void textFieldSetup(JTextField textField) {
        ValueGetter getter = (ValueGetter) textField.getClientProperty("ValueGetter");
        ValueSetter setter = (ValueSetter) textField.getClientProperty("ValueSetter");

        // ActionListener for Enter key press
        textField.addActionListener(e -> {
            if (Active.getActiveControlPoint() != null) {
                String oldValue = getter.getValue();
                String newValue = textField.getText();
                try {
                    setter.setValue(newValue);
                    textField.setText(getter.getValue());
                } catch (NumberFormatException ex) {
                    textField.setText(oldValue);
                }
            }
            Utils.requestFocusInWindowFor(textField);
        });

        // FocusAdapter for focus lost
        textField.addFocusListener(new FocusAdapter() {
            @Override
            public void focusLost(FocusEvent e) {
                if (Active.getActiveControlPoint() != null) {
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
            }
        });
    }

    protected void displayInteractability(){
        if(isInteractable()){
            setBackground(MainFrameConfig.ACTIVE_LAYER_PANEL_BACKGROUND_COLOR);
        } else {
            setBackground(MainFrameConfig.INACTIVE_LAYER_PANEL_BACKGROUND_COLOR);
        }
    }

    @FunctionalInterface
    protected interface ValueGetter {
        String getValue();
    }

    @FunctionalInterface
    protected interface ValueSetter {
        void setValue(String value);
    }
    
}
