function createDynamicElement(elementType,options)
{
    "use strict";

    let element = document.createElement(elementType);

    for(var i in options)
    {
        var attributes = ['id','src','level','type'];

        if(attributes.indexOf(i)>=0)
        {
            element.setAttribute(i,options[i]);
        }
        else if(i=='classList')
        {
            element.classList.add(...options[i]);
        }
        else if(i=='text')
        {
            element.textContent = options[i];
        }
        else
        {
            console.error('Kindly add appropriate attribute in the list');
        }
    }

    return element;
}

function GameControllerJs()
{
    var self = this;

    /**
     * This contains the game instance
     * of the game which is being currently
     * @type {null}
     */
    self.gameInstance = null;

    /**
     * This holds the level config for the game which
     * is being currently played.
     * @type {null}
     */
    self.configForGame = null;

    /**
     * This will be called during initial load so that we can read from
     * our config object and create level in our UI
     */
    self.populateLevelsDialog();
}

/**
 * This is to create the action which the users can do
 * ie the score card and the restart button
 *
 * This also attaches an event listener to the restart button
 * which will destroy the previous instance of game, and then
 * create a new instance of the game with same config which the user
 * has initialized with.
 */
GameControllerJs.prototype.createActionsForGame = function()
{
    "use strict";

    let self = this;

    let actionContainer = document.getElementById('actionContainer');

    let scoreButton = createDynamicElement('div',{
        'text':'Score : 1',
        'id':'scoreCard',
        'classList':['scoreCard']
    });

    let restartButton = createDynamicElement('div',{
        'text':'Restart',
        'id':'restart',
        'classList':['reset']
    });

    actionContainer.appendChild(scoreButton);

    actionContainer.appendChild(restartButton);

    self.eventListenerForRestart = function(event)
    {
        /**
         * Destroy and clean previous game instance,
         * it should clear the events, div references,
         * closures references
         */
        self.destroyGameInstance();

        self.createGame();
    };

    restartButton.addEventListener('click',self.eventListenerForRestart)
};

GameControllerJs.prototype.destroyGameInstance = function()
{
    "use strict";
    var self = this;

    if(self.gameInstance && self.gameInstance.destroy)
    {
        self.gameInstance.destroy();

        self.gameInstance = null;
    }
};

/**
 * this is to handle the
 * @param event
 */
GameControllerJs.prototype.handleLevelSelect = function(event)
{
    var self = this;

    var userSelectedLevel = parseInt(event.target.getAttribute('level'));

    var levelObject = config.levels.filter(level => level.lv===userSelectedLevel);

    if(levelObject && levelObject.length)
    {
        self.setConfigAndStart(levelObject[0])
    }
};

/**
 * This is to hard reset the game ie whenever the user want to create
 * a new game and not continue with current difficulty mode, this function
 * will reset the config of the game acc to the users choice.
 * @param level
 */
GameControllerJs.prototype.setConfigAndStart = function(level)
{
    var self = this;

    if(level)
    {
        self.configForGame = Object.assign({},level);

        self.createGame();
    }
};

/**
 * This will read the different levels from which the user can select,
 * and then create different UI element for the user to select
 * And finally it will also add an event listener to the levelContainer
 * which will be used as event delegation method to set and create a new
 * with the level the user has selected
 */
GameControllerJs.prototype.populateLevelsDialog = function()
{
    var self = this;

    var {levels} = config;

    var levelContainer = document.getElementById('levelContainer');

    /**
     * Since adding to the live document trigger UI paint and UI render
     * it is not advisable to add all the config element to the LIVE DOM
     * instead using document fragment would modify the dom only once.
     * when the entire doc frag is inserted
     * @type {DocumentFragment}
     */
    var levelDocFrag = document.createDocumentFragment();

    levels.forEach(level =>
    {
        let levelButton = createDynamicElement('div',{
            'text':level.label,
            'classList':['level'],
            'level':level.lv
        });

        levelDocFrag.appendChild(levelButton);

        levelButton = null;
    });

    /**
     * Using event delegation for better event management
     */
    levelContainer.addEventListener('click',(event) => {
        self.handleLevelSelect(event);
    });

    /***
     * Appending the doc frag to the level container
     */
    levelContainer.appendChild(levelDocFrag);

    levelDocFrag = null;

    levelContainer = null;
};

GameControllerJs.prototype.showOrHideDiv = function(divId,show)
{
    let divToModify = document.getElementById(divId);

    if(show)
    {
        divToModify.classList.remove('hide');

        divToModify.classList.add('show');
    }
    else
    {
        divToModify.classList.remove('show');

        divToModify.classList.add('hide');
    }
};

/**
 * Since the game instance is not created upfront
 * we are not loading the Game.js during initial load
 * coz we want to reduce the load time, so if the Game.js isnt
 * present, we load the Game.js file dynamically
 * and since it's an async process, we attach an event listener on body
 * to detect when the script is loaded and then create a new game instance, and then
 * remove the listener from body.
 */
GameControllerJs.prototype.createGame = function()
{
    var self = this;

    /**
     * Destroy and clean previous game instance,
     * it should clear the events, div references,
     * closures references
     */
    self.destroyGameInstance();

    if(!window.Game)
    {
        self.showOrHideDiv('initializingGame',true);

        self.showOrHideDiv('dialog');

        self.createActionsForGame();

        let scriptTag = createDynamicElement('script',{
            'src':'./js/Game.js',
            'type':'text/javascript'
        });

        let bodyTag = document.getElementsByTagName('body')[0];

        bodyTag.appendChild(scriptTag);

        self.onLoadGame = function (event)
        {
            if (event.target.nodeName === "SCRIPT")
            {
                self.showOrHideDiv('initializingGame');

                self.gameInstance = new Game(self.configForGame);

                bodyTag.removeEventListener('load',self.onLoadGame, true);
            }
        };

        bodyTag.addEventListener('load',self.onLoadGame, true);
    }
    else
    {
        self.gameInstance = new Game(self.configForGame);
    }
};

GameControllerJs.prototype.destroy = function()
{
    "use strict";

    var self = this;

    document.getElementById('levelContainer').removeEventListener('click',self.handleLevelSelect);

    self.destroyGameInstance();

    document.getElementById('restart').removeEventListener('click',self.eventListenerForRestart);

    document.getElementsByTagName('body')[0].removeEventListener('load',self.onLoadGame, true);
}

window.GameController = new GameControllerJs();