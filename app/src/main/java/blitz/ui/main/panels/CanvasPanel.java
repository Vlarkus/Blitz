package blitz.ui.main.panels;

import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Image;
import java.awt.MouseInfo;
import java.awt.Point;
import java.awt.Toolkit;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.imageio.ImageIO;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JViewport;
import javax.swing.SwingUtilities;
import javax.xml.stream.XMLOutputFactory;

import blitz.configs.MainFrameConfig;
import blitz.models.Active;
import blitz.models.ActiveListener;
import blitz.models.ControlPoint;
import blitz.models.TrajectoriesList;
import blitz.models.TrajectoriesListListener;
import blitz.models.Trajectory;
import blitz.models.VisibleTrajectories;
import blitz.models.VisibleTrajectoriesListener;
import blitz.services.CartesianCoordinate;
import blitz.services.FieldImage;
import blitz.services.Utils;
import blitz.ui.main.panels.CanvasPanel.CURSOR;
import blitz.ui.main.pointers.BezierPointer;
import blitz.ui.main.pointers.ControlPointer;
import blitz.ui.main.pointers.HelperLine;
import blitz.ui.main.pointers.HelperPointer;
import blitz.ui.main.pointers.Pointer.State;
import blitz.ui.main.tools.Tool;
import blitz.ui.main.tools.Tool.Tools;
import blitz.ui.main.tools.ToolListener;

public class CanvasPanel extends JPanel implements MouseListener, MouseMotionListener, ActiveListener, ToolListener, TrajectoriesListListener, VisibleTrajectoriesListener{

    // private BufferedImage field;
    private FieldImage fieldImage;


    private static double zoomScaleX = 1;
    private static double zoomScaleY = 1;
    private Point mouseScreenPosBeforeZoom;
    private CartesianCoordinate mouseFieldPosBeforePanning;

    private JScrollPane scrollPane;

    private MouseInfoPanel mip;

    private ArrayList<Trajectory> visibleTrajectories;
    private ArrayList<ControlPointer> controlPointers;
    private ArrayList<HelperPointer> helperPointers;
    private ArrayList<HelperLine> helperLines;
    private ArrayList<BezierPointer> bezierPointers;

    private HelperPointer selectedHelperPointer;

    private HashMap<CURSOR, Cursor> cursorMap;

    public static enum CURSOR{
        SCISSORS,
        MOVE,
        HAND_OPEN,
        HAND_GRABBING,
        HAND_POINTING,
        HELP,
        NOT_ALLOWED,
        PLUS,
        MINUS,
        EYE,
        UNKNOWN
    }

    public CanvasPanel(){
        
        setBackground(MainFrameConfig.CANVAS_PANEL_BACKGROUND_COLOR);
        setPreferredSize(MainFrameConfig.CANVAS_PANEL_PREFERRED_DIMENSIONS);
        setLayout(null);

        visibleTrajectories = new ArrayList<Trajectory>();
        controlPointers = new ArrayList<ControlPointer>();
        bezierPointers = new ArrayList<BezierPointer>();
        helperPointers = new ArrayList<HelperPointer>();

        selectedHelperPointer = null;



        cursorMap = new HashMap<CURSOR, Cursor>();
        // PATH_TO_PLUS_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/plus.png";
        // public static final String PATH_TO_SCISSORS_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/scissors.png";
        // public static final String PATH_TO_MOVE_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/move.png";
        // public static final String PATH_TO_HAND_OPEN_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/handopen.png";
        // public static final String PATH_TO_HAND_GRABBING_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/handgrabbing.png";
        // public static final String PATH_TO_HAND_POINTING_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/handpointing.png";
        // public static final String PATH_TO_HELP_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/help.png";
        // public static final String PATH_TO_MINUS_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/minus.png";
        // public static final String PATH_TO_EYE_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/eye.png";
        // public static final String PATH_TO_NOT_ALLOWED_CURSOR_IMAGE = "app/src/main/java/blitz/resources/images/cursors/notallowed.png";
        // public static final String PATH_TO_UNKNOWN_CURSOR_IMAGE
       
        addCursorToMap(MainFrameConfig.PATH_TO_PLUS_CURSOR_IMAGE, CURSOR.PLUS, "Plus", 8, 0);
        addCursorToMap(MainFrameConfig.PATH_TO_SCISSORS_CURSOR_IMAGE, CURSOR.SCISSORS, "Scissors", 8, 0);
        addCursorToMap(MainFrameConfig.PATH_TO_MOVE_CURSOR_IMAGE, CURSOR.MOVE, "Move", 16, 16);
        addCursorToMap(MainFrameConfig.PATH_TO_HAND_GRABBING_CURSOR_IMAGE, CURSOR.HAND_GRABBING, "Grabbing hand", 16, 16);
        addCursorToMap(MainFrameConfig.PATH_TO_HAND_OPEN_CURSOR_IMAGE, CURSOR.HAND_OPEN, "Open hand", 16, 16);
        addCursorToMap(MainFrameConfig.PATH_TO_HAND_POINTING_CURSOR_IMAGE, CURSOR.HAND_POINTING, "Pointing hand", 16, 16);
        addCursorToMap(MainFrameConfig.PATH_TO_MINUS_CURSOR_IMAGE, CURSOR.MINUS, "Minus", 8, 0);
        addCursorToMap(MainFrameConfig.PATH_TO_EYE_CURSOR_IMAGE, CURSOR.EYE, "Eye", 8, 0);
        addCursorToMap(MainFrameConfig.PATH_TO_NOT_ALLOWED_CURSOR_IMAGE, CURSOR.NOT_ALLOWED, "Not allowed", 8, 0);
        addCursorToMap(MainFrameConfig.PATH_TO_UNKNOWN_CURSOR_IMAGE, CURSOR.UNKNOWN, "Unknown", 8, 0);
        
        setFieldImage(MainFrameConfig.PATH_TO_DEFAULT_FIELD);

        addMouseListener(this);
        addMouseMotionListener(this);
        Active.addActiveListener(this);
        Tool.addToolListener(this);
        TrajectoriesList.addTrajecoriesListListener(this);
        VisibleTrajectories.addVisibleTrajectoriesListener(this);

    }



    private void addCursorToMap(String path, CURSOR cursorType, String name, int x, int y) {
        Image cursorImage = Toolkit.getDefaultToolkit().getImage(path);
        Image scaledImage = cursorImage.getScaledInstance(32, 32, Image.SCALE_SMOOTH);
        Point hotSpot = new Point(x, y); // Adjust if necessary depending on the new size
        Cursor cursor = Toolkit.getDefaultToolkit().createCustomCursor(scaledImage, hotSpot, name);
        
        cursorMap.put(cursorType, cursor);
    }
    

    public static double getZoomScaleX(){
        return zoomScaleX; 
    }

    public static double getZoomScaleY(){
        return zoomScaleY; 
    }

    public static double getZoomScale(){
        return zoomScaleX;
    }

    private static boolean  setZoomScaleX(double newZoomScale){
        if(newZoomScale < MainFrameConfig.MIN_ZOOM_SCALE_VALUE) return false;
        if(newZoomScale > MainFrameConfig.MAX_ZOOM_SCALE_VALUE) return false;
        zoomScaleX = newZoomScale; 
        return true;
    }

    private static boolean  setZoomScaleY(double newZoomScale){
        if(newZoomScale < MainFrameConfig.MIN_ZOOM_SCALE_VALUE) return false;
        if(newZoomScale > MainFrameConfig.MAX_ZOOM_SCALE_VALUE) return false;
        zoomScaleY= newZoomScale; 
        return true;
    }

    private void clearControlPointers(){
        controlPointers = new ArrayList<ControlPointer>();
    }

    private void clearBezierPointers(){
        bezierPointers = new ArrayList<BezierPointer>();
    }

    private void clearHelperPointers(){
        helperPointers = new ArrayList<HelperPointer>();
    }

    private void clearHelperLines(){
        helperLines = new ArrayList<HelperLine>();
    }

    private void populateControlPointers(){
        
        clearControlPointers();

        for (Trajectory tr : visibleTrajectories) {
            for (ControlPoint cp : tr.getAllControlPoints()) {

                CartesianCoordinate coordinate = convertFieldToScreenCoordinates(cp.getPosition());
                int x = (int) coordinate.getX();
                int y = (int) coordinate.getY();
                ControlPointer pointer = new ControlPointer(x, y, cp);
                if(cp.equals(Active.getActiveControlPoint())){
                    pointer.setState(State.SELECTED);
                }
                controlPointers.add(pointer);

            }
        }

    }

    private void populateBezierPointers(){

        clearBezierPointers();

        for (Trajectory tr : visibleTrajectories) {
            for (ControlPoint cp : tr.getAllControlPoints()) {
                
                ArrayList<CartesianCoordinate> bezierCoordinates = tr.calculateBezierCurveFrom(cp);
                if(bezierCoordinates == null){
                    continue;
                }

                for (CartesianCoordinate cartesianCoordinate : bezierCoordinates) {
                    CartesianCoordinate coordinate = convertFieldToScreenCoordinates(cartesianCoordinate);
                    int x = (int) coordinate.getX();
                    int y = (int) coordinate.getY();
                    bezierPointers.add(new BezierPointer(x, y, cp));
                }


            }
        }

    }

    private void populateHelperPointers() {
        clearHelperPointers();
        clearHelperLines();
    
        for (ControlPointer p : controlPointers) {
            if (p.getState() == State.SELECTED) {
                ControlPoint cp = p.getRelatedControlPoint();
    
                CartesianCoordinate helperStartCoord = convertFieldToScreenCoordinates(cp.getAbsStartHelperPos());
                HelperPointer helperStartPointer = new HelperPointer((int) helperStartCoord.getX(), (int) helperStartCoord.getY(), cp, true);
                helperPointers.add(helperStartPointer);
                createHelperLine(helperStartPointer);
    
                CartesianCoordinate endStartCoord = convertFieldToScreenCoordinates(cp.getAbsEndHelperPos());
                HelperPointer helperEndPointer = new HelperPointer((int) endStartCoord.getX(), (int) endStartCoord.getY(), cp, false);
                helperPointers.add(helperEndPointer);
                createHelperLine(helperEndPointer);
            }
        }
    }
    
    private void createHelperLine(HelperPointer p) {
        int x1 = p.getCenterX();
        int y1 = p.getCenterY();
        ControlPoint cp = p.getRelatedControlPoint();
        CartesianCoordinate c = convertFieldToScreenCoordinates(new CartesianCoordinate(cp.getX(), cp.getY()));
        int x2 = (int) c.getX();
        int y2 = (int) c.getY();
        HelperLine line = new HelperLine(x1, y1, x2, y2);
    
        helperLines.add(line);
    }

    private void addAllComponents() {
        removeAll();
    
        for (HelperPointer p : helperPointers) {
            add(p);
        }
    
        for (ControlPointer p : controlPointers) {
            add(p);
        }

        for (HelperLine l : helperLines) {
            add(l);
        }
    
        
    
        for (BezierPointer p : bezierPointers) {
            add(p);
        }
        repaint();
    }

    private ControlPointer getSelectedControlPointer(){
        for (ControlPointer p : controlPointers) {
            if(p.isSelected()){
                return p;
            }
        }
        return null;
    }

    private boolean isSelectedControlPointerEmpty(){
        return getSelectedControlPointer() == null;
    }

    private boolean isSelectedHelperPointerEmpty(){
        return selectedHelperPointer == null;
    }

    public CartesianCoordinate convertFieldToScreenCoordinates(CartesianCoordinate field) {
        double screenX = ( (field.getX()  * MainFrameConfig.PIXELS_IN_ONE_INCH) + MainFrameConfig.CANVAS_PANEL_X_OFFSET ) * getZoomScaleX();
        double screenY = ( (-field.getY() * MainFrameConfig.PIXELS_IN_ONE_INCH) + MainFrameConfig.CANVAS_PANEL_Y_OFFSET ) * getZoomScaleY();
        return new CartesianCoordinate((int) screenX, (int) screenY);
    }
    
    public CartesianCoordinate convertScreenToFieldCoordinates(CartesianCoordinate screen) {
        double fieldX = ( ( (screen.getX() / getZoomScaleX()) - MainFrameConfig.CANVAS_PANEL_X_OFFSET) / MainFrameConfig.PIXELS_IN_ONE_INCH );
        double fieldY = ((-((screen.getY() / getZoomScaleY()) - MainFrameConfig.CANVAS_PANEL_Y_OFFSET)) / MainFrameConfig.PIXELS_IN_ONE_INCH) ;
        return new CartesianCoordinate(fieldX, fieldY);
    }

    public void setMouseInfoPanel(MouseInfoPanel mip){
        this.mip = mip;
    }

    public void zoomIntoMouseBy(double zoomFactor) {
        // Get the current mouse position relative to the panel
        Point mousePosition = MouseInfo.getPointerInfo().getLocation();
        Point panelPosition = getLocationOnScreen();
        Point mouseScreenPosBeforeZoom = new Point(mousePosition.x - panelPosition.x, mousePosition.y - panelPosition.y);
    
        // Convert the mouse position from screen to field coordinates before resizing
        CartesianCoordinate fieldBeforeZoom = convertScreenToFieldCoordinates(new CartesianCoordinate(mouseScreenPosBeforeZoom.getX(), mouseScreenPosBeforeZoom.getY()));
    
        // Temporarily disable automatic updates
        scrollPane.getViewport().setIgnoreRepaint(true);
        this.setIgnoreRepaint(true);
    
        try {
            // Adjust zoom scales
            if(setZoomScaleX(getZoomScaleX() * zoomFactor)
            && setZoomScaleY(getZoomScaleY() * zoomFactor))
            {

                // Update the scroll pane size based on the new zoom level
                updateScrollPaneSize();
        
                // Convert the mouse position back to screen coordinates after the zoom
                CartesianCoordinate screenAfterZoom = convertFieldToScreenCoordinates(fieldBeforeZoom);
        
                // Calculate the difference between the old and new mouse positions
                double dx = screenAfterZoom.getX() - mouseScreenPosBeforeZoom.getX();
                double dy = screenAfterZoom.getY() - mouseScreenPosBeforeZoom.getY();
                
                // Adjust the view position to keep the zoom centered around the mouse position
                JViewport viewport = scrollPane.getViewport();
                if (viewport != null) {
                    Point viewPosition = viewport.getViewPosition();
                    viewPosition.translate((int) Math.round(dx), (int) Math.round(dy));
                    SwingUtilities.invokeLater(() -> {
                        viewport.setViewPosition(viewPosition); // TODO: Causes Update
                    });
                }
        
                mouseFieldPosBeforePanning = screenAfterZoom;
            }
    
        } finally {
            // Resume updates and force a final update
            scrollPane.getViewport().setIgnoreRepaint(false);
            this.setIgnoreRepaint(false);
            this.renderVisibleTrajectories();
            revalidate();
            repaint();
        }
    }

    public void zoomIntoCenterBy(double zoomFactor) {

        // Temporarily disable automatic updates
        scrollPane.getViewport().setIgnoreRepaint(true);
        this.setIgnoreRepaint(true);
    
        try {
            // Get current view position and size
            JViewport viewport = scrollPane.getViewport();
            Point viewPosition = viewport.getViewPosition();
            Dimension viewSize = viewport.getExtentSize();
    
            // Calculate the center point in the view before zooming
            int viewCenterX = viewPosition.x + viewSize.width / 2;
            int viewCenterY = viewPosition.y + viewSize.height / 2;
    
            // Adjust zoom scales
            if(setZoomScaleX(getZoomScaleX() * zoomFactor)
            && setZoomScaleY(getZoomScaleY() * zoomFactor))
            {
                // Update the scroll pane size based on the new zoom level
                updateScrollPaneSize();
        
                // Calculate the new size of the viewport after zoom
                int newViewWidth = (int) (viewSize.width * zoomFactor);
                int newViewHeight = (int) (viewSize.height * zoomFactor);
        
                // Calculate the new view position to keep the center point in the same place
                double dx = (viewCenterX * zoomFactor) - viewCenterX;
                double dy = (viewCenterY * zoomFactor) - viewCenterY;
        
                // Adjust the view position to keep the zoom centered around the center point
                viewPosition.translate((int) Math.round(dx), (int) Math.round(dy));
                SwingUtilities.invokeLater(() -> {
                    viewport.setViewPosition(viewPosition); // TODO: Causes Update
                });
            }
    
        } finally {
            // Resume updates and force a final update
            scrollPane.getViewport().setIgnoreRepaint(false);
            this.setIgnoreRepaint(false);
            this.renderVisibleTrajectories();
            revalidate();
            repaint();
        }
    }
    
    
    
    
    private void updateScrollPaneSize() {
        if (fieldImage != null) {
            int newWidth = (int) (MainFrameConfig.CANVAS_PANEL_PREFERRED_DIMENSIONS.getWidth() * getZoomScaleX());
            int newHeight = (int) (MainFrameConfig.CANVAS_PANEL_PREFERRED_DIMENSIONS.getHeight() * getZoomScaleY());
    
            this.setPreferredSize(new Dimension(newWidth, newHeight));
        }
    }
    
    

    public void zoomInMouse() {
        zoomIntoMouseBy(MainFrameConfig.ZOOM_IN_COEFFICIENT);
    }

    public void zoomOutMouse() {
        zoomIntoMouseBy(MainFrameConfig.ZOOM_OUT_COEFFICIENT);
    }

    public void zoomInCenter() {
        zoomIntoCenterBy(MainFrameConfig.ZOOM_IN_COEFFICIENT);
    }

    public void zoomOutCenter() {
        zoomIntoCenterBy(MainFrameConfig.ZOOM_OUT_COEFFICIENT);
    }

    public ArrayList<Trajectory> getVisibleTrajectories() {
        return visibleTrajectories;
    }

    private void setVisibleTrajectories(ArrayList<Trajectory> visibleTrajectories) {
        this.visibleTrajectories = visibleTrajectories;
        renderVisibleTrajectories();
    }

    public void renderVisibleTrajectories(){
        populateControlPointers();
        populateBezierPointers();
        populateHelperPointers();
        addAllComponents();
        repaint();
    }

    private ArrayList<ControlPointer> getControlPointers() {
        return controlPointers;
    }

    private void setControlPointers(ArrayList<ControlPointer> controlPointers) {
        this.controlPointers = controlPointers;
    }

    private void setAllControlPointersUnselected(){
        for (ControlPointer p : controlPointers) {
            p.setState(State.UNSELECTED);
        }
    }

    private ArrayList<HelperPointer> getHelperPointers() {
        return helperPointers;
    }

    private void setHelperPointers(ArrayList<HelperPointer> helperPointers) {
        this.helperPointers = helperPointers;
    }

    private ArrayList<BezierPointer> getBezierPointers() {
        return bezierPointers;
    }

    private void setBezierPointers(ArrayList<BezierPointer> bezierPointers) {
        this.bezierPointers = bezierPointers;
    }

    public void setScrollPane(JScrollPane p){
        scrollPane = p;
    }

    @Override
    public void mouseClicked(MouseEvent e) {}

    @Override
    public void mousePressed(MouseEvent e) {
        mouseFieldPosBeforePanning = (new CartesianCoordinate(e.getX(), e.getY()));
        switch (Tool.getSelectedTool()) {
            case MOVE:
                setSelectedHelperPointer(e.getX(), e.getY());
                if(isSelectedHelperPointerEmpty()){
                    setSelectedControlPointer(e.getX(), e.getY());
                }
                break;

            case ADD:
                addControlPointToSelectedTrajectory(e.getX(), e.getY());
                break;
            
            case INSERT:
                insertControlPointFromBezierPointer(e.getX(), e.getY());
                break;
            
            case REMOVE:
                setSelectedControlPointer(e.getX(), e.getY());
                removeSelectedControlPoint();
                break;
            
            case CUT:
                setSelectedControlPointer(e.getX(), e.getY());
                TrajectoriesList.cutTrajectoryAtControlPoint(Active.getActiveControlPoint());
                break;
            
            case SHOW_ROBOT:
                break;
            
            case MERGE:
                break;
            
            case RENDER_ALL:
                break;

            case PAN:

                break;

            case EDIT_TIME:
                break;
        }
    }

    private void setSelectedControlPointer(int x, int y){
        for (ControlPointer p : controlPointers) {
            if(p.isWithinPointer(x, y)){
                Active.setActiveControlPoint(p.getRelatedControlPoint());
                return;
            }
        }
        Active.setActiveControlPoint(null);
    }
    


    private boolean isCursorWithinAnyControlPoint() {
        Point cursorScreenPosition = MouseInfo.getPointerInfo().getLocation();
        Point panelScreenPosition = this.getLocationOnScreen();
    
        // Convert screen position to field coordinates
        CartesianCoordinate c =
            new CartesianCoordinate(
                cursorScreenPosition.x - panelScreenPosition.x, 
                cursorScreenPosition.y - panelScreenPosition.y
                );
    
        // Check if cursor is within any control pointer
        for (ControlPointer p : controlPointers) {
            if (p.isWithinPointer((int) c.getX(), (int) c.getY())) {
                return true;
            }
        }
    
        return false;
    }

    
    private boolean isCursorWithinAnyHelperPoint() {
        Point cursorScreenPosition = MouseInfo.getPointerInfo().getLocation();
        Point panelScreenPosition = this.getLocationOnScreen();
    
        // Convert screen position to field coordinates
        CartesianCoordinate c =
            new CartesianCoordinate(
                cursorScreenPosition.x - panelScreenPosition.x, 
                cursorScreenPosition.y - panelScreenPosition.y
                );
    
        // Check if cursor is within any control pointer
        for (HelperPointer p : helperPointers) {
            if (p.isWithinPointer((int) c.getX(), (int) c.getY())) {
                return true;
            }
        }
    
        return false;
    }
    

    private void setSelectedHelperPointer(int x, int y){
        for (HelperPointer p : helperPointers) {
            if(p.isWithinPointer(x, y)){
                selectedHelperPointer = p;
                return;
            }
        }
        selectedHelperPointer = null;
    }

    public void addControlPointToSelectedTrajectory(int x, int y){
        Trajectory tr = Active.getActiveTrajectory();
        if(tr != null){
            CartesianCoordinate c = convertScreenToFieldCoordinates(new CartesianCoordinate(x, y));
            ControlPoint cp = new ControlPoint(tr.getNextAvaliableName(), c.getX(), c.getY());
            tr.addControlPoint(cp);
            Active.setActiveControlPoint(cp);
        }
    }

    public void insertControlPointFromBezierPointer(int x, int y){
        BezierPointer p = getSelectedBezierPointer(x, y);
        if(p != null){
            ControlPoint relatedCP = p.getRelatedControlPoint();
            Trajectory tr = TrajectoriesList.getTrajectoryByControlPoint(relatedCP);
            int index = tr.indexOf(relatedCP);
            int numSeg;
            CartesianCoordinate c = convertScreenToFieldCoordinates(new CartesianCoordinate(p.getCenterX(), p.getCenterY()));
            ControlPoint cp = new ControlPoint(tr.getNextAvaliableName(), c.getX(), c.getY());
            cp.setNumSegments(relatedCP.getNumSegments()/2);
            relatedCP.setNumSegments(relatedCP.getNumSegments()/2);
            tr.insertControlPoint(index+1, cp);
            Active.setActiveControlPoint(cp);
        }
    }

    private BezierPointer getSelectedBezierPointer(int x, int y){
        for (BezierPointer p : bezierPointers) {
            if(p.isWithinPointer(x, y)){
                return p;
            }
        }
        return null;
    }

    private void removeSelectedControlPoint(){
        if(Active.getActiveControlPoint() != null){
            Active.getActiveTrajectory().removeControlPoint(Active.getActiveControlPoint());
            Active.setActiveControlPoint(null);
        }
    }

    
    
    @Override
    public void mouseDragged(MouseEvent e) {
        switch (Tool.getSelectedTool()) {
            case MOVE:
                if(!isSelectedHelperPointerEmpty()){
                    moveSelectedHelperPointer(e.getX(), e.getY());
                } else if (!isSelectedControlPointerEmpty()){
                    moveSelectedControlPointer(e.getX(), e.getY());
                }
                break;

            case ADD:
                break;
            
            case INSERT:
                break;
            
            case REMOVE:
                break;
            
            case CUT:
                break;
            
            case SHOW_ROBOT:
                break;
            
            case MERGE:
                break;
            
            case RENDER_ALL:
                break;

            case PAN:
                calculatePanning(e);
                this.setCursor(cursorMap.get(CURSOR.HAND_GRABBING));
                break;

            case EDIT_TIME:
                break;
        }
    }

    public void moveSelectedControlPointer(int screenX, int screenY){
        this.setCursor(cursorMap.get(CURSOR.HAND_GRABBING));
        CartesianCoordinate fieldCoordinate = convertScreenToFieldCoordinates(new CartesianCoordinate(screenX, screenY));
        ControlPoint cp = getSelectedControlPointer().getRelatedControlPoint();
        cp.setPosition(fieldCoordinate.getX(), fieldCoordinate.getY());
        Active.notifyActiveControlPointStateEdited();
    }

    public void moveSelectedHelperPointer(int screenX, int screenY){
        CartesianCoordinate fieldCoordinate = convertScreenToFieldCoordinates(new CartesianCoordinate(screenX, screenY));
        ControlPoint cp = selectedHelperPointer.getRelatedControlPoint();
        if(selectedHelperPointer.isStart()){
            cp.setAbsStartHelperPos(fieldCoordinate.getX(), fieldCoordinate.getY());
        } else {
            cp.setAbsEndHelperPos(fieldCoordinate.getX(), fieldCoordinate.getY());
        }
        Active.notifyActiveControlPointStateEdited();
        this.setCursor(cursorMap.get(CURSOR.HAND_GRABBING));
    }

    private void calculatePanning(MouseEvent e){
        JViewport viewport = scrollPane.getViewport();
        CartesianCoordinate mouseFieldPos = (new CartesianCoordinate(e.getX(), e.getY()));
        if (viewport != null) {
            double dx = (mouseFieldPos.getX() - mouseFieldPosBeforePanning.getX()) / getZoomScaleX();
            double dy = (mouseFieldPos.getY() - mouseFieldPosBeforePanning.getY()) / getZoomScaleY();
            Point viewPos = viewport.getViewPosition();
            CartesianCoordinate translation = (new CartesianCoordinate(dx, dy));
            viewPos.translate( (int) -translation.getX(), (int) -translation.getY());

            int maxX = Math.max(0, getWidth() - viewport.getWidth());
            int maxY = Math.max(0, getHeight() - viewport.getHeight());

            if (viewPos.x < 0) viewPos.x = 0;
            if (viewPos.x > maxX) viewPos.x = maxX;
            if (viewPos.y < 0) viewPos.y = 0;
            if (viewPos.y > maxY) viewPos.y = maxY;

            viewport.setViewPosition(viewPos);
        }
    }
    
    @Override
    public void mouseReleased(MouseEvent e) {
        switch (Tool.getSelectedTool()) {
            case MOVE:
                break;

            case ADD:
                break;
            
            case INSERT:
                break;
            
            case REMOVE:
                break;
            
            case CUT:
                break;
            
            case SHOW_ROBOT:
                break;
            
            case MERGE:
                break;
            
            case RENDER_ALL:
                break;

            case PAN:
                this.setCursor(cursorMap.get(CURSOR.HAND_OPEN));
                break;

            case EDIT_TIME:
                break;
        }
    }

    @Override
    public void mouseMoved(MouseEvent e) {

        CartesianCoordinate mousePos = convertScreenToFieldCoordinates(new CartesianCoordinate(e.getX(), e.getY()));
        mip.setXValue(mousePos.getX());
        mip.setYValue(mousePos.getY());

        switch (Tool.getSelectedTool()) {
            case MOVE:
                if(isCursorWithinAnyControlPoint() || isCursorWithinAnyHelperPoint()){
                    this.setCursor(cursorMap.get(CURSOR.HAND_POINTING));
                } else {
                    this.setCursor(cursorMap.get(CURSOR.HAND_OPEN));
                }
                break;

            case ADD:
                this.setCursor(cursorMap.get(CURSOR.PLUS));
                break;
            
            case INSERT:
                this.setCursor(cursorMap.get(CURSOR.PLUS));
                break;
            
            case REMOVE:
                this.setCursor(cursorMap.get(CURSOR.MINUS));
                break;
            
            case CUT:
                this.setCursor(cursorMap.get(CURSOR.SCISSORS));
                break;
            
            case SHOW_ROBOT:
                this.setCursor(cursorMap.get(CURSOR.EYE));
                break;
            
            case MERGE:
                break;
            
            case RENDER_ALL:
                break;

            case PAN:
                this.setCursor(cursorMap.get(CURSOR.HAND_OPEN));
                break;

            case EDIT_TIME:
                break;
            
            default:
                this.setCursor(cursorMap.get(CURSOR.UNKNOWN));
                break;
        }
    }

    @Override
    public void mouseEntered(MouseEvent e) {
        mip.showLabels();
    }

    @Override
    public void mouseExited(MouseEvent e) {
        mip.hideLabels();
        this.setCursor(Cursor.getDefaultCursor());
    }

    public void setFieldImage(String path) {
        if(path == null){
            fieldImage = null;
            return;
        }
        fieldImage = new FieldImage(path);
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
    
        // Draw the image at the center of the panel
        if (fieldImage != null && fieldImage.getBufferedImage() != null) {
            BufferedImage field = fieldImage.getBufferedImage();
            
            // Use the scaled width and height from the FieldImage object
            int imageX = (getWidth() - fieldImage.getWidth()) / 2;
            int imageY = (getHeight() - fieldImage.getHeight()) / 2;
            
            // Draw the image at the calculated position
            g.drawImage(field, imageX, imageY, fieldImage.getWidth(), fieldImage.getHeight(), this);
        }
    }

    public void activeTrajectoryChanged(Trajectory tr) {

    }

    public void activeControlPointChanged(ControlPoint cp) {
        renderVisibleTrajectories();
    }

    @Override
    public void selectedToolChanged(Tools tool) {
        switch (tool) {
            case RENDER_ALL:
                renderVisibleTrajectories();
                break;
        }
    }

    @Override
    public void activeControlPointStateEdited(ControlPoint cp) {
        renderVisibleTrajectories();
    }

    @Override
    public void TrajectoryListChanged() {
        updateVisibleTrajectories();
    }

    public void updateVisibleTrajectories(){
        ArrayList<Trajectory> newVisibleTrajectories = TrajectoriesList.getTrajectoriesList();
        for (Trajectory trajectory : newVisibleTrajectories) {
            if(!trajectory.isVisible()){
                newVisibleTrajectories.remove(trajectory);
            }
        }
        setVisibleTrajectories(newVisibleTrajectories);
    }

    @Override
    public void visibleTrajectoriesChanged() {
        updateVisibleTrajectories();
    }
    
}
