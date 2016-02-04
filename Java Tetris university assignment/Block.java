import java.awt.*;

/**
 * Created by Andrius on 04/12/15.
 */
public class Block {
    Color color;
    // true if the block is just an expo
    boolean isGhost;

    public Block (Color color, boolean isGhost) {
        this.color = color;
        this.isGhost = isGhost;
    }

    public Block (Color color) {
        this(color, false);
    }
    public Block () {
        this(Color.black, false);
    }

    public void setColor (Color color) {
        this.color = color;
    }

    public Block copy () {
        return new Block(color, isGhost);
    }
}
