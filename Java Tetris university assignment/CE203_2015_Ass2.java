import javax.swing.*;
import java.awt.*;

/**
 * Created by Andrius on 07/12/15.
 */
public class CE203_2015_Ass2 extends JApplet {

    public void init () {

        Frame c = (Frame)this.getParent().getParent();
        c.setTitle("Tetris by Andrius Palivonas 1402002");

        int rows = 20;
        int columns = 10;

        // a parent FlowLayout to be able to set size and alignment better
        JPanel tetrisParent = new JPanel(new FlowLayout());
        // initialize the main view where blocks will be displayed
        TetrisView view = new TetrisView(rows, columns);
        view.setBorder(BorderFactory.createLineBorder(Color.black));
        tetrisParent.add(view);
        // position UI into a grid
        JPanel mainPanel = new JPanel(new GridLayout(1, 2));
        mainPanel.add(tetrisParent);
        add(mainPanel);

        setSize(view.getPreferredSize().width + 230, view.getPreferredSize().height + 5);

        // panel for score, next piece and restart button
        JPanel controlsParent = new JPanel(new FlowLayout());
        JPanel controls = new JPanel(new GridLayout(3, 1));
        controlsParent.add(controls);
        mainPanel.add(controlsParent);
        controls.setSize(new Dimension(150, view.getPreferredSize().height));

        // setup the labels and style them a bit
        JPanel scorePanel = new JPanel(new FlowLayout());
        JLabel scoreName = new JLabel("Score: ");
        JLabel scoreNumber = new JLabel("0");
        Font font = new Font("Tahoma", Font.PLAIN, 24);
        scoreNumber.setFont(font);
        scoreName.setFont(font);
        scorePanel.add(scoreName);
        scorePanel.add(scoreNumber);

        controls.add(scorePanel);

        // view for next incoming piece
        TetrisView nextPieceView = new TetrisView(6, 6);
        controls.add(nextPieceView);

        // restart button
        JButton startButton = new JButton("Restart game");
        startButton.setSize(50, 10);
        controls.add(startButton);

        // pass the created objects to main game object
        Game game = new Game(rows, columns, view, scoreNumber, nextPieceView);

        // add keyboard and mouse listeners
        KeyboardFocusManager.getCurrentKeyboardFocusManager().addKeyEventDispatcher(new GameKeyListener(game));
        this.addMouseListener(new GameKeyListener(game));
        startButton.addActionListener(e -> game.start());
        game.start();
    }
}
