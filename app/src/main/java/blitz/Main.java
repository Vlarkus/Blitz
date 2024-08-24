package blitz;

import javax.swing.SwingUtilities;

import blitz.configs.MainFrameConfig;
import blitz.ui.main.MainFrame;

public class Main {
    
    public static void main(String[] args) {
        System.out.println(BlitzTerminalLogo());
        setupMacOS();
        SwingUtilities.invokeLater(() -> {
            new MainFrame();
        });
    }

    private static void setupMacOS() {
        if (isMac()) {
            System.setProperty("apple.laf.useScreenMenuBar", "true");
            System.setProperty("apple.awt.application.name", "Blitz");
        }
    }

    private static boolean isMac() {
        return System.getProperty("os.name").toLowerCase().contains("mac");
    }

    private static String BlitzTerminalLogo(){
        String blitzLogo = new String();
        blitzLogo += "\n";
        blitzLogo += "\n";
        blitzLogo += "\n";
        blitzLogo += MainFrameConfig.BLITZ_TERMINAL_ICON;
        blitzLogo += "\n";
        blitzLogo += "\n";
        blitzLogo += "\n";
        return blitzLogo;
    }

}
