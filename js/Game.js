/**
 * Created by anirudhmodi on 14/11/17.
 */
function Game(config)
{
    "use strict";

    var self = this;

    self.score = 0;

    self.gameContainer = document.getElementById('gameContainer');

    self.scoreElement = document.getElementById('scoreCard');

    self.config = config;

    self.totalCells = parseInt(config.gridSize.row)*parseInt(config.gridSize.column);

    self.flippedCell = null;

    self.timeoutForFlippingXToWhite = null;

    self.timeoutForFlippingWhiteToX= null;

    self.cellIdBeingFlipped = null;

    self.arrayOfCells = ['yellowCell','greenCell','redCell'];

    self.handleClickOnGrid = function(event)
    {
        var targetElement = event.target;

        if(targetElement.classList.contains(self.flippedCell))
        {
            if(!targetElement.getAttribute('isClicked'))
            {
                targetElement.setAttribute('isClicked','1');

                if(self.timeoutForFlippingXToWhite)
                {
                    clearTimeout(self.timeoutForFlippingXToWhite);
                }

                self.calculateAndFlipXToWhite();
            }
        }
    };

    self.createGameGrid();

    self.createGameOver();

    self.resetScore();

    self.gatherRandomCellAndFlip();
}

/**
 * This function will first generate a random cell id
 * which will between 1 - total number of cell present in a grid.
 * then it will use query selector to find the cell container with
 * the corresponding cell Id, and the individual colored cells within it.
 *
 * It will then randomly choose the cell color which needs to flipped
 * depending on the level of the game.
 *
 * and it will then call the procedure to flip the white cell to the
 * desired colored cell.
 */
Game.prototype.gatherRandomCellAndFlip = function()
{
    "use strict";

    var self =  this;

    self.cellIdBeingFlipped = self.getRandomInt(1, self.totalCells);

    var innerCells = self.getInnerCells('cell'+self.cellIdBeingFlipped);

    if(self.config.lv==0)
    {
        self.flipCellFromWhiteToX(innerCells,'yellowCell');
    }
    else if(self.config.lv==1)
    {
        self.flipCellFromWhiteToX(innerCells, self.arrayOfCells[self.getRandomInt(0, 1)]);
    }
    else
    {
        self.flipCellFromWhiteToX(innerCells, self.arrayOfCells[self.getRandomInt(0, 2)]);
    }
};

/**
 * This function will accept the list of colored cells present (including white)
 * from, and accept the second parameter which determines the white needs to be
 * flipped to which color.
 *
 * We need to store the color to which the white cell is being flipped.
 *
 * It will immediately flip the white cell to the desired color,
 * and at the same it will start a timer, after which the colored cell
 * will be flipped backed to the white cell, and the scores will be computed.
 *
 * @param cellsList
 * @param colorToFlip
 */
Game.prototype.flipCellFromWhiteToX = function(cellsList, colorToFlip)
{
    "use strict";

    var self = this;

    self.flippedCell = colorToFlip;

    cellsList.whiteCell.classList.remove('visible');

    cellsList[colorToFlip].classList.add('visible');

    var timeToFlip = self.getRandomInt(self.config.flipSpeed.min,self.config.flipSpeed.max);

    self.timeoutForFlippingXToWhite = setTimeout(function()
    {
        self.calculateAndFlipXToWhite();

    },timeToFlip);
};

Game.prototype.calculateAndFlipXToWhite = function()
{
    var self = this;

    var cellsList = self.getInnerCells("cell"+self.cellIdBeingFlipped);

    var isGameOver = false;

    if(self.config.lv==0)
    {
        if(cellsList.yellowCell.getAttribute('isClicked'))
        {
            self.setScore(true,1);
        }
        else
        {
            isGameOver = true;

            self.setScore(false,1);
        }
    }
    else if(self.config.lv==1)
    {
        if(self.flippedCell=='greenCell')
        {
            if(cellsList.greenCell.getAttribute('isClicked'))
            {
                self.setScore(true,3);
            }
        }
        else
        {
            if(cellsList.yellowCell.getAttribute('isClicked'))
            {
                self.setScore(true,1);
            }
            else
            {
                isGameOver = true;

                self.setScore(false,1);
            }
        }
    }
    else
    {
        if(self.flippedCell=='greenCell')
        {
            if(cellsList.greenCell.getAttribute('isClicked'))
            {
                self.setScore(true,3);
            }
        }
        else if(self.flippedCell=='redCell')
        {
            if(cellsList.redCell.getAttribute('isClicked'))
            {
                isGameOver = true;

                self.setScore(false,1);
            }
        }
        else
        {
            if(cellsList.yellowCell.getAttribute('isClicked'))
            {
                self.setScore(true,1);
            }
            else
            {
                isGameOver = true;

                self.setScore(false,1);
            }
        }
    }

    cellsList.whiteCell.classList.add('visible');

    cellsList[self.flippedCell].classList.remove('visible');

    cellsList[self.flippedCell].removeAttribute('isClicked');

    self.flippedCell = null;

    //self.cellIdBeingFlipped = null;

    if(!isGameOver)
    {
        self.timeoutForFlippingWhiteToX = setTimeout(function()
        {
            self.gatherRandomCellAndFlip();
        },0);
    }
    else
    {
        self.setGameOver();
    }
};

Game.prototype.setGameOver = function()
{
    var gameOver = document.getElementById('gameover');

    gameOver.classList.remove('hidden');
};

Game.prototype.getInnerCells = function(cellToFlip)
{
    "use strict";

    var self = this;

    if(self.config.multiColoredFlips==2)
    {
        return {
            'yellowCell':document.querySelector('#'+cellToFlip+' .yellowCell'),
            'greenCell':document.querySelector('#'+cellToFlip+' .greenCell'),
            'whiteCell':document.querySelector('#'+cellToFlip+' .whiteCell')
        }
    }
    else if(self.config.multiColoredFlips==3)
    {
        return {
            'yellowCell':document.querySelector('#'+cellToFlip+' .yellowCell'),
            'redCell':document.querySelector('#'+cellToFlip+' .redCell'),
            'greenCell':document.querySelector('#'+cellToFlip+' .greenCell'),
            'whiteCell':document.querySelector('#'+cellToFlip+' .whiteCell')
        }
    }
    else
    {
        return {
            'yellowCell':document.querySelector('#'+cellToFlip+' .yellowCell'),
            'whiteCell':document.querySelector('#'+cellToFlip+' .whiteCell')
        }
    }
};

/***
 * Returns random integer between min and max mentioned
 * @param min
 * @param max
 * @returns {*}
 */
Game.prototype.getRandomInt = function (min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * To create the grid dynamically
 *
 * This will create a doc frag in which it will append the rows and
 * to the rows we append the cell, the cell container will have min of
 * 2 cells (For Easy and above) = white and yellow, but depending on the level it can also have
 * 3 cells (For Medium and above) = white, yellow and green
 * 4 cells (For Hard) = white, yellow, green and red
 *
 * Each cells holds a point system:
 *
 * White cell = default state
 * Yellow cell = 1 points (Miss it and game over)
 * Green cell = 3 points (Bonus cell, the speed will always be faster than that of yellow, missing to click wont have any effect)
 * Red cell = -1 points (Click it and game over)
 */
Game.prototype.createGameGrid = function()
{
    "use strict";

    var self = this;

    let cellCount = 1;

    let {column,row:rows} = self.config.gridSize;

    let docFrag = document.createDocumentFragment();

    let grid = createDynamicElement('div',{
      'classList':['grid']
    });

    grid.addEventListener('click',self.handleClickOnGrid);

    for(var row=1;row<=rows;row++)
    {
        let cellRowContainer = createDynamicElement('div',{
            classList:['cellRowContainer']
        });

        for(var col=1;col<=column;col++)
        {
            let cell = createDynamicElement('div',{
                'classList':['cellContainer'],
                'id':`cell${cellCount}`
            });

            let whiteCell = createDynamicElement('div',{
                'classList':['whiteCell','cell','visible']
            });

            let yellowCell = createDynamicElement('div',{
                'classList':['yellowCell','cell']
            });

            cell.appendChild(yellowCell);

            if(self.config.multiColoredFlips==2 || self.config.multiColoredFlips==3)
            {
                let greenCell = createDynamicElement('div',{
                    'classList':['greenCell','cell']
                });

                cell.appendChild(greenCell);

                greenCell = null;
            }

            if(self.config.multiColoredFlips==3)
            {
                let redCell = createDynamicElement('div',{
                    'classList':['redCell','cell']
                });

                cell.appendChild(redCell);

                redCell = null;
            }

            cell.appendChild(whiteCell);

            cellCount = cellCount + 1;

            cellRowContainer.appendChild(cell);

            cell = null;

            whiteCell = null;

            yellowCell = null;
        }

        docFrag.appendChild(cellRowContainer);

        cellRowContainer = null;
    }

    grid.appendChild(docFrag);

    self.gameContainer.appendChild(grid);

    docFrag = null;
};

Game.prototype.createGameOver = function()
{
    "use strict";

    var self = this;

    let gameOver = createDynamicElement('div',{
       'id':'gameover',
        'classList':['gameOver','hidden']
    });

    let gameText = createDynamicElement('div',{
        'text':'Game Over',
        'classList':['absoluteCenter','intialText','blackText']
    });

    gameOver.appendChild(gameText);

    self.gameContainer.appendChild(gameOver);

    gameOver = null;
};

Game.prototype.resetScore = function()
{
    "use strict";

    var self = this;

    self.score = 0;

    self.scoreElement.textContent = 'Score : 0';
};

Game.prototype.setScore = function(isIncrement,value,isReset)
{
    var self = this;

    if(isReset)
    {
        self.score = 0;
    }
    else
    {
        if(isIncrement)
        {
            self.score = self.score + value;
        }
        else
        {
            self.score = self.score - value;
        }
    }

    self.scoreElement.innerHTML = 'Score : '+self.score;
};

Game.prototype.destroy = function()
{
    "use strict";

    var self = this;

    while (self.gameContainer.hasChildNodes())
    {
        self.gameContainer.removeChild(self.gameContainer.firstChild);
    }

    self.gameContainer = null;

    self.scoreElement = null;

    self.config = null;
};