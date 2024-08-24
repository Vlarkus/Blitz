package blitz.ui.main.panels.linePanels;

import java.awt.Component;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.text.DecimalFormat;

import javax.swing.Box;
import javax.swing.JLabel;
import javax.swing.JTextField;
import javax.swing.text.AbstractDocument;

import blitz.configs.MainFrameConfig;
import blitz.models.Active;
import blitz.models.ActiveListener;
import blitz.models.ControlPoint;
import blitz.models.Trajectory;
import blitz.services.DecimalFilter;

public class HelperEndLine extends LinePanel implements ActiveListener {

    private JTextField rEndTextField;
    private JTextField thetaEndTextField;
    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("0.####");

    public HelperEndLine() {
        super();

        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;

        JLabel xLabel = new JLabel("rE:");
        JLabel yLabel = new JLabel("θE:");

        rEndTextField = new JTextField(6);
        configureTextField(rEndTextField, new ValueGetter() {
            @Override
            public String getValue() {
                if (isInteractable()) {
                    return DECIMAL_FORMAT.format(Active.getActiveControlPoint().getREnd());
                }
                return "";
            }
        }, new ValueSetter() {
            @Override
            public void setValue(String value) {
                if (isInteractable()) {
                    double parsedValue = parseDouble(value, Active.getActiveControlPoint().getREnd());
                    Active.getActiveControlPoint().setREnd(parsedValue);
                    Active.notifyActiveControlPointStateEdited();
                }
            }
        });

        thetaEndTextField = new JTextField(6);
        configureTextField(thetaEndTextField, new ValueGetter() {
            @Override
            public String getValue() {
                if (isInteractable()) {
                    return DECIMAL_FORMAT.format(Active.getActiveControlPoint().getThetaEnd());
                }
                return "";
            }
        }, new ValueSetter() {
            @Override
            public void setValue(String value) {
                if (isInteractable()) {
                    double parsedValue = parseDouble(value, Active.getActiveControlPoint().getThetaEnd());
                    Active.getActiveControlPoint().setThetaEnd(parsedValue);
                    Active.notifyActiveControlPointStateEdited();
                }
            }
        });

        // Add components using GridBagLayout

        gbc.gridx = 0;
        gbc.gridy = 0;
        add(xLabel, gbc);

        gbc.gridx++;
        add(rEndTextField, gbc);

        gbc.gridx++;
        Component horizontalStrut = Box.createHorizontalStrut(20);
        add(horizontalStrut, gbc);

        gbc.gridx++;
        add(yLabel, gbc);

        gbc.gridx++;
        add(thetaEndTextField, gbc);

        displayInteractability();

        Active.addActiveListener(this);
    }

    private void configureTextField(JTextField textField, ValueGetter getter, ValueSetter setter) {
        AbstractDocument doc = (AbstractDocument) textField.getDocument();
        doc.setDocumentFilter(new DecimalFilter(MainFrameConfig.STANDART_TEXT_FIELD_DOUBLE_REGEX));

        textField.putClientProperty("ValueGetter", getter);
        textField.putClientProperty("ValueSetter", setter);
        textFieldSetup(textField);
    }

    private void updateTextField(){
        ValueGetter getter;
        getter = (ValueGetter) rEndTextField.getClientProperty("ValueGetter");
        rEndTextField.setText(getter.getValue());
        getter = (ValueGetter) thetaEndTextField.getClientProperty("ValueGetter");
        thetaEndTextField.setText(getter.getValue());
    }

    @Override
    public boolean isInteractable() {
        ControlPoint cp = Active.getActiveControlPoint();
        Trajectory tr = Active.getActiveTrajectory();
        if(cp == null)          return false;
        if(cp == tr.getFirst()) return false;
        if(tr.isTypeLinear())   return false;
        return true;
    }

    @Override
    protected void displayInteractability(){
        super.displayInteractability();
        boolean isInteractable = isInteractable();
        rEndTextField.setEnabled(isInteractable);
        thetaEndTextField.setEnabled(isInteractable);
    }

    @Override
    public void activeTrajectoryChanged(Trajectory tr) {
    }

    @Override
    public void activeControlPointChanged(ControlPoint cp) {
        displayInteractability();
        updateTextField();
    }

    @Override
    public void activeControlPointStateEdited(ControlPoint cp) {
        displayInteractability();
        updateTextField();
    }

    @Override
    public void activeTrajectoryStateEdited(Trajectory tr) {
    }
}
