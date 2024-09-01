package blitz.ui.main.panels;

import java.util.ArrayList;

import javax.swing.BoxLayout;
import javax.swing.JPanel;

import blitz.configs.Config;
import blitz.ui.main.panels.linePanels.AbstractLinePanel;
import blitz.ui.main.panels.linePanels.DistanceLine;
import blitz.ui.main.panels.linePanels.HelperEndLine;
import blitz.ui.main.panels.linePanels.HelperStartLine;
import blitz.ui.main.panels.linePanels.InterpolationTypeLine;
import blitz.ui.main.panels.linePanels.NumSegmentsLine;
import blitz.ui.main.panels.linePanels.PositionLine;
import blitz.ui.main.panels.linePanels.SplineTypeLine;
import blitz.ui.main.panels.linePanels.SymmetryLine;

public class InfoPanel extends JPanel{

    private ArrayList<AbstractLinePanel> lines;

    public InfoPanel(){
        setBackground(Config.INFO_PANEL_BACKGROUND_COLOR);
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));

        lines = new ArrayList<>();
        fillLines();
    }

    private void fillLines(){
        lines.add(new PositionLine());
        lines.add(new HelperStartLine());
        lines.add(new HelperEndLine());
        lines.add(new DistanceLine());
        lines.add(new NumSegmentsLine());
        lines.add(new SymmetryLine());
        lines.add(new SplineTypeLine());
        lines.add(new InterpolationTypeLine());

        for (AbstractLinePanel linePanel : lines) {
            add(linePanel);
        }
    }
    
}
