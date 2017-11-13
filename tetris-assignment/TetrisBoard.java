import java.awt.*;
import java.util.LinkedList;

/**
 * Holds information about blocks and processes them to some extent
 */
public class TetrisBoard {
    int rows, columns;
    Block[][] blocks;
    Block[][] tempBlocks;

    TetrisBoard (int rows, int columns) {
        this.rows = rows;
        this.columns = columns;
        blocks = new Block[rows][columns];
        tempBlocks = new Block[rows][columns];
    }

    public void clear () {
        blocks = new Block[rows][columns];
        tempBlocks = new Block[rows][columns];
    }

    /**
     * Remove empty rows
     * @return Count of cleared rows
     */
    int clearFullRows (Game game) {
        LinkedList<Integer> toClear = new LinkedList<>();
        for (int row = 0; row < rows; ++row) {
            if (rowBlockCount(row) == columns) {
                toClear.add(row);
                for (Block block : blocks[row])
                    block.color = Color.black;
            }
        }
        game.updateView();
        toClear.forEach(this::clearRow);
        dropRows();
        clearTemp();
        return toClear.size();
    }

    /**
     * Shift hollow blocks down
     */
    void dropRows () {
        Block[][] newBlocks = new Block[rows][columns];
        int rowToAdd = rows - 1;
        for (int row = rows - 1; row > -1; --row)
            if (rowBlockCount(row) > 0)
                newBlocks[rowToAdd--] = blocks[row].clone();
        blocks = newBlocks;
    }

    /**
     * @param index row index in board
     * @return count of occupied blocks in given row
     */
    int rowBlockCount (int index) {
        int count = 0;
        for (int column = 0; column < columns; ++column)
            if (blocks[index][column] != null)
                ++count;
        return count;
    }

    /**
     * Clears blocks in given row
     * @param index row index in board
     */
    public void clearRow (int index) {
        blocks[index] = new Block[columns];
        tempBlocks[index] = new Block[columns];
    }

    /**
     * Clears temporary blocks, the falling ones
     */
    public void clearTemp () {
        tempBlocks = new Block[rows][columns];
    }

    /**
     * Checks if the given square is empty
     * @return true if the coordinate is empty
     */
    public boolean isEmpty (int row, int column) {
        try {
            return blocks[row][column] == null;
        } catch (ArrayIndexOutOfBoundsException e) {
            return false;
        }
    }

    /**
     * Adds current block to permanent ones
     */
    public void addBlock (Block block, int row, int column) {
        blocks[row][column] = block;
    }

    // not so permanent
    public void addTempBlock (Block block, int row, int column) {
        tempBlocks[row][column] = block;
        //System.out.println("Adding to " + row + ", " + column);
    }

    void glueTemp () {
        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < columns; ++c)
                if (tempBlocks[r][c] != null)
                    blocks[r][c] = tempBlocks[r][c].copy();
        }
    }

    /**
     * @return temporary and permanent blocks in one array for rendering
     */
    Block[][] getCombined () {
        Block combined[][] = new Block[rows][columns];
        for (int r = 0; r < rows; ++r)
            for (int c = 0; c < columns; ++c)
                if (blocks[r][c] != null) {
                    combined[r][c] = blocks[r][c].copy();
                    //combined[r][c].color = Color.red;
                }
                else if (tempBlocks[r][c] != null)
                    combined[r][c] = tempBlocks[r][c].copy();
        return combined;
    }
}
