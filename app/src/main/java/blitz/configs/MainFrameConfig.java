package blitz.configs;

import java.awt.Dimension;

import blitz.servises.CartesianCoordinate;
import blitz.servises.HexColor;

public class MainFrameConfig {
 
    // MainFrame

    public static final String FRAME_TITLE = "Blitz";
    public static final Dimension MINIMUM_FRAME_DIMENSIONS = new Dimension(1000, 600);
    public static final Dimension DEFAULT_FRAME_DIMENSIONS = MINIMUM_FRAME_DIMENSIONS;

    public static final String SAVE_FILE_EXTENSION_TYPE = ".tf";
    public static final String EXPORT_FILE_EXTENSION_TYPE = ".txt";



    // ToolPanel
    public static final Dimension TOOL_PANEL_PREFFERED_DIMENSIONS = new Dimension(75, 0);
    public static final HexColor TOOL_PANEL_BACKGROUND_COLOR = new HexColor("#00ff00");



    // sidePanel
    public static final Dimension SIDE_PANEL_PREFFERED_DIMENSIONS = new Dimension(350, 0);

    

    // CanvasPanel
    public static final Dimension CANVAS_PANEL_PREFFERED_DIMENSION = new Dimension(2000, 2000);
    public static final HexColor CANVAS_PANEL_BACKGROUND_COLOR = new HexColor("#888888");
    public static final CartesianCoordinate DEFAULT_OFFSET = new CartesianCoordinate(0, 0);
    public static final int CANVAS_PANEL_X_OFFSET = ((int) CANVAS_PANEL_PREFFERED_DIMENSION.getWidth()) / 2;
    public static final int CANVAS_PANEL_Y_OFFSET = ((int) CANVAS_PANEL_PREFFERED_DIMENSION.getHeight()) / 2;



    // InfoPanel
    public static final Dimension INFO_PANEL_PREFFERED_DIMENSIONS = new Dimension( (int) SIDE_PANEL_PREFFERED_DIMENSIONS.getWidth(), 300);
    public static final HexColor INFO_PANEL_BACKGROUND_COLOR = new HexColor("#0000ff");



    // SelectionPanel
    public static final Dimension SELECTION_PANEL_PREFFERED_DIMENSIONS = new Dimension( (int) SIDE_PANEL_PREFFERED_DIMENSIONS.getWidth(), 300);
    public static final HexColor SELECTION_PANEL_BACKGROUND_COLOR = new HexColor("#999999");



    // Pointers

    // ControlPointer
    public static final HexColor UNSELECTED_CONTROL_POINTER_COLOR = new HexColor("#3441ed");
    public static final HexColor HIGHLIGHTED_CONTROL_POINTER_COLOR = new HexColor("#fcdf3a");
    public static final HexColor SELECTED_CONTROL_POINTER_COLOR = new HexColor("#43aef0");
    public  static final int CONTROL_POINTER_DIAMETER = 17;

    // BezierPointer
    public static final HexColor DEFAULT_BEZIER_POINTER_COLOR = new HexColor("#33ff1c");
    public static final HexColor HIGHLIGHTED_BEZIER_POINTER_COLOR = new HexColor("#fcdf3a");
    public  static final int BEZIER_POINTER_DIAMETER = 8;

    // HelperPointer
    public static final HexColor DEFAULT_HELPER_POINTER_COLOR = new HexColor("#f57e1d");
    public  static final int HELPER_POINTER_DIAMETER = 13;

}
