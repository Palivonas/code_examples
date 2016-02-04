import javafx.scene.input.KeyCode;

import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;

/**
 * Created by Andrius on 06/12/15.
 */
public class GameKeyListener implements KeyEventDispatcher, MouseListener {

    Game game;

    GameKeyListener (Game game) {
        this.game = game;
    }

    /**
     * Allows WASD and arrow usage to control the game
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        if (e.getID() == KeyEvent.KEY_PRESSED) {
            switch (e.getKeyCode()) {
                case KeyEvent.VK_LEFT:
                case KeyEvent.VK_A:
                    game.moveLeft();
                    break;
                case KeyEvent.VK_RIGHT:
                case KeyEvent.VK_D:
                    game.moveRight();
                    break;
                case KeyEvent.VK_UP:
                case KeyEvent.VK_W:
                    game.rotate();
                    break;
                case KeyEvent.VK_DOWN:
                case KeyEvent.VK_S:
                    game.setFastSpeed();
                    break;
            }
        } else if (e.getID() == KeyEvent.KEY_RELEASED && (e.getKeyCode() == KeyEvent.VK_DOWN || e.getKeyCode() == KeyEvent.VK_S))
            game.setNormalSpeed();
        return false;
    }

    /**
     * Binds mouse clicks with game controls
     * @param e
     */
    public void mousePressed(MouseEvent e) {
        if (e.getButton() == MouseEvent.BUTTON1)
            game.moveLeft();
        if (e.getButton() == MouseEvent.BUTTON3)
            game.moveRight();
        if (e.getButton() == MouseEvent.BUTTON2)
            game.rotate();

    }

    public void mouseReleased(MouseEvent e) {}

    public void mouseEntered(MouseEvent e) {}

    public void mouseExited(MouseEvent e) {}

    public void mouseClicked(MouseEvent e) {}
}
