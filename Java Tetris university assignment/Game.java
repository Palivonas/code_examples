import javax.swing.*;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Handles most of the game logic and actions
 */
public class Game {

    // main game view
    TetrisView view;
    TetrisBoard board;

    // for displaying the next piece
    TetrisView nextPieceView;
    TetrisBoard nextPieceBoard;

    JLabel scoreOutput;

    Piece currentPiece;
    Piece nextPiece;

    // coordinates for the current falling piece
    int currentRow;
    int currentColumn;

    // is a piece falling right now
    boolean isFalling;
    boolean gameOver;

    int score;

    // delay between two steps, start off slowly
    long startingSpeed = 700;
    long normalSpeed = startingSpeed;
    long fastSpeed = 40;

    long stepDelay = normalSpeed;

    Timer timer;
     /**
      * Set up the game
      */
    Game (int rows, int columns, TetrisView view, JLabel scoreOutput, TetrisView nextPieceView) {
        board = new TetrisBoard(rows, columns);
        nextPieceBoard = new TetrisBoard(nextPieceView.rows, nextPieceView.columns);
        this.view = view;
        this.scoreOutput = scoreOutput;
        this.nextPieceView = nextPieceView;
    }

    /**
     * Display score in GUI
     */
    void updateScore () {
        scoreOutput.setText(Integer.toString(score));
    }

    /**
     * Reset all attributes and (re)start the game loop
     */
    void start () {
        System.out.println("Starting the game");
        score = 0;
        updateScore();
        stepDelay = startingSpeed;
        isFalling = false;
        gameOver = false;
        board.clear();
        board.clearTemp();
        setNormalSpeed();
        spawnNewPiece();
        updateView();
        resetLoop();
    }

    class LoopTask extends TimerTask {
        public void run() {
            step();
        }
    }

    /**
     * Reset the loop when changing pace
     */
    void resetLoop () {
        try {
            timer.cancel();
            timer.purge();
        } catch (Exception e) {

        }
        timer = new Timer();
        timer.schedule(new LoopTask(), stepDelay, stepDelay);
    }

    /**
     * Spawns the loaded piece and generates another one
     */
    void spawnNewPiece () {
        if (nextPiece == null)
            currentPiece = new Piece();
        else
            currentPiece = nextPiece;
        nextPiece = new Piece();

        positionToStart();
        isFalling = true;

        // Add blocks of the next piece to nextPiece view
        nextPieceBoard.clear();
        final int nRow = 0 - nextPiece.getOffset();
        final int nColumn = nextPieceBoard.rows / 2 - nextPiece.width / 2;
        for (int r = 0; r < nextPiece.height; ++r)
            for (int c = 0; c < nextPiece.width; ++c)
                if (nextPiece.blocks[r][c] == 1)
                    nextPieceBoard.addTempBlock(new Block(nextPiece.color), r + nRow, c + nColumn);
        nextPieceView.setBlocks(nextPieceBoard.getCombined());
        nextPieceView.repaint();
    }

    /**
     * Place current row in top center
     */
    void positionToStart () {
        currentRow = 0 - currentPiece.getOffset();
        currentColumn = board.columns / 2 - currentPiece.width / 2;
    }

    /**
     * Called every time a piece needs to move down
     */
    void step () {
        if (gameOver)
            return;
        if (!isFalling) {
            // if last piece finished falling, spawn a new one
            spawnNewPiece();
            // if it can't move, game over
            if (!canMove(currentRow + 1, currentColumn)) {
                endGame();
            }
            updateView();
        }
        else if (canMove(currentRow + 1, currentColumn)) {
            currentRow += 1;
            updateView();
        } else {
            // the piece fell!
            isFalling = false;
            // draw current shape to the board
            drawCurrentToBoard();
            currentPiece.blocks = new int[currentPiece.blocks.length][currentPiece.blocks[0].length];
            increaseScore(board.clearFullRows(this));
        }
    }

    void increaseScore (int rowsCleared) {
        score += rowsCleared * 10;
        //normalSpeed = (int) (normalSpeed * (1 + ((float)score / 50)));
    }

    /**
     * Clear all falling blocks, add new ones, repaint it
     */
    void updateView () {
        updateScore();
        board.clearTemp();
        drawGhostToBoard();
        drawCurrentToTemp();
        view.setBlocks(board.getCombined());
        view.repaint();
    }

    /**
     * Loops through current piece's blocks and adds them to the board's temporary storage
     */
    void drawCurrentToTemp() {
        for (int r = 0; r < currentPiece.height; ++r)
            for (int c = 0; c < currentPiece.width; ++c)
                if (currentPiece.blocks[r][c] == 1)
                    board.addTempBlock(new Block(currentPiece.color), r + currentRow, c + currentColumn);
    }

    /**
     * Add current piece to the board permanently after it falls
     */
    void drawCurrentToBoard () {
        board.clearTemp();
        for (int r = 0; r < currentPiece.height; ++r)
            for (int c = 0; c < currentPiece.width; ++c)
                if (currentPiece.blocks[r][c] == 1)
                    board.addBlock(new Block(currentPiece.color), r + currentRow, c + currentColumn);
    }

    void drawGhostToBoard () {
        int ghostRow = currentRow;
        while (ghostRow < board.rows) {
            if (!canMove(++ghostRow, currentColumn)) {
                --ghostRow;
                break;
            }
        }
        if (ghostRow > currentRow) {
            for (int r = 0; r < currentPiece.height; ++r)
                for (int c = 0; c < currentPiece.width; ++c)
                    if (currentPiece.blocks[r][c] == 1)
                        board.addTempBlock(new Block(currentPiece.color, true), r + ghostRow, c + currentColumn);
        }
    }

    /**
     * Checks there is space for the piece at newRow, newColumn
     * @param newRow row number
     * @param newColumn column number
     * @param piece piece to be checked
     * @return true if there is space for the piece
     */
    boolean canMove (int newRow, int newColumn, Piece piece) {
        for (int r = 0; r < piece.height; ++r)
            for (int c = 0; c < piece.width; ++c) {
                if (piece.blocks[r][c] == 1 && !board.isEmpty(newRow + r, newColumn + c))
                    return false;
                }
        return true;
    }

    /**
     * Checks there is space for current piece at newRow, newColumn
     * @param newRow row number
     * @param newColumn column number
     * @return true if there is space for current piece
     */
    boolean canMove (int newRow, int newColumn) {
        return canMove(newRow, newColumn, currentPiece);
    }


    /**
     * Utilizes can_move
     */
    void moveRight () {
        if (canMove(currentRow, currentColumn + 1)) {
            ++currentColumn;
            updateView();
        }
    }

    void moveLeft () {
        if (canMove(currentRow, currentColumn - 1)) {
            --currentColumn;
            updateView();
        }
    }

    /**
     * Rotate current piece, check if it fits the map
     * and if so, update it. Kickbacks from walls possible.
     */
    void rotate () {
        final int rows = currentPiece.height;
        final int columns = currentPiece.width;
        int[][] rotated = new int[columns][rows];

        for (int i = 0; i < rows; i++)
            for (int j = 0; j < columns; j++)
                rotated[j][i] = currentPiece.blocks[i][columns - 1 - j];

        Piece rotatedPiece = new Piece(currentPiece.color, rotated);
        int kicks[][] = {
            {0,  0},
            {0,  1},
            {0, -1},
            //{0, -2},
            //{0,  2},
            {1,  0},
            //{-1, 0},
            {1,  1},
            //{-1, 1},
            {1, -1},
            //{-1, -1},
        };
        for (int kick[] : kicks) {
            if (canMove(currentRow + kick[0], currentColumn + kick[1], rotatedPiece)) {
                //System.out.println("Kicking " + kick[0] + ", " + kick[1]);
                currentPiece = rotatedPiece;
                currentRow += kick[0];
                currentColumn += kick[1];
                updateView();
                break;
            }
        }
    }

    /**
     * Make the pieces fall very quickly
     */
    void setFastSpeed () {
        if (stepDelay == fastSpeed)
            return;
        stepDelay = fastSpeed;
        step();
        resetLoop();
    }

    /**
     * Go back to normal speed
     */
    void setNormalSpeed () {
        if (stepDelay == normalSpeed)
            return;
        stepDelay = normalSpeed;
        resetLoop();
    }

    /**
     * The game has ended
     */
    void endGame () {
        gameOver = true;
        System.out.println("Game over");
        timer.cancel();
    }
}
