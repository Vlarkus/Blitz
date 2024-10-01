package blitz.ui.application.panels.toolPanel.tools;

import blitz.configs.Config;

/**
 * Represents the "Add" tool within the tool panel of the application.
 * 
 * This tool is responsible for handling the addition of new elements or entities
 * within the application's user interface. It extends the abstract {@link Tool}
 * class and initializes itself with the appropriate icon and identifier.
 * 
 * <p>
 * Example usage:
 * <pre>
 *     AddTool addTool = new AddTool();
 *     toolPanel.addTool(addTool);
 * </pre>
 * </p>
 * 
 * @author Valery
 */
public class AddTool extends Tool{
    
    /**
     * Constructs an {@code AddTool} with the specified icon and identifier.
     * 
     * Initializes the tool with the icon path defined in {@link Config} and sets
     * its type to {@link Tools#ADD}, indicating its functionality as an addition tool.
     */
    public AddTool(){
        super(Config.PATH_TO_ADD_TOOL_ICON, Tools.ADD);
    }

    /**
     * Performs the add action on the currently selected elements.
     * 
     * This method is invoked when the user activates the add tool while certain elements
     * are selected in the application. The specific behavior should be implemented
     * to define how new elements are added based on the current selection context.
     * 
     * <strong>Note:</strong> This method is currently not implemented and should be
     * overridden with the desired add functionality.
     */
    @Override
    void performOnSelected() {
        // TODO: Implement the addition logic based on the selected elements
    }
}
