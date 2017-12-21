/**
 * Created by anirudhmodi on 03/11/17.
 */
(function()
{
    "use strict";

    function GameController()
    {
        var self = this;

        self.gameInstance = null;

        self.configForGame = null;

        self.score = 0;

        self.scoreElement = document.getElementById('scoreCard');

        self.timeoutForFlippingBlackToWhite = null;

        self.timeoutForFlippingWhiteToBlack = null;

        self.cellIdBeingFlipped = null;

        self.setScore(true,0);

        self.addEventListenerOnGameContainer();

        self.addEventListenerOnRestart();

        self.setRandomCellToFlipToBlack(1500);
    }

    GameController.prototype.createGame = function()
    {
        var self = this;

        /**
         * Destroy and clean previous game instance,
         * it should clear the events, div references,
         * closures references
         */
        if(self.gameInstance && self.gameInstance.destroy)
        {
            self.gameInstance.destroy();
        }

        self.gameInstance = new Game(self.config);

    };

    GameController.prototype.addEventListenerOnGameContainer = function()
    {
        var self = this;

        var gameContainer = document.getElementById('gameContainer');

        gameContainer.addEventListener('click',function(event)
        {
            var targetElement = event.target;

            if(targetElement.classList.contains('blackCell'))
            {
                targetElement.className = targetElement.className+'clicked';

                targetElement.setAttribute('isClicked','1');

                self.flipBlackToWhiteAndCalculateScore(targetElement.parentNode.getAttribute('id'),true);

                self.setRandomCellToFlipToBlack();
            }
        });
    };

    GameController.prototype.addEventListenerOnRestart = function()
    {
        var self = this;

        document.getElementById('restart').addEventListener('click',function()
        {
            self.setScore(null,null,true);

            if(self.timeoutForFlippingBlackToWhite)
            {
                clearTimeout(self.timeoutForFlippingBlackToWhite);

                if(self.cellIdBeingFlipped)
                {
                    self.flipBlackToWhite(document.querySelector('#'+self.cellIdBeingFlipped+' .blackCell'),document.querySelector('#'+self.cellIdBeingFlipped+' .whiteCell'));
                }

                self.hideGameOver();

                self.setRandomCellToFlipToBlack(1500);
            }
        });
    };

    GameController.prototype.setScore = function(isIncrement,value,isReset)
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

    GameController.prototype.flipWhiteToBlack = function(cellToFlip,timeToFlipUntil)
    {
        var self = this;

        var {blackCell,whiteCell} = self.getBlackAndWhiteCells(cellToFlip);

        if(blackCell && whiteCell)
        {
            whiteCell.classList.remove('visible');

            blackCell.classList.add('visible');

            self.timeoutForFlippingBlackToWhite = setTimeout(function()
            {
                self.flipBlackToWhiteAndCalculateScore(cellToFlip);
            },timeToFlipUntil);
        }
    };

    GameController.prototype.flipBlackToWhiteAndCalculateScore = function(cellToFlip, dontCallRandomCellToFlip)
    {
        var self = this;

        var {blackCell,whiteCell} = self.getBlackAndWhiteCells(cellToFlip);

        self.calculateScoreForFlippedCell(blackCell);

        self.flipBlackToWhite(blackCell, whiteCell);
    };

    GameController.prototype.getBlackAndWhiteCells = function(cellToFlip)
    {
        return {
            'blackCell':document.querySelector('#'+cellToFlip+' .blackCell'),
            'whiteCell':document.querySelector('#'+cellToFlip+' .whiteCell')
        }
    };

    GameController.prototype.calculateScoreForFlippedCell = function(blackCell)
    {
        var self = this;

        if(!blackCell.getAttribute('isClicked'))
        {
            self.setScore(false,1);

            self.setGameOver();
        }
        else
        {
            self.setScore(true,1);
        }
    };

    GameController.prototype.flipBlackToWhite = function(blackCell, whiteCell, dontCallRandomCellToFlip)
    {
        blackCell.removeAttribute('isClicked');

        blackCell.classList.remove('visible');

        blackCell.classList.remove('clicked');

        whiteCell.classList.add('visible');

        /***
         * This part is commented because it is going in recursion function calling function
         */
        //if(!dontCallRandomCellToFlip)
        //{
        //    self.setRandomCellToFlipToBlack();
        //}
    };

    GameController.prototype.setGameOver = function()
    {
        var gameOver = document.getElementById('gameOver');

        gameOver.classList.remove('hidden');
    };

    GameController.prototype.hideGameOver = function()
    {
        var gameOver = document.getElementById('gameOver');

        gameOver.classList.add('hidden');
    };

    /**
     * This function first finds a random id and then it will
     * call the flip white cell to black
     * @param timer
     */
    GameController.prototype.getRandomCellToFlip = function(timer)
    {
        var self = this;

        var cellToFlip = 'cell'+self.getRandomInt(1,12);

        self.cellIdBeingFlipped = cellToFlip;

        if(self.timeoutForFlippingWhiteToBlack)
        {
            clearTimeout(self.timeoutForFlippingWhiteToBlack);
        }

        var time = 200;

        if(timer)
        {
            time = timer;
        }

        self.timeoutForFlippingWhiteToBlack = setTimeout(function(){
            self.flipWhiteToBlack(cellToFlip,self.getRandomInt(800,1500));
        },time);
    };

    /***
     * Returns random integer between min and max mentioned
     * @param min
     * @param max
     * @returns {*}
     */
    GameController.prototype.getRandomInt = function (min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    GameController.prototype.setRandomCellToFlipToBlack = function(timer)
    {
        var self = this;

        if(self.timeoutForFlippingBlackToWhite)
        {
            clearTimeout(self.timeoutForFlippingBlackToWhite);
        }

        self.getRandomCellToFlip(timer);
    };

    window.Game = new GameController();
})();