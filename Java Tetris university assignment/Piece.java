import java.awt.*;
import java.util.Random;

/**
 * Created by Andrius on 04/12/15.
 */
public class Piece implements Cloneable {
    int width;
    int height;
    Color color;

    /**
     * Possible forms for pieces
     */
    public static final String forms[][] = {
            {
                "   ",
                "XXX",
                " X "
            },
            {
                "    ",
                "    ",
                "XXXX",
                "    ",
            },
            {
                "XXX",
                "X  "
            },
            {
                "XX ",
                " XX"
            },
            {
                "XXX",
                "  X"
            },
            {
                " XX",
                "XX "
            },
            {
                "XX",
                "XX"
            }
    };

    int[][] blocks;

    /**
     * Possible colors
     */
    static final Color[] colors = {
            Color.red,
            new Color(54, 84, 207),
            Color.orange,
            new Color(234, 216, 47),
            Color.magenta,
            new Color(61, 183, 57)
    };

    Piece() {
        this(colors[new Random().nextInt(colors.length)]);
    }

    /**
     * Choose a random form and load it
     */
    Piece(Color color) {
        this.color = color;
        int index = new Random().nextInt(forms.length);
        String form[] = forms[index];
        height = form.length;
        width = form[0].length();
        blocks = new int[height][width];
        for (int y = 0; y < height; ++y) {
            for (int x = 0; x < width; ++x)
                if (form[y].charAt(x) == 'X')
                    blocks[y][x] = 1;
        }
    }

    Piece (Color color, int blocks[][]) {
        this.color = color;
        this.blocks = blocks;
        height = blocks.length;
        width = blocks[0].length;
    }

    /**
     * For better rotation, some forms have empty elements on top
     */
    int getOffset () {
        int offset = 0;
        for (int r[] : blocks) {
            int offsetAdd = 1;
            for (int c : r)
                if (c == 1)
                    offsetAdd = 0;
            if (offsetAdd == 0)
                return offset;
            offset += offsetAdd;
        }
        return offset;
    }

    public Piece clone () {
        try {
            super.clone();
        } catch (CloneNotSupportedException e) {
            System.out.println(e.getMessage());
        }
        Piece clone = new Piece(this.color);
        clone.blocks = blocks.clone();
        return clone;
    }
}
