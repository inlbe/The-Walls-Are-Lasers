//main game logic here by neilbgames
class MyGame extends Game
{
  constructor(xTiles, yTiles, xTile, yTile)
  {
    super(xTiles, yTiles, xTile, yTile);
    this.mainGameScreen = null;
    this.introGameScreen = null;
    this.levelSelectGameScreen = null;
    this.gameMaze = null;
    this.levels = [];
    this.playerLevels = null;
    this.currentPlayerLevel = null;
  }
  preload()
  {
    super.preload();
    //add shapes to be drawn onto canvas
    this.spriteShapes.push(new Array(PolyShape.RightArrow(this.gameWorld.tileX * (1/20), this.gameWorld.tileY * (1/20),
        this.gameWorld.tileX * (9/10), this.gameWorld.tileY * (9 / 10), null, "LightSeaGreen")));
    this.spriteShapes.push(new Array(PolyShape.UpArrow(this.gameWorld.tileX * (1/20), this.gameWorld.tileY * (1/20), 
        this.gameWorld.tileX * (9/10), this.gameWorld.tileY * (9/10), null, "LightSeaGreen")));
    this.spriteShapes.push(new Array(PolyShape.LeftArrow(this.gameWorld.tileX * (1/20), this.gameWorld.tileY * (1/20), 
        this.gameWorld.tileX * (9/10), this.gameWorld.tileY * (9/10), null, "LightSeaGreen")));
    this.spriteShapes.push(new Array(PolyShape.DownArrow(this.gameWorld.tileX * (1/20), this.gameWorld.tileY * (1/20),
    this.gameWorld.tileX * (9/10), this.gameWorld.tileY * (9/10), null, "LightSeaGreen")));
    this.spriteShapes.push(new Array(PolyShape.Home(this.gameWorld.tileX * (1/20), this.gameWorld.tileY * (1/20),
        this.gameWorld.tileX * (9/10), this.gameWorld.tileY * (9/10), "greenHome", "SeaGreen")));
    this.spriteShapes.push(new Array(PolyShape.Circle(this.gameWorld.tileX * (1/40),
        this.gameWorld.tileY * (3/40),this.gameWorld.tileX * (9 / 20),null, null, 
        null, "greenCircle", "SeaGreen", null, null)));
    this.spriteShapes.push(new Array(PolyShape.Circle(this.gameWorld.tileX * (1 / 3), 
        this.gameWorld.tileY * (1 /3),this.gameWorld.tileX / 6,null, null, 
        null, "greenCircleExplosion", "SeaGreen", null, null)));
    this.spriteShapes.push(new Array(PolyShape.BevelledRectangle(0, 0, this.gameWorld.tileX,
        this.gameWorld.tileY, 10, "buttonImage", "Khaki")));
    this.spriteShapes.push(new Array(PolyShape.Rectangle(this.gameWorld.tileX - 8, 4, 5, this.gameWorld.tileY - 4, "flag", "Sienna"),
        PolyShape.Rectangle(4, 4,this.gameWorld.tileX - 12, this.gameWorld.tileY / 2,
        null, "SeaGreen")));    
    this.spriteShapes.push(new Array(PolyShape.Rectangle(0, 0, this.gameWorld.tileX, 
        this.gameWorld.tileY, "background1", "Khaki")));    
    this.spriteShapes.push(new Array(PolyShape.Rectangle(0, 0, this.gameWorld.tileX, 
    this.gameWorld.tileY, "background2", "Lavender")));   
    this.spriteShapes.push(new Array(PolyShape.Circle(0, 0, this.gameWorld.tileX / 2, null, null,
        3, "playShape", "LightSeaGreen", null, null)));
    this.spriteShapes.push(new Array(PolyShape.Star((this.gameWorld.tileX * (1 / 4)),
        (this.gameWorld.tileY * (1 / 4)),0, 0,this.gameWorld.tileX / 4, this.gameWorld.tileX / 2,
        "star", "Gold")));   
    this.spriteShapes.push(new Array(PolyShape.Circle((this.gameWorld.tileX / 2) - (this.gameWorld.tileX * 0.3), 
        (this.gameWorld.tileY) - (this.gameWorld.tileY * 0.7), this.gameWorld.tileX * 0.3, Math.PI / 2,
        0, null,'redo', null, 'LightSeaGreen', 5), PolyShape.Circle(24, 6, this.gameWorld.tileX / 5, 
        null, null,
        3, null, "LightSeaGreen", null, null)));     
    this.spriteShapes.push(new Array(PolyShape.Circle((this.gameWorld.tileX / 6), 5, this.gameWorld.tileX / 3, null, null,
        null, "lock", null, "Silver", 5), PolyShape.BevelledRectangle(0, this.gameWorld.tileY / 3,
        this.gameWorld.tileX, (this.gameWorld.tileY * (2 / 3)), 5, null, "GoldenRod"),
        PolyShape.Circle(this.gameWorld.tileX * (2 / 5), this.gameWorld.tileY * (2 / 3), this.gameWorld.tileX / 10, 
        null, null, null, null, "Black", null, null),
        PolyShape.Rectangle(this.gameWorld.tileX * (7 / 16), this.gameWorld.tileY * 0.8, this.gameWorld.tileX / 8, 10, null, "black")));   
    this.spriteShapes.push(new Array(PolyShape.Circle(this.gameWorld.tileX / 4, this.gameWorld.tileX / 4, 
        this.gameWorld.tileX / 4, null, null, 3, "normalSpeed",
        "LightSeaGreen", null, null)));
    this.spriteShapes.push(new Array(PolyShape.Circle(this.gameWorld.tileX * (1 / 16), this.gameWorld.tileY / 4, 
        this.gameWorld.tileX / 4, null, null, 3, "fastSpeed",
        "LightSeaGreen", null, null), 
        PolyShape.Circle(this.gameWorld.tileX * (7 / 16), this.gameWorld.tileY / 4, 
        this.gameWorld.tileX / 4, null, null, 3, null,
        "LightSeaGreen", null, null)));    
   
    let redComp = 215;
    let greenComp = 120;
    let redInc = 4;
    let greenInc = 6;
    let laserFrames = LaserBeam.LaserFrames;
    for(let i = 0; i < 20; i++)
    {
      this.spriteShapes.push(new Array(PolyShape.LaserBeam(0, this.gameWorld.tileY / 2, 
          this.gameWorld.tileX, 2, 5, i * 0.5 , laserFrames[i], 
          'rgb(' + redComp  + ',' + greenComp + ', 0)')));
         
      if(i === 10)
      {
        redInc *= -1;
        greenInc *= -1;
      }
      
      redComp += redInc;    
      greenComp -= greenInc;
    }      
    
    this.spriteSheet = this.loadSpriteSheet();
  }
  create()
  {
    super.create();
    this.levels = this.createLevelObjects();
    this.playerLevels = [];
    this.levels.forEach((level) =>
    {
      let playerLevel = new PlayerLevel();
      playerLevel.setTo(level);
      this.playerLevels.push(playerLevel);
    });
    this.playerLevels[0].locked = false;
    this.introGameScreen = this.gameWorld.addChild(new IntroGameScreen(this));
    this.mainGameScreen = this.gameWorld.addChild(new MainGameScreen(this));
    this.levelSelectGameScreen = this.gameWorld.addChild(new LevelSelectGameScreen(this));
    this.mainGameScreen.setVisible(false);
    this.levelSelectGameScreen.setVisible(false);
    this.introGameScreen.setTransitionsTo(this.levelSelectGameScreen);
    this.levelSelectGameScreen.setTransitionsTo(this.mainGameScreen);
    this.mainGameScreen.setTransitionsTo(this.levelSelectGameScreen);
    this.introGameScreen.ready();   
    this.gameWorld.start();
  }
  update(deltaTime)
  {

  }
  createLevelObjects()
  {
    let startXGrid = 10;
    let maxFlags = 2;
    let levels = [];
    levels.push(new Level(startXGrid, 0));
    for(let i = 0; i <= this.gameWorld.xTiles - startXGrid; i+= 2)
    {
      levels.push(new Level(startXGrid + i,maxFlags + i));
    }  
    return levels;
  }
  setCompleteCurrentLevel(stars)
  {
    if(this.currentPlayerLevel.stars < stars)
    {
      this.currentPlayerLevel.stars = stars;
    }  
    this.currentPlayerLevel.completed = true;
    //unlock next level
    let index = ArrayFunctions.FindObjectIndex(this.playerLevels, this.currentPlayerLevel, null); 
    if(index  < this.playerLevels.length - 1)
    {
      this.playerLevels[index + 1].locked = false;
    }
  }
}  
class GameScreen extends Sprite
{
  //base class for all game screens
  constructor(game)
  {
    super(game, null, null,0, 0, true, false);
    this.transitionTween = this.game.gameWorld.addTween(new MoveTween(this, 0.5, 0,  Tween.CONST_SPEED, 
        new Point(this.position.x, this.position.y), 
        new Point(this.game.gameWorld.canvas.width * -1, this.position.y)));
    this.transitionsTo = null;    
    this.backgroundGroup = this.addChild(new Sprite(game, null, null, 0, 0, true, false));
    this.transitionTween.onComplete = () =>
    {
      this.setVisible(false);  
      this.transitionsTo.ready();
      this.transitionsTo.transitionTweenCallback(this.transitionTween);
      this.position.x = 0;
      this.position.y = 0;
    }; 
  }
  setTransitionsTo(transitionsTo)
  {
    this.transitionsTo = transitionsTo;
  }
  setBackground(imageFrame)
  {
    for(let i = 0; i < this.game.gameWorld.xTiles; i++)
    {
      for(let j = 0; j < this.game.gameWorld.yTiles; j++)
      {
        this.backgroundGroup.addChild(new Sprite(this.game, Sprite.SPRITE_SHEET,
            imageFrame, i * this.game.gameWorld.tileX,
            j * this.game.gameWorld.tileY, null, null));
      }  
    }  
  }
  transitionTweenCallback(tween)
  {
    //when previous screens transition is complete
  }
  configScreen(callingScreen)
  {
    //tell this screen to configure itself for displaying
    callingScreen.transitionTween.active = true;
    callingScreen.transitionsTo.setVisible(true);
  }
  ready()
  {
    //brings to top and sets transition screen beneath it
    if(this.transitionsTo)
    {  
      this.game.gameWorld.reIndexChild(this.transitionsTo, 0);
    }  
    this.game.gameWorld.reIndexChild(this, 1);
  }
  transition()
  {
    this.transitionsTo.configScreen(this);
  }
}
class IntroGameScreen extends GameScreen
{
  constructor(game)
  {
    super(game);
    this.setBackground('background2');
    let textTweenContainer = new TweenContainer();
    let theWallsText = this.addChild( new Sprite(this.game, Sprite.TEXT, 
    {font: '60px serif', text: "The Walls", fillStyle: "LightSlateGray "},
    0 , this.game.gameWorld.canvas.height , false, null));  
    theWallsText.position.x = ((this.game.gameWorld.canvas.width) / 2) -
        (theWallsText.width / 2);
    let textMoveTween1 = textTweenContainer.addTween(new MoveTween(theWallsText,2,0,Tween.CONST_ACCEL,theWallsText.position,
        new Point(theWallsText.position.x, 0)));
    textMoveTween1.active = true;
    let areText = this.addChild( new Sprite(this.game, Sprite.TEXT, 
    {font: '60px serif', text: "Are", fillStyle: "LightSlateGray "},
    0 , this.game.gameWorld.canvas.height, false, null));
    areText.position.x = ((this.game.gameWorld.canvas.width) / 2) -
        (areText.width / 2);
    let textMoveTween2 = textTweenContainer.addTween(new MoveTween(areText,2,0,Tween.CONST_ACCEL,areText.position,
        new Point(areText.position.x, this.game.gameWorld.tileY)));
    textMoveTween2.active = true;
    
    let laserText = this.addChild( new Sprite(this.game, Sprite.TEXT, 
        {font: '60px serif', text: "LASERS", fillStyle: "CRIMSON"},
        0 , this.game.gameWorld.canvas.height , false, null));  
    laserText.position.x = ((this.game.gameWorld.canvas.width) / 2) -
        (laserText.width / 2);
    let textMoveTween3 = textTweenContainer.addTween(new MoveTween(laserText,2,0,Tween.CONST_ACCEL,laserText.position,
        new Point(laserText.position.x, this.game.gameWorld.tileY * 3)));
        textMoveTween3.active = true;
    let textScaleTween = textTweenContainer.addTween(new ScaleTween(laserText,2, 0, Tween.CONST_ACCEL,laserText.scale,
        new Point(2, 2)));
    textScaleTween.active = true;    
    textTweenContainer.addTween(textScaleTween);
    let neilBGamesText = this.addChild( new Sprite(this.game, Sprite.TEXT, 
        {font: '60px serif', text: "By neilbgames", fillStyle: "LightSlateGray "},
        0 , this.game.gameWorld.canvas.height - this.game.gameWorld.tileY * 1.5 , false, null));  
    neilBGamesText.position.x = this.game.gameWorld.canvas.width -
        neilBGamesText.width;    
    neilBGamesText.scale.x = 0;
    neilBGamesText.scale.y = 0;
    let textScaleTween2 = textTweenContainer.addTween(new ScaleTween(neilBGamesText,2, 0, Tween.CONST_SPEED,
        neilBGamesText.scale, new Point(1, 1)));
    textScaleTween2.active = true;    
    textTweenContainer.addTween(textScaleTween2);
    
    this.game.gameWorld.addTween(textTweenContainer);
    
    let laserParticleEmitter = this.addChild(new ParticleEmitter(this.game, this.game.gameWorld.canvas.width / 2,
        this.game.gameWorld.canvas.height / 2, true, new ParticleSprite(this.game,Sprite.SPRITE_SHEET,
        LaserBeam.LaserFrames,0, 0, true, 2), 500, 0.5, 100, 200, 10));
    laserParticleEmitter.setEmitting(true);    
    
    let playButton = this.addChild(new PlayButton(this.game,0, 0));
    playButton.position.x = (this.game.gameWorld.canvas.width / 2) - (playButton.width / 2),
    playButton.position.y = (this.game.gameWorld.canvas.height * (5 / 8)) - (playButton.height / 2);

    playButton.events.onDown = () =>
    { 
      this.transition();
    };
  }
}
class LevelSelectGameScreen extends GameScreen
{
  constructor(game)
  {
    super(game);
    this.setBackground('background2');
    this.levelButtons = [];
    let colSpace = game.gameWorld.tileX * 6.5;
    let pad = game.gameWorld.tileX * 2;
    let rowSpace = game.gameWorld.canvas.height / 2;
    let col = -1;
    let row = 0;
    let levelButtonGroups = [];
    game.playerLevels.forEach((playerLevel, index) =>
    {
      if(index > 0 && index % 3 === 0)
      {
        row ++;
        col = 0;
      }  
      else
      {
        col ++;
      }  
      let starGroup = new StarGroup(game, this.game.gameWorld.tileX * -1, 
          this.game.gameWorld.tileX * 2);
      for(let i = 0; i < 3; i++)
      {
        let levelStar = new Star(game, i * this.game.gameWorld.tileX, 0);
        levelStar.setVisible(false);
        starGroup.stars.push(starGroup.addChild(levelStar));
      }  
      let levelButtonGroup = this.addChild(new LevelButtonGroup(game, pad + (col * colSpace),
          pad + (rowSpace * row)));
      let levelButton = levelButtonGroup.addChild(new LevelButton(game, 0, 0, playerLevel));
      levelButtonGroups.push(levelButton);
      levelButtonGroup.starGroup = levelButtonGroup.addChild(starGroup);
      if(!playerLevel.locked)
      {
        levelButton.children[0].frame = levelButton.children[0].setFrame(1);
      }
      if(playerLevel.completed)
      {
        this.setStars(starGroup, playerLevel.stars);
      }  
      levelButton.events.onDown = (pos, clickedButton) =>
      {
        if(!clickedButton.playerLevel.locked)
        {
          //start this level
          this.game.currentPlayerLevel = clickedButton.playerLevel;
          this.transition();
        }  
      };
      this.levelButtons.push(levelButton);
    });
  }
  configScreen(callingScreen)
  {
    this.levelButtons.forEach((levelButton) =>
    {
      if(!levelButton.playerLevel.locked)
      {
        //set unlocked image
        levelButton.children[0].frame = levelButton.children[0].setFrame(1);
      }  
      if(levelButton.playerLevel.completed)
      {
        this.setStars(levelButton.parent.starGroup, levelButton.playerLevel.stars);
      }  
    });
    callingScreen.transitionTween.active = true;
    callingScreen.transitionsTo.setVisible(true);
  }
  setStars(starGroup, stars)
  {
    for(let i = 0; i < stars; i++)
    {
      starGroup.stars[i].setVisible(true);
    }  
  }
}
class MainGameScreen extends GameScreen
{
  constructor(game)
  {
    super(game);
    this.mazePad = 2;
    this.setBackground('background2');
    this.laserBeamPool = new LaserBeamPool();
    this.mazeTileGroupPool = new MazeTileGroupPool();
    this.mazeOffset = 0;
    
    this.mazeSpritesGroup = this.addChild(new Sprite(this.game,null, null,0, 0, true, null)); 
    
    this.arrowGroup = this.addChild(new ArrowGroup(this.game, 0, 0));
    
    this.ballContainerGroup = this.addChild(new BallContainerGroup(this.game, 0, 0, this.arrowGroup));
    let ballGroup = this.ballContainerGroup.addChild(new BallGroup(this.game, null,null));
   
    ballGroup.createBall();
    
    this.countDownSprites = new Array();
    this.countDownTweenContainer = this.game.gameWorld.addTween(new TweenContainer());
    let countDownText = ['3','2','1','Go!'];
    this.countDownMoveTweens = [];
    this.countDownScaleTweens = [];
    countDownText.forEach((element, index) =>
    {
      let countDownSprite = new Sprite(this.game, 
          Sprite.TEXT, {font: '240px serif', text: element, fillStyle: "CRIMSON"},
          0, 0, null, null);
      countDownSprite.height = 240;    
      countDownSprite.position.x = (this.game.gameWorld.canvas.width / 2) -
          (countDownSprite.width / 2);
      countDownSprite.position.y = 0 - countDownSprite.height - this.game.gameWorld.tileY;


      this.countDownMoveTweens.push(new MoveTween(countDownSprite, 0.2, 0,Tween.CONST_SPEED,
          countDownSprite.position, new Point(countDownSprite.position.x,(this.game.gameWorld.canvas.height / 2) - 
          (countDownSprite.height / 2))));
  
      this.countDownScaleTweens.push(new ScaleTween(countDownSprite, 0.8, 0,Tween.CONST_SPEED,
          countDownSprite.scale, new Point(0,0)));
      
      this.countDownScaleTweens[this.countDownScaleTweens.length - 1].onComplete = (tween) =>
      {
        tween.sprite.setVisible(false);
        if(index === countDownText.length - 1)
        {
          //start ball
          this.ballContainerGroup.children.forEach((element) => {element.ball.setSpeed(
              element.allPaths[0].gridSquares[0].direction);});
        }
      };
      
      this.countDownTweenContainer.addTween(this.countDownMoveTweens[this.countDownMoveTweens.length - 1]);
      this.countDownTweenContainer.addTween(this.countDownScaleTweens[this.countDownScaleTweens.length - 1]);

      this.countDownSprites.push(countDownSprite);
      this.addChild(countDownSprite);
    });  
    this.replayButton = this.addChild(new ReplayButton(game, 0, 0));
    this.replayButton.position.x = (this.game.gameWorld.canvas.width) + (this.replayButton.width / 2);
    this.replayButton.position.y = (this.game.gameWorld.canvas.height * (5 / 8)) - (this.replayButton.height / 2);
    this.replayMoveTween = this.game.gameWorld.addTween(new MoveTween(this.replayButton, 2, 0, Tween.CONST_ACCEL, this.replayButton.position,
      new Point((this.game.gameWorld.canvas.width / 2) - (this.replayButton.width / 2),
          (this.game.gameWorld.canvas.height * (5 / 8)) - (this.replayButton.height / 2))));
    this.replayButton.setVisible(false);
    this.playButton = this.addChild(new PlayButton(game, 0, 0));
    this.replayButton.events.onDown = () =>
    {
      this.replayMoveTween.reInit();
      this.playMoveTween.reInit();
      this.setNewLevel(this.game.currentPlayerLevel.xGrid,
          this.game.currentPlayerLevel.maxFlags);
      this._resetCountDownTweens();
    };
    this.playButton.events.onDown = () =>
    {
      this.transition();
    };
    this.playMoveTween = this.game.gameWorld.addTween(new MoveTween(this.playButton, 2, 0, Tween.CONST_ACCEL,
        new Point(0,0), new Point(0,0)));
    this.playButton.setVisible(false);
  }
  configScreen(callingScreen)
  {
    this.setNewLevel(this.game.currentPlayerLevel.xGrid,
        this.game.currentPlayerLevel.maxFlags);
    callingScreen.transitionTween.active = true;
    callingScreen.transitionsTo.setVisible(true);
  }
  setNewLevel(xSquares, maxFlags)
  {
    this.mazeOffset = (this.game.gameWorld.canvas.width / 2) - ((xSquares * this.game.gameWorld.tileX) / 2);
    this.replayButton.setVisible(false);
    this.playButton.setVisible(false);
    this.game.gameMaze = MazeCreator.CreateMaze(xSquares, 
        this.game.gameWorld.yTiles - 1);
    this.arrowGroup.initArrowSprites();    
    this.mazeTileGroupPool.freeAll(this.mazeSpritesGroup.children);
    this.mazeSpritesGroup.removeAllChildren();
    let mazeTileGroups = this.createMazeSprites();
    for(let i = 0; i < mazeTileGroups.length; i++)
    {
      this.mazeSpritesGroup.addChild(mazeTileGroups[i]);
    }  
    this.ballContainerGroup.children[0].setBallTo(MathsFunctions.RandomIntInclusive(0, this.game.gameMaze.xSquares - 1)
        * this.game.gameWorld.tileX, MathsFunctions.RandomIntInclusive(0, this.game.gameMaze.ySquares - 1) 
        * this.game.gameWorld.tileY, maxFlags);
  }
  createMazeSprites()
  {
    let lineSides = null;
    let mazeTileGroups = new Array();
    let mazeTileGroup = null;
    let laserBeam = null;
    for(let i = 0; i < this.game.gameMaze.xSquares; i++)
    {
      for(let j = 0; j < this.game.gameMaze.ySquares; j++)
      {
        mazeTileGroup = this.mazeTileGroupPool.obtain({game:this.game,
            x: (i * this.game.gameWorld.tileX) + this.mazeOffset,
            y: this.game.gameWorld.canvas.height - (this.game.gameWorld.tileY * (j + 2)),
            laserBeamPool: this.laserBeamPool});
        mazeTileGroups.push(mazeTileGroup);   
        lineSides = this.game.gameMaze.getLineSides(i, j);
        if(lineSides[Direction.ORDER.indexOf(Direction.RIGHT)])
        {         
          laserBeam = this.laserBeamPool.obtain({game: this.game, x: (this.game.gameWorld.tileX / 2) - this.mazePad,y : 0,
              angle: Math.PI / 2});
          mazeTileGroup.addChild(laserBeam); 
        }  
        if(lineSides[Direction.ORDER.indexOf(Direction.UP)])
        {     
          laserBeam = this.laserBeamPool.obtain({game: this.game,x: 0,y: (this.game.gameWorld.tileY / -2) + this.mazePad,
              angle: Math.PI});
          mazeTileGroup.addChild(laserBeam);    
        }  
        if(i === 0)
        {
          //add left laser beam
          laserBeam = this.laserBeamPool.obtain({game: this.game,x: (this.game.gameWorld.tileX / -2) + this.mazePad,y: 0,
              angle: Math.PI / 2});
          mazeTileGroup.addChild(laserBeam); 
        }  
        if(j === 0)
        {
          //add bottom laser beam
          laserBeam = this.laserBeamPool.obtain({game: this.game,x: 0,y: (this.game.gameWorld.tileY / 2) - this.mazePad,
              angle: Math.PI * 2});
          mazeTileGroup.addChild(laserBeam); 
        }  
      }
    } 
    //return sprites; 
    return mazeTileGroups;
  }
  launchLevelButtons()
  {
    this.replayMoveTween.setStartEnd(new Point((this.game.gameWorld.canvas.width) + (this.replayButton.width / 2),
        (this.game.gameWorld.canvas.height * (5 / 8)) - (this.replayButton.height / 2)),
        new Point((this.game.gameWorld.canvas.width / 4) - (this.replayButton.width / 2),
          (this.game.gameWorld.canvas.height * (5 / 8)) - (this.replayButton.height / 2)));
    this.replayButton.setVisible(true);
    this.playMoveTween.setStartEnd(new Point((this.game.gameWorld.canvas.width) + (this.replayButton.width / 2),
        (this.game.gameWorld.canvas.height * (5 / 8)) - (this.playButton.height / 2)),
        new Point((this.game.gameWorld.canvas.width * ( 3 / 4)) - (this.playButton.width / 2),
          (this.game.gameWorld.canvas.height * (5 / 8)) - (this.playButton.height / 2)));
    this.replayButton.setVisible(true);
    this.replayMoveTween.onComplete = () =>
    {
      this.playMoveTween.active = true; 
      this.playButton.setVisible(true);
    };
    this.replayMoveTween.active = true;
  }
  transitionTweenCallback(tween)
  {
    //when previous screens transition is complete
    this._resetCountDownTweens();
  }
  _resetCountDownTweens()
  {
    this.countDownTweenContainer.tweens.forEach((tween) =>
    {
      tween.active = true;
      tween.sprite.setVisible(true);
    });
    this.countDownScaleTweens.forEach((countDownScaleTween) =>
    {
      countDownScaleTween.sprite.scale.x = 1;
      countDownScaleTween.sprite.scale.y = 1;
    });
    this.countDownMoveTweens.forEach((countDownMoveTween) =>
    {
      countDownMoveTween.sprite.position.setTo(countDownMoveTween.startPoint);
    });
  }
  pointToMazeGrid(point)
  {
    let mazePoint = new Point(point.x - this.mazeOffset, point.y);
    return this.game.gameWorld.pointToGrid(mazePoint);
  }
}

class Level
{
  constructor(xGrid, maxFlags)
  {
    this.xGrid = xGrid;
    this.maxFlags = maxFlags;
  }
}
class PlayerLevel extends Level
{
  constructor()
  {
    super(null, null);
    this.locked = true;
    this.completed = false;
    this.stars = 0;
  }
  setTo(another)
  {
    this.xGrid = another.xGrid;
    this.maxFlags = another.maxFlags;
  }
}

class Button extends Sprite
{
  constructor(game, x, y, imageFrames)
  {
    super(game, Sprite.SPRITE_SHEET, 'buttonImage', x, y, false, false);
    let image = this.addChild(new Sprite(game, Sprite.SPRITE_SHEET, imageFrames, 0, 0,
        true, false));
    this.inputEnabled = true;    
    this.scale.x = 2;
    this.scale.y = 2;
  }
}  
class PlayButton extends Button
{
  constructor(game, x, y)
  {
    super(game, x, y, 'playShape');
  }  
} 
class ReplayButton extends Button
{
  constructor(game,x, y)
  {
    super(game, x, y, 'redo');
  }
}
class LevelButtonGroup extends Sprite
{
  //holds a level button and a star group
  constructor(game, x, y)
  {
    super(game, null, null, x, y, true, null);
    this.levelButton = null;
    this.levelStarGroup = null;
  }
}
class LevelButton extends Button
{
  constructor(game, x, y, playerLevel)
  {
    super(game, x, y, ['lock', 'playShape']);
    this.playerLevel = playerLevel;
  }
}
class SpeedButton extends Button
{
  static get NORM_SPEED()
  {
    return 1;
  }
  static get HIGH_SPEED()
  {
    return 2;
  }
  constructor(game, x, y)
  {
    super(game, x, y, ['fastSpeed', 'normalSpeed']);
    this.scale.x = 1;
    this.scale.y = 1;
    this.events.onDown = () =>
    {
      let frameIndex = this.children[0].frameIndex;
      if(frameIndex === 1)
      {
        frameIndex = 0;
        this.onSpeedSet(SpeedButton.NORM_SPEED);
      }  
      else
      {
        frameIndex = 1;
        this.onSpeedSet(SpeedButton.HIGH_SPEED);
      }  
      this.children[0].setFrame(frameIndex);
    };
    this.onSpeedSet = null;
  }
}
class ArrowSpritePool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new ArrowSprite(objectArgs.game, objectArgs.frames,
        objectArgs.x, objectArgs.y, objectArgs.direction,
        objectArgs.master);
  }
}

class ArrowSprite extends Sprite
{
  constructor(game,frames, x, y, direction, master)
  {
    super(game,Sprite.SPRITE_SHEET,frames, x, y, null, null);
    this.fixed = true;
    this.direction = direction;
    if(!master)
    {
      this.master = false;
    }  
    else
    {
      this.master = master;
    }  
    this.inputEnabled = true;
    this.events.onDown = (position) =>
    {
      if(this.master)
      {  
        //create new arrow to drag around
        this.parent.draggingArrow = this.parent.addChild(this.parent.arrowSpritePool.obtain({game: this.game, 
            type: Sprite.SPRITE_SHEET, frames: this.frame, x:this.game.gameWorld.pointerPos.x, 
            y: this.game.gameWorld.pointerPos.y, direction: this.direction}));
      }   
      else
      {
        //drag this arrow around
        this.parent.draggingArrow = this;
        let snapGrid = this.game.mainGameScreen.pointToMazeGrid(this.parent.draggingArrow.centre);
        this.game.gameMaze.setArrowSprite(snapGrid.x, this.game.gameMaze.ySquares - 1 - snapGrid.y,
            null);
        this.parent.onArrowTaken(this, snapGrid);
      }  
    };  
    this.rotateTween = this.game.gameWorld.addTween(new RotateTween(this, 0.2, 1, Tween.CONST_ACCEL, Math.PI / 8)); 
    this.scaleTween = this.game.gameWorld.addTween(new ScaleTween(this,0.2, 1,
           Tween.CONST_ACCEL, this.scale, new Point(0.5, 0.5)));
  }
  reset()
  {
    super.reset();
    this.inputEnabled = true;
  }
  set(objectArgs)
  {
    super.set(objectArgs);
    this.direction = objectArgs.direction;
    if(!objectArgs.master)
    {
      this.master = false;
    }  
    else
    {
      this.master = objectArgs.master;
    }  
  }
}

class ArrowGroup extends Sprite
{
  constructor(game, x, y)
  {
    super(game, null, null, x, y, null, null);
    this.inputEnabled = true;
    this.arrowSpritePool = new ArrowSpritePool();
    this.draggingArrow = null;
    this.rightArrow= null;
    this.upArrow = null;
    this.leftArrow = null;
    this.downArrow = null;
    this.speedButton = new SpeedButton(this.game, 0, 0);
   
    this.events.onWorldUp = (position) =>
    {
      if(this.draggingArrow)
      {
        //snap to grid
        let snapGrid = this.game.mainGameScreen.pointToMazeGrid(this.draggingArrow.centre);
        if(snapGrid.y < this.game.gameMaze.ySquares && snapGrid.y >= 0 && 
            snapGrid.x < this.game.gameMaze.xSquares && snapGrid.x >= 0)
        {  
          let arrowGridSprite = this.game.gameMaze.getArrowSprite(snapGrid.x, this.game.gameMaze.ySquares - 1 - snapGrid.y);
          if(!arrowGridSprite)
          {  
            this.game.gameMaze.setArrowSprite(snapGrid.x, this.game.gameMaze.ySquares - 1 - snapGrid.y,
                this.draggingArrow);
            this.draggingArrow.position.x = (snapGrid.x * this.game.gameWorld.tileX) + this.game.mainGameScreen.mazeOffset;
            this.draggingArrow.position.y = snapGrid.y * this.game.gameWorld.tileY;  
            this.draggingArrow.rotateTween.active = true;
            this.draggingArrow.scaleTween.active = true;  
            this.onArrowPlaced(this.draggingArrow, snapGrid);
          }  
          else if(arrowGridSprite.direction !== this.draggingArrow.direction)
          { 
            //replace grid arrow with dragging arrow
            this.game.gameMaze.setArrowSprite(snapGrid.x, this.game.gameMaze.ySquares - 1 - snapGrid.y,
                this.draggingArrow);
            this.draggingArrow.position.x = (snapGrid.x * this.game.gameWorld.tileX) + this.game.mainGameScreen.mazeOffset;
            this.draggingArrow.position.y = snapGrid.y * this.game.gameWorld.tileY;     
            this.removeChild(arrowGridSprite);
            this.arrowSpritePool.free(arrowGridSprite);
            this.draggingArrow.rotateTween.active = true;
            this.draggingArrow.scaleTween.active = true;
            this.onArrowPlaced(this.draggingArrow, snapGrid);
            this.onArrowPlaced(this.draggingArrow, snapGrid);
          }  
          else
          {  
            this.removeChild(this.draggingArrow);
            this.arrowSpritePool.free(this.draggingArrow);
          }
          this.draggingArrow = null;
        }
        else
        {
          this.removeArrow(this.draggingArrow);
          this.draggingArrow = null;
        }  
      }  
    };
    this.onArrowPlaced = null;
    this.onArrowTaken = null;
  }
  update(deltaTimeSec)
  {
    if(this.draggingArrow)
    {
      this.draggingArrow.position.x = this.game.gameWorld.pointerPos.x;
      this.draggingArrow.position.y = this.game.gameWorld.pointerPos.y;
    }  
  }
  initArrowSprites()
  {
    this.setVisible(true);
    this.draggingArrow = null;
    this.removeChild(this.speedButton);// prevent adding to pool
    this.arrowSpritePool.freeAll(this.children);
    this.removeAllChildren();
    let xPad = ((this.game.gameWorld.tileX * (this.game.gameMaze.xSquares / 2)) - 2 * this.game.gameWorld.tileX) +
        this.game.mainGameScreen.mazeOffset;
    
    this.rightArrow = this.addChild(this.arrowSpritePool.obtain({game: this.game, type: Sprite.SPRITE_SHEET,
        frames: "rightArrow",
        y: (this.game.gameWorld.yTiles - 1) * this.game.gameWorld.tileY ,x: xPad, 
        direction: Direction.RIGHT, master: true}));
   
    this.upArrow = this.addChild(this.arrowSpritePool.obtain({game: this.game, type: Sprite.SPRITE_SHEET, frames: "upArrow", 
        y: (this.game.gameWorld.yTiles - 1) * this.game.gameWorld.tileY , x: (this.game.gameWorld.tileX * 2)+ xPad, 
        direction: Direction.UP, master: true}));
  
    this.leftArrow = this.addChild(this.arrowSpritePool.obtain({game: this.game, type: Sprite.SPRITE_SHEET, frames: "leftArrow",
        y: (this.game.gameWorld.yTiles - 1) * this.game.gameWorld.tileY , x: this.game.gameWorld.tileX + xPad,
        direction: Direction.LEFT, master: true}));
    
    this.downArrow = this.addChild(this.arrowSpritePool.obtain({game: this.game, type: Sprite.SPRITE_SHEET, frames: "downArrow",
        y: (this.game.gameWorld.yTiles - 1) * this.game.gameWorld.tileY ,x: (this.game.gameWorld.tileX * 3) + xPad, 
        direction: Direction.DOWN, master: true}));   
      
    this.addChild(this.speedButton);  
    this.speedButton.position.x = (this.game.gameWorld.tileX * 6) + xPad;
    this.speedButton.position.y = (this.game.gameWorld.yTiles - 1) * this.game.gameWorld.tileY;
    this.speedButton.children[0].setFrame(0);
  }
  removeArrow(arrow)
  {
    this.removeChild(arrow);
    this.arrowSpritePool.free(arrow);
  }
}
class FlagSpritePool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new FlagSprite(objectArgs.game,
        objectArgs.x, objectArgs.y);
  }
}
class FlagSprite extends Sprite
{
  static get FRAME()
  {
    return 'flag';
  }
  constructor(game,x, y)
  {
    super(game, Sprite.SPRITE_SHEET, FlagSprite.FRAME, x, y, true, false);     
    this.moveTween = this.game.gameWorld.addTween(new MoveTween(this, 1, 0, Tween.CONST_ACCEL,
        this.position, this._getTweenToPosition(MathsFunctions.RandomFloat(0, Math.PI * 2))));
    this.moveTween.onComplete = () =>
    {
      this.parent.removeFlag(this);
    };
  }  
  set(objectArgs)
  {
    super.set(objectArgs);
    this.moveTween.setStartEnd(this.position, this.moveTween.endPoint);
    this.alpha = 1;
  }
  _getTweenToPosition(angle)
  {
    let tweenDiag = Math.sqrt(Math.pow(Math.abs(this.game.gameWorld.canvas.width - this.position.x) + this.width, 2) +
        Math.pow(Math.abs(this.game.gameWorld.canvas.height - this.position.y) + this.height, 2));
    return new Point(this.position.x + (Math.cos(angle) * tweenDiag), 
        this.position.y + (Math.sin(angle) * tweenDiag));
  }
}
class MazeTileGroupPool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new MazeTileGroup(objectArgs.game,
        objectArgs.x, objectArgs.y, objectArgs.laserBeamPool);
  }
}
class MazeTileGroup extends Sprite
{
  constructor(game, x, y, laserBeamPool)
  {
    super(game, null, null, x, y, true, null);
    this.laserBeamPool = laserBeamPool;
  }
  reset()
  {
    super.reset();
    this.fixed = true;
    this.children.forEach((laserBeam) =>
    {
      this.laserBeamPool.free(laserBeam);
    }); 
    this.removeAllChildren();
  }
}
class LaserBeamPool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new LaserBeam(objectArgs.game,
        objectArgs.x, objectArgs.y, objectArgs.angle);
  }
}  
class LaserBeam extends Sprite
{
  static get LaserFrames()
  {
    let laserFrames = new Array();
    for(let i = 0; i < 20; i++)
    {
      let frameNum = '0' + i;
      laserFrames.push('laserBeam' + frameNum.substr(frameNum.length - 2));
    }  
    return laserFrames;
  }  
  constructor(game,x, y, angle)
  {
    super(game, Sprite.SPRITE_SHEET, LaserBeam.LaserFrames,x, y, true, true);
    this.angle = angle;
  }
  reset()
  {
    super.reset();
    this.fixed = true;
  }
  set(objectArgs)
  {
    super.set(objectArgs);
    this.angle = (objectArgs.angle);
  }
}

class Ball extends Sprite
{
  constructor(game, frame, x, y)
  {
    super(game, Sprite.SPRITE_SHEET, frame, x, y, null, null);
    this.normalSpeed = this.width / 2;
    this.moveSpeed = this.normalSpeed;
    this.direction = Direction.NONE;
    this.enteringGrid = new Point(0, 0);
    this.currentGrid = new Point(0, 0);
    this.turnsCount = 1;
    
  }
  update(deltaTimeSec)
  {
    super.update(deltaTimeSec);
    this._checkGrid();
  }
  _checkGrid()
  {
    //find out which grid we are in
    let newGrid = this.game.mainGameScreen.pointToMazeGrid(this.centre);
    if(!newGrid.compare(this.currentGrid))
    {
      this.currentGrid.setTo(newGrid);
    }  
    let enteredGrid = false;
    //check right if moving right
    if(this.speed.x > 0)
    {  
      if(Math.floor((this.centre.x - this.game.mainGameScreen.mazeOffset + (this.width / 2)) / this.game.gameWorld.tileX) 
           >  this.currentGrid.x)
      {
        //entering new grid to right
        if(this.enteringGrid.x <= this.currentGrid.x)
        {
          this.enteringGrid.x = this.currentGrid.x + 1;
          enteredGrid = true;
        }  
      }
    }
    //check up if moving up
    else if(this.speed.y < 0)
    {  
      if(Math.floor((this.centre.y - (this.width / 2)) / this.game.gameWorld.tileY) <
          this.currentGrid.y)
      {
        //entering new grid to top
        if(this.enteringGrid.y >= this.currentGrid.y)
        {
          //console.log("entering new grid");
          this.enteringGrid.y = this.currentGrid.y - 1;
          enteredGrid = true;
        }  
      }
    }  
    //check left if moving left
    if(this.speed.x < 0)
    {  
      if(Math.floor((this.centre.x - this.game.mainGameScreen.mazeOffset - (this.width / 2)) / this.game.gameWorld.tileX) < this.currentGrid.x)
      {
        //entering new grid to right
        if(this.enteringGrid.x >= this.currentGrid.x)
        {
          this.enteringGrid.x = this.currentGrid.x - 1;
          enteredGrid = true;
        }  
      }
    }
    //check down if moving down
    else if(this.speed.y > 0)
    {  
      if(Math.floor((this.centre.y + (this.width / 2)) / this.game.gameWorld.tileY) >
          this.currentGrid.y)
      {
        //entering new grid to top
        if(this.enteringGrid.y <= this.currentGrid.y)
        {
          this.enteringGrid.y = this.currentGrid.y + 1;
          enteredGrid = true;
        }  
      }
    }  
    if(enteredGrid)
    {
      //check if home
      if(this.game.mainGameScreen.pointToMazeGrid(
          this.parent.ballHome.centre).compare(this.currentGrid)
          && !this.parent.ballHomeLocked)
      {
        //made it home
        this.parent.homeMoveTween.active = true;
        this.parent.scaleHomeTween.active = true;
        this.speed.x = 0;
        this.speed.y = 0;
        this.setVisible(false);
        this.direction = Direction.NONE;
        this.game.mainGameScreen.arrowGroup.setVisible(false);
      }  
      let arrowSprite = this.game.gameMaze.getArrowSprite(this.currentGrid.x,
          this.game.gameMaze.ySquares - 1 - this.currentGrid.y);
      if(arrowSprite)
      {
        //direction arrow found on square
        this.pickUpArrow(arrowSprite);
      } 
      let flagSprite = this.game.gameMaze.getFlagSprite(this.currentGrid.x,
          this.game.gameMaze.ySquares - 1 - this.currentGrid.y);
      if(flagSprite)    
      {
        this.pickUpFlag(flagSprite);
      }    
      //now check for wall collisions
      let lineSides = this.game.gameMaze.getLineSides(this.currentGrid.x,
          this.game.gameMaze.ySquares - 1 - this.currentGrid.y);
      if(this.speed.x > 0)
      {
        //check for wall to right
        if(lineSides[Direction.ORDER.indexOf(Direction.RIGHT)])
        {
          //hit wall to right
          this.doHitWall();
        }  
      }  
      else if(this.speed.y < 0)
      {
        //check for wall above
        if(lineSides[Direction.ORDER.indexOf(Direction.UP)])
        {
          //hit wall to right
          this.doHitWall();
        }  
      }  
      else if(this.speed.x < 0)
      {
        //check for wall above
        if(lineSides[Direction.ORDER.indexOf(Direction.LEFT)])
        {
          //hit wall to right
          this.doHitWall();
        }  
      }  
      else if(this.speed.y > 0)
      {
        //check for wall above
        if(lineSides[Direction.ORDER.indexOf(Direction.DOWN)])
        {
          //hit wall below
          this.doHitWall();
        }  
      }  
    }    
  }
  reset()
  {
    super.reset();
    this.direction = Direction.NONE;
    this.setVisible(true);
    this.turnsCount = 1;
    this.moveSpeed = this.normalSpeed;
  }
  set(objectArgs)
  {
    super.set(objectArgs);
    this.currentGrid.setTo(this.game.mainGameScreen.pointToMazeGrid(this.position));
    this.enteringGrid.setTo(this.currentGrid);
  }
  doHitWall()
  {
    this.speed.x = 0;
    this.speed.y = 0;
    this.setVisible(false);
    this.parent.ballExplosion.position.x = this.position.x;
    this.parent.ballExplosion.position.y = this.position.y;
    this.parent.ballExplosion.setEmitting(true);
    this.game.mainGameScreen.arrowGroup.setVisible(false);
    this.parent.ballExplosion.onFinished = () =>
    {
      this.game.mainGameScreen.launchLevelButtons();
    };
  }
  pickUpArrow(arrowSprite)
  {
    if(arrowSprite.direction !== this.direction)
    {  
      this.setSpeed(arrowSprite.direction);
      this.turnsCount ++;
    }  
    this.game.mainGameScreen.arrowGroup.removeArrow(arrowSprite);
    this.game.gameMaze.setArrowSprite(this.currentGrid.x,
        this.game.gameMaze.ySquares - 1 - this.currentGrid.y, null);  
    this._reCentre(); 
  }
  pickUpFlag(flagSprite)
  {
    this.game.gameMaze.setFlagSprite(this.currentGrid.x,
        this.game.gameMaze.ySquares - 1 - this.currentGrid.y, null);
    flagSprite.moveTween.active = true;    
  }
  setSpeed(direction)
  {
    if(direction)
    {
      this.direction = direction;
    }  
    let point = this.game.gameMaze.directionObj.directions
    [Direction.ORDER.indexOf(this.direction)].point;
    this.speed.x = point.x * this.moveSpeed;
    this.speed.y = point.y * -this.moveSpeed;
  }
  _reCentre()
  {
    //centre to current grid
    this.position.x = (this.currentGrid.x * this.game.gameWorld.tileX) + this.game.mainGameScreen.mazeOffset;
    this.position.y = this.currentGrid.y * this.game.gameWorld.tileY;
  }
}
class Star extends Sprite
{
  static get FRAME()
  {
    return 'star';
  }
  constructor(game, x, y)
  {
    super(game,Sprite.SPRITE_SHEET, Star.FRAME, x, y, true, false);
    this.moveTween = null;
  }
}  
class StarGroup extends Sprite
{
  constructor(game, x, y)
  {
    super(game, null, null, x, y, true, false);
    this.stars = [];
  }
}
class GameStarGroup extends StarGroup
{
  static get THREE_STARS()
  {
    return 1;
  }
  static get TWO_STARS()
  {
    return 0.95;
  }
  constructor(game, x, y)
  {
    super(game, x, y);
    this.tweenContainer = new TweenContainer();
    let angle = (3/4) * Math.PI;
    let angleInc = (Math.PI / -4);
    let dis = this.game.gameWorld.tileX * 3;
    for(let i = 0; i < 3; i++)
    {
      let star = this.addChild(new Star(game, 0, 0));
      star.moveTween = this.tweenContainer.addTween(new MoveTween(star, 1, 0, Tween.CONST_ACCEL, new Point(0,0),
          new Point(Math.cos(angle + (i * angleInc)) * dis,
          -Math.sin(angle + (i * angleInc)) * dis)));
      star.setVisible(false);
      star.moveTween.onComplete = (tween) =>
      {
        let tweenIndex = ArrayFunctions.FindObjectIndex(tween.sprite.parent.tweenContainer.tweens, tween, null);
        if(tweenIndex < tween.sprite.parent.tweenContainer.tweens.length -1)
        {
          if(tween.sprite.parent.tweenContainer.tweens[tweenIndex + 1].active)
          {  
            tween.sprite.parent.tweenContainer.tweens[tweenIndex + 1].sprite.setVisible(true);
          }  
          else
          {
            //launch buttons
            this.game.mainGameScreen.launchLevelButtons();
          }  
        }  
        else
        {
          //launch buttons
          this.game.mainGameScreen.launchLevelButtons();
        }  
      };
    }
    this.game.gameWorld.addTween(this.tweenContainer);
  }
  launchStars(turnsRatio)
  { 
    let launchStars = 1;
    if(turnsRatio === GameStarGroup.THREE_STARS)
    {
      //launch three stars
      launchStars = 3;
    }  
    else if(turnsRatio > GameStarGroup.TWO_STARS)
    {
      //launch two stars
      launchStars = 2;
    }   
    //set this level to complete, unlock next
    this.game.setCompleteCurrentLevel(launchStars);
    this.children[0].setVisible(true);
    for(let i = 0; i < launchStars; i++)
    {
      this.children[i].moveTween.active = true;
    }  
  }
  reset()
  {
    this.children.forEach((star) =>
    {
      star.setVisible(false);
    });
    this.setVisible(true);
  }
}
class BallContainerGroup extends Sprite
{
  //container for ball groups
  constructor(game, x, y, arrowGroup)
  {
    super(game, null, null, x, y,null, null);
    this.flagSpritePool = new FlagSpritePool();    
    arrowGroup.onArrowPlaced = (arrowSprite, gridPos) =>
    {
      let flagSprite = this.game.gameMaze.getFlagSprite(gridPos.x,
          this.game.gameMaze.ySquares - 1 - gridPos.y);
      if(flagSprite)    
      {
        //make flag slightly see through
        flagSprite.alpha = 0.8;
      }    
    };
    //has arrow been picked up and moved
    arrowGroup.onArrowTaken = (arrowSprite, gridPos) =>
    {
      let flagSprite = this.game.gameMaze.getFlagSprite(gridPos.x,
            this.game.gameMaze.ySquares - 1 - gridPos.y);
      if(flagSprite)    
      {
        //set alpha back to 1
        flagSprite.alpha = 1;
      }    
    };
    arrowGroup.speedButton.onSpeedSet = (speed) =>
    {
        //set balls to high speed
      this.children.forEach((child) =>
      {
        child.ball.moveSpeed = child.ball.normalSpeed * speed;
        child.ball.setSpeed(null);
      });
    };  
  }  
}
class BallGroup extends Sprite
{
  //each ball group has a ball, a home, and optional waypoint flags
  constructor(game, x, y)
  {
    super(game, null, null,x , y, true, null);
    this.ball = null;
    this.ballHome = null;
    this.ballExplosion = this.addChild(new ParticleEmitter(this.game, 0, 0, true,
    new ParticleSprite(this.game, Sprite.SPRITE_SHEET,"greenCircleExplosion",
        0, 0, false, 3),25,0.05,75,200,5));
    this.ballScaleTween = null;
    this.ballHomeTweenContainer = null;
    this.scaleHomeTween = null;
    this.homeMoveTween = null;
    this.ballHomePath = null;
    this.minTurns = 0;
    this.allPaths = [];
    this.flags = [];
    this.ballHomeLocked = false;
    this.ballHomeAlphaTween = null;
  }
  createBall()
  {
    //create all ball related objects
    this.ball = new Ball(this.game, "greenCircle",
    0, 0);
        
    this.ballHome = new Sprite(this.game, Sprite.SPRITE_SHEET, "greenHome", 
        0, 0, true, null); 
    this.ballHome.alpha = 0.2;    
    this.ballHomeAlphaTween = this.game.gameWorld.addTween(
        new AlphaTween(this.ballHome,2,0,Tween.CONST_ACCEL,this.ballHome.alpha,
        1));    
    
    this.ballHome.addChild(new GameStarGroup(this.game,0, 0));
    this.addChild(this.ballHome); 
    this.ballExplosion = this.addChild(new ParticleEmitter(this.game, 0, 0, true,
        new ParticleSprite(this.game, Sprite.SPRITE_SHEET,"greenCircleExplosion",
        0, 0, false, 3),25,0.05,75,200,5));   
        
    this.ballScaleTween = this.game.gameWorld.addTween(new ScaleTween(this.ball,0.5, -1,
        Tween.CONST_ACCEL, this.ball.scale, new Point(0.9, 0.9)));
    this.ballScaleTween.active = true;  
    this.addChild(this.ball);
    this.ballHomeTweenContainer = this.game.gameWorld.addTween(new TweenContainer());
        
    this.homeMoveTween = this.ballHomeTweenContainer.addTween(new MoveTween(this.ballHome, 3, 0, Tween.CONST_ACCEL,
        this.ballHome.position, new Point(0,0)));    
        
    this.scaleHomeTween = this.ballHomeTweenContainer.addTween(new ScaleTween(this.ballHome, 3, 0, Tween.CONST_ACCEL,
        this.ballHome.scale, new Point(3, 3)));
    this.scaleHomeTween.onComplete = (tween) =>
    {
      tween.sprite.children[0].launchStars(this.minTurns / this.ball.turnsCount);
    };
  }
  removeFlag(flagSprite)
  {
    this.parent.flagSpritePool.free(flagSprite);  
    this.removeChild(flagSprite);
    this.flags.splice(ArrayFunctions.FindObjectIndex(
    this.flags, flagSprite, null), 1);
    if(this.flags.length === 0 && this.ballHomeLocked)
    {
      this.ballHomeLocked = false;
      this.ballHomeAlphaTween.active = true;
    }  
  }
  setBallTo(x, y, flags)
  {
    this.ball.reset();
    this.ball.set({x: x + this.game.mainGameScreen.mazeOffset, 
        y: y });
    let ballPoint = new Point(this.ball.currentGrid.x ,
          this.game.gameMaze.ySquares - 1 - this.ball.currentGrid.y);
    let ballGridPaths = MazeCreator.GetMazeGridPaths(this.game.gameMaze, new Point(ballPoint.x,
        ballPoint.y));      
    let homePathIndex = ArrayFunctions.FindArrayMaxIndex(ballGridPaths,
            (element) => {return element.gridSquares.length;});      
    this.ballHomePath = ballGridPaths[homePathIndex];     
    let homeGridSquare = this.ballHomePath.gridSquares[this.ballHomePath.gridSquares.length - 1];
    if(flags === 0)
    {  
      this.ballHome.alpha = 1;
      this.ballHomeLocked = false;
    }
    else 
    {
      this.ballHome.alpha = 0.2;
      this.ballHomeLocked = true;
    }  

    this.ballHome.scale.x = 1;
    this.ballHome.scale.y = 1;
    this.ballHome.position.x = (homeGridSquare.position.x * this.game.gameWorld.tileX) + this.game.mainGameScreen.mazeOffset;
    this.ballHome.position.y = (this.game.gameMaze.ySquares - 1 - homeGridSquare.position.y) * this.game.gameWorld.tileY;
    this.ballHome.children[0].reset();
    
    this.homeMoveTween.setStartEnd(this.ballHome.position, 
        new Point((this.game.gameWorld.canvas.width / 2) - (this.ballHome.width / 2),
        (this.game.gameWorld.canvas.height / 2) - (this.ballHome.height / 2)));
    
    this.flags.forEach((flagSprite) =>
    {
      this.parent.flagSpritePool.free(flagSprite);  
      this.removeChild(flagSprite);
    });
    
    this.flags.length = 0;
    
    this.allPaths.length = 0;
    this.minTurns = 0;
    
    let forkedIndexes = MazeCreator.FindForks(this.ballHomePath, ballGridPaths);
    //sort forked paths by grid squares in ascending order
    let lastRanNum = -1;
    let lastPoint = new Point(0,0);
    if(forkedIndexes.length < flags)
    {
      flags = forkedIndexes.length;
    }  
    for(let i = 0; i < flags; i++)
    {
      let ranNum = MathsFunctions.RandomInt(lastRanNum + 1, forkedIndexes.length - 
          (flags - i));
      let flagSprite = (this.addChild(this.parent.flagSpritePool.obtain({game: this.game, 
          x: (forkedIndexes[ranNum].forkedPath.gridSquares[forkedIndexes[ranNum].forkedPath.gridSquares.length - 1].position.x * this.game.gameWorld.tileX) +
          this.game.mainGameScreen.mazeOffset,
          y: (this.game.gameMaze.ySquares - 1 - forkedIndexes[ranNum].forkedPath.gridSquares[forkedIndexes[ranNum].forkedPath.gridSquares.length - 1].position.y) 
          * this.game.gameWorld.tileY})));
      this.game.gameMaze.setFlagSprite(forkedIndexes[ranNum].forkedPath.gridSquares[forkedIndexes[ranNum].forkedPath.gridSquares.length - 1].position.x,
          forkedIndexes[ranNum].forkedPath.gridSquares[forkedIndexes[ranNum].forkedPath.gridSquares.length - 1].position.y, flagSprite);
      this.flags.push(flagSprite);
      lastRanNum = ranNum;
      if(this.allPaths.length === 0)
      {
        lastPoint.setTo(forkedIndexes[ranNum].forkedPath.gridSquares[0].position);
      }  
      else
      {
        lastPoint = this.allPaths[this.allPaths.length - 1].gridSquares
            [this.allPaths[this.allPaths.length - 1].gridSquares.length - 1].position;
      }  
      this.allPaths.push(MazeCreator.GetMazeGridPath(this.game.gameMaze,
          lastPoint, 
          forkedIndexes[ranNum].forkedPath.gridSquares[forkedIndexes[ranNum].forkedPath.gridSquares.length - 1].position, null));
    }  
    if(this.allPaths.length === 0)
    {
      this.allPaths.push(this.ballHomePath);
    }  
    else
    {
      this.allPaths.push(MazeCreator.GetMazeGridPath(this.game.gameMaze,
          this.allPaths[this.allPaths.length - 1].gridSquares
          [this.allPaths[this.allPaths.length - 1].gridSquares.length - 1].position,
          homeGridSquare.position, null));
    }  
    //calculate minimum number of arrows required
    let lastDirectionChange = Direction.NONE;
    this.minTurns = 0;
    this.allPaths.forEach((gridPath) =>
    {
      gridPath.gridSquares.forEach((gridSquare) =>
      {
        if(gridSquare.direction !== lastDirectionChange)
        {
          this.minTurns ++;
          lastDirectionChange = gridSquare.direction;
        };  
      });
      this.minTurns --;
    });
  }
}
var myGame = new MyGame(18, 10, 64, 64);    
myGame.preload();


