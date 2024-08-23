package blitz.ui.main.pointers;

import java.awt.AlphaComposite;
import java.awt.Graphics;
import java.awt.Graphics2D;

import blitz.configs.MainFrameConfig;
import blitz.models.ControlPoint;

public class HelperPointer extends Pointer{

    private boolean isStart;

    public HelperPointer(int x, int y, ControlPoint relatedCP, boolean isStart){
        super(x, y, MainFrameConfig.HIGHLIGHTED_CONTROL_POINTER_COLOR, MainFrameConfig.HELPER_POINTER_DIAMETER, relatedCP);
        setIsStart(isStart);
    }

    public boolean isStart() {
        return isStart;
    }

    private void setIsStart(boolean isStart) {
        this.isStart = isStart;
    }

    @Override
    public void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.5f));
        g2.setColor(color);
        g2.fillOval(0, 0, diameter, diameter);
    }

}
