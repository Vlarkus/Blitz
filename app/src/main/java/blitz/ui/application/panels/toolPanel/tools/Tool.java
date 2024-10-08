/*
 * Copyright 2024 Valery Rabchanka
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package blitz.ui.application.panels.toolPanel.tools;

import java.awt.Graphics;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import javax.imageio.ImageIO;
import javax.swing.ImageIcon;
import javax.swing.JRadioButton;

import blitz.configs.Config;

public abstract class Tool extends JRadioButton{
    
    protected static Tools previousTool;
    protected static Tools selectedTool;
    
    protected Tools tool;
    
    public enum Tools{
        ADD,
        CUT,
        EDIT_TIME,
        INSERT,
        MERGE,
        MOVE,
        PAN,
        REMOVE,
        RENDER_ALL,
        SHOW_ROBOT,
    }
    
    protected ImageIcon frontIcon;
    protected ImageIcon backSelectedIcon;
    protected ImageIcon backUnselectedIcon;

    private static ArrayList<ToolListener> listeners = new ArrayList<>();

    public Tool(String path, Tools tool) {
        super();
        this.tool = tool;

        try {
            // Load icons
            frontIcon = new ImageIcon(ImageIO.read(new File(path)));
            backSelectedIcon = new ImageIcon(ImageIO.read(new File(Config.PATH_TO_SELECTED_TOOL_BACKGROUND_ICON)));
            backUnselectedIcon = new ImageIcon(ImageIO.read(new File(Config.PATH_TO_UNSELECTED_TOOL_BACKGROUND_ICON)));
        } catch (IOException e) {
            e.printStackTrace();
        }

        setPreferredSize(Config.TOOL_DIMENSIONS);

        addItemListener(new ItemListener() {
            @Override
            public void itemStateChanged(ItemEvent e) {
                if (e.getStateChange() == ItemEvent.SELECTED) {
                    previousTool = getSelectedTool();
                    selectedTool = tool;
                    performOnSelected();
                    notifySelectedToolChanged();
                    repaint();
                }
            }
        });

    }

    abstract void performOnSelected();

    public static Tools getSelectedTool() {
        return selectedTool;
    }

    public static void addToolListener(ToolListener listener){
        listeners.add(listener);
    }

    public static void removeToolListener(ToolListener listener){
        listeners.remove(listener);
    }

    protected static void notifySelectedToolChanged(){
        for (ToolListener toolListener : listeners) {
            toolListener.selectedToolChanged(selectedTool);
        }
    }

    public Tools getTool(){
        return tool;
    }

    public static Tools getPreviousTool(){
        return previousTool;
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);

        // Draw the back icon
        if (backSelectedIcon != null) {
            if(isSelected()){
                g.drawImage(backSelectedIcon.getImage(), 0, 0, getWidth(), getHeight(), null);
            } else {
                g.drawImage(backUnselectedIcon.getImage(), 0, 0, getWidth(), getHeight(), null);
            }
        }

        // Draw the front icon only when selected
        if (frontIcon != null) {
            g.drawImage(frontIcon.getImage(), 0, 0, getWidth(), getHeight(), null);
        }
    }

    public ImageIcon getFrontIcon() {
        return frontIcon;
    }

    public ImageIcon getBackSelectedIcon() {
        return backSelectedIcon;
    }

    public ImageIcon getBackUnselectedIcon() {
        return backUnselectedIcon;
    }

    public static ArrayList<ToolListener> getListeners() {
        return listeners;
    }

}
