// code copied from Simon Lucas
// code copied by Udo Kruschwitz


import javax.swing.*;
import java.awt.*;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;


public class TetrisView extends JPanel implements KeyListener {

    Block[][] blocks;
    int columns, rows;
    int blockSize = 20;

    public TetrisView(int rows, int columns) {
        this.rows = rows;
        this.columns = columns;
        blocks = new Block[rows][columns];
        repaint();
    }

    public void setBlocks (Block[][] blocks) {
        this.blocks = blocks;
    }


    public void paintComponent(Graphics g) {
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < columns; c++) {
                if (blocks[r][c] != null) {
                    if (blocks[r][c].isGhost)
                        g.setColor(new Color(blocks[r][c].color.getRed(), blocks[r][c].color.getGreen(), blocks[r][c].color.getBlue(), 90));
                    else
                        g.setColor(blocks[r][c].color);
                    g.fill3DRect(c * blockSize, r * blockSize,
                            blockSize, blockSize, true);
                }
            }
        }
    }

    public Dimension getPreferredSize() {
        return new Dimension(columns * blockSize, rows * blockSize);
    }

    public void keyReleased (KeyEvent e) {}
    public void keyTyped (KeyEvent e) {}
    public void keyPressed (KeyEvent e) {}
}
