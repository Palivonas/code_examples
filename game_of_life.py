'''
My implementation of Conway's Game of Life.
Rendered as text in terminal.
Usage:
    Enter initial cells in the format of x,y x,y ...
    Example: 10,9 10,10 10,11
    This will create a line of 3 cells
    Then enter number of lines and columns to render.
    This should be less or equal to your terminal dimensions.
'''
__author__ = 'andrius@palivonas.lt'

import time


class GameOfLife:

    def __init__(self):
        self.__cells = {}

    def create(self, x: int, y: int):
        # print(self.__cells)
        try:
            self.__cells[x][y] = True
        except KeyError:
            self.__cells[x] = {y: True}
        # print(self.__cells)
        # input()
        pass

    def destroy(self, x: int, y: int):
        try:
            del self.__cells[x][y]
            if len(self.__cells[x]) == 0:
                del self.__cells[x]
        except ValueError:
            pass

    def neighbourhood(self, cell_x: int, cell_y: int, return_list=True):
        neighbourhood = [[], 0]
        # print('Checking {}, {}:'.format(cell_x, cell_y))
        for x in range(cell_x - 1, cell_x + 2):
            for y in range(cell_y - 1, cell_y + 2):
                if return_list:
                    neighbourhood[0].append((x, y))
                if cell_x != x or cell_y != y:
                    try:
                        if y in self.__cells[x]:
                            neighbourhood[1] += 1
                    except KeyError:
                        pass
        # print('    Alive around:', neighbourhood[1])
        return neighbourhood

    def alive_neighbour_count(self, x: int, y: int):
        return self.neighbourhood(x, y, False)[1]

    def evolve(self):
        death_list = {}
        birth_list = {}
        checked_list = {}
        for x, rows in self.__cells.items():
            for y in rows:
                # print('-----', y)
                try:
                    neighbourhood = self.neighbourhood(x, y)
                except:
                    # print(x, '--', y)
                    # input()
                    pass
                if neighbourhood[1] < 2 or neighbourhood[1] > 3:
                    try:
                        death_list[x].append(y)
                    except KeyError:
                        death_list[x] = [y]
                for dead_x, dead_y in neighbourhood[0]:
                    try:
                        checked = dead_y in checked_list[dead_x]
                    except KeyError:
                        checked = False
                    if not checked:
                        try:
                            checked_list[dead_x].append(dead_y)
                        except KeyError:
                            checked_list[dead_x] = [dead_y]
                        if self.alive_neighbour_count(dead_x, dead_y) == 3:
                            try:
                                birth_list[dead_x][dead_y] = True
                            except KeyError:
                                birth_list[dead_x] = {dead_y: True}
        for x, rows in death_list.items():
            for y in rows:
                self.destroy(x, y)
        for x, rows in birth_list.items():
            for y in rows:
                self.create(x, y)

    def render(self, width=100, height=40):
        for y in range(height + 1):
            if y not in self.__cells:
                print()
                continue
            row = self.__cells[y]
            last_x = self.clamp(max(row), 0, width) + 1
            line = [' '] * last_x
            for x in row:
                if x > height or x < 0:
                    continue
                line[x] = 'X'
            print(''.join(line))

    @staticmethod
    def clamp(n, min_n, max_n):
        if n < min_n:
            return min_n
        elif n > max_n:
            return max_n
        else:
            return n

game = GameOfLife()

coords = input('Enter initial cells in this format: x,y x,y x,y...')
height = int(input('How many lines to render in one tick? '))
width = int(input('How many columns to render in one tick? '))
for xy in coords.split(' '):
    xy = xy.split(',')
    x = int(xy[1])
    y = int(xy[0])
    game.create(x, y)

game.render()

tick = 0.5
last_tick = time.clock()
while True:
    if time.clock() - last_tick >= tick:
        last_tick = time.clock()
        game.evolve()
        game.render(width, height)
