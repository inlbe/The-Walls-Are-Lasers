//A Simple game framework by neilbgames
class GameWorld
{
  //Handles mouse input, rendering sprites, tweens
  constructor(xTiles, yTiles, tileX, tileY)
  {
    this.canvas = document.createElement("canvas");
    this.canvas.width = tileX * xTiles;
    this.canvas.height = tileY * yTiles;    
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.marginLeft = "auto";
    this.canvas.style.marginRight = "auto";
    this.canvas.style.display = "block";
    this.xTiles = xTiles;
    this.yTiles = yTiles;
    document.body.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.pause = false;
    this.tileX = tileX;
    this.tileY = tileY;
    this.children = new Array();
    this.tweens = new Array();
    this.game = null;
    this.timeRef = 0;
    this.renderSprites = new Array();
    this.interval = 0;
    this.events =
    {
      onDown:null,
      onUp:null
    };  
    this.pointerPos = new Point(0, 0);
    this.canvas.onmousemove = (event) =>
    {
      this.pointerPos = this.getMousePos(event);
    };
    this.canvas.onmouseup  = (event) =>
    {
      this._doMouseUp(event);
    };  
    this.canvas.onmouseout  = (event) =>
    {
      this._doMouseUp(event);
    }; 
    this.canvas.onmousedown = (event) =>
    {
      let position = this.getMousePos(event);
      this.renderSprites.some((renderSprite) =>
      {
        if(renderSprite.events.onDown && renderSprite.inputEnabled &&
            position.x > (renderSprite.centre.x - (renderSprite.scale.x *
            (renderSprite.width / 2))) && position.x < 
            (renderSprite.centre.x  + (renderSprite.scale.x * 
            (renderSprite.width / 2))) &&
            position.y > (renderSprite.centre.y - (renderSprite.scale.y * 
            ((renderSprite.height / 2)))) && position.y < 
            (renderSprite.centre.y + (renderSprite.scale.y * 
            (renderSprite.height / 2))))
        {
          //sprite clicked
          renderSprite.events.onDown(position, renderSprite);
          return true;
        }
      });
      //send on world down event to all input enabled render sprites
      this.renderSprites.forEach((renderSprite) =>
      {
        if(renderSprite.events.onWorldDown && renderSprite.inputEnabled)
        {
          renderSprite.events.onWorldDown(position);
        }  
      });
      if(this.events.onDown)
      {  
        this.events.onDown(position);
      } 
    };
         
  }  
  _doMouseUp(event)
  {
    let position = this.getMousePos(event);
    this.renderSprites.some((renderSprite) =>
    {
      if(renderSprite.events.onUp && renderSprite.inputEnabled &&
          position.x > renderSprite.worldPosition.x && position.x < 
          (renderSprite.worldPosition.x + renderSprite.width) &&
          position.y > renderSprite.worldPosition.y && position.y < 
          (renderSprite.worldPosition.y + renderSprite.height))
      {
        //sprite mouse up
        renderSprite.events.onUp(position, renderSprite);
        return true;
      }
    });
    //send on world up event to all input enabled render sprites
    this.renderSprites.forEach((renderSprite) =>
    {
      if(renderSprite.events.onWorldUp && renderSprite.inputEnabled)
      {
        renderSprite.events.onWorldUp(position);
      }  
    });
    if(this.events.onUp)
    {  
      this.events.onUp(position);
    }  
  }
  getMousePos(event) 
  {
    let rect = this.canvas.getBoundingClientRect();
    return new Point(event.clientX - rect.left, event.clientY - rect.top);
  }
  start() 
  {
    this.interval = setInterval(this.render.bind(this), 16.666);
    this.timeRef = Date.now();
  }
  stop()
  {
    clearInterval(this.interval);
    this.pause = true;
  }
  clear()
  {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  render()
  {
    this.clear();
    let time = Date.now();
    let deltaTime = time - this.timeRef;
    let deltaTimeSec = deltaTime / 1000;
    this.timeRef = time; 
    for(let i = 0; i < this.tweens.length; i++)
    {  
      if(this.tweens[i].tweens)
      {
        //chain the tweens
        for(let j = 0; j < this.tweens[i].tweens.length; j++)
        {
          if(this.tweens[i].tweens[j].active)
          {
            this.tweens[i].tweens[j].update(deltaTimeSec);
            break;
          }  
        }  
      }  
      else
      {  
        this.tweens[i].update(deltaTimeSec);
      }  
    }  
    this.renderSprites.forEach((renderSprite) =>
    {
      let worldX = renderSprite.position.x;
      let worldY = renderSprite.position.y;
      let spriteParent = renderSprite.parent;
      while(spriteParent !== this)
      {
        worldX += spriteParent.position.x;
        worldY += spriteParent.position.y;
        spriteParent = spriteParent.parent;
      }
      renderSprite.worldPosition.x = worldX;
      renderSprite.worldPosition.y = worldY;
      if(!renderSprite.fixed)
      {
        renderSprite.position.x += renderSprite.speed.x * deltaTimeSec;
        renderSprite.position.y += renderSprite.speed.y * deltaTimeSec;
      }  
      this.ctx.save();
      this.ctx.translate(renderSprite.worldPosition.x + renderSprite.width * 0.5, 
      renderSprite.worldPosition.y + renderSprite.height * 0.5);
      this.ctx.rotate(renderSprite.angle);
      this.ctx.scale(renderSprite.scale.x,renderSprite.scale.y);
      this.ctx.globalAlpha = renderSprite.alpha;
      if(renderSprite.type === Sprite.SPRITE_SHEET)
      {          
        this.ctx.drawImage(this.game.spriteSheet.image,renderSprite.frameRectangle.position.x,
            renderSprite.frameRectangle.position.y,renderSprite.frameRectangle.width,
            renderSprite.frameRectangle.height, renderSprite.width * -0.5, 
            renderSprite.height * -0.5,
            renderSprite.frameRectangle.width, renderSprite.frameRectangle.height);     
      }    
      else if(renderSprite.type === Sprite.POLY_SHAPE)
      {
        CanvasFunctions.DrawPolygon(this.ctx, renderSprite.width * -0.5, 
            renderSprite.height * -0.5,
            renderSprite.frame.points, renderSprite.frame.fillStyle, null, null);
      }  
      else if(renderSprite.type === Sprite.TEXT)
      {
        this.ctx.font = renderSprite.frame.font;
        this.ctx.fillStyle = renderSprite.frame.fillStyle;
        this.ctx.fillText(renderSprite.frame.text,
        renderSprite.width * -0.5,
        renderSprite.height * 0.5); 
      }  
      
      this.ctx.restore();
    });  
    this.game.update(deltaTimeSec);
    this.renderSprites.forEach((renderSprite) =>
    {
      renderSprite.update(deltaTimeSec);
    });
  }
  addChild(sprite)
  {
    //Add sprite to the world
    this.children.push(sprite);
    sprite.parent = this;
    this.calcRenderOrder();
    
    return sprite;
  }
  removeChild(sprite)
  {
    // remove sprite from game world
    this.children.splice(ArrayFunctions.FindObjectIndex(
        this.children, sprite, null), 1);
    this.calcRenderOrder();
  }
  reIndexChild(child, newIndex)
  {
    //move sprite in children array
    ArrayFunctions.MoveObjectTo(this.children,child, newIndex);
    this.calcRenderOrder();
  }
  addTween(tween)
  {
    //add tween to the world
    this.tweens.push(tween);
    return tween;
  }
  removeTween(tween)
  {
    // remove tween from game world
    this.tweens.splice(ArrayFunctions.FindObjectIndex(
    this.tweens, tween, null), 1);
  }
  pointToGrid(point)
  {
    //return tile x/y
    return new Point(Math.floor(point.x / this.tileX),
        Math.floor(point.y / this.tileY));    
  }
  calcRenderOrder()
  {
    //calculate order sprites are rendered in
    let finished = null;
    this.renderSprites.length = 0;
    let tempSprites = new Array();
    let currentSprite = null;
    for(let i = 0; i < this.children.length; i++)
    {  
      if(this.children[i].visible)
      {  
        currentSprite = this.children[i];
        tempSprites.push(currentSprite);
        finished = false;
      }
      else
      {
        finished = true;
      }  
      while(!finished)
      {
        let renderSpritesDone = true;
        for(let j = currentSprite.renderSearchIndex; j < currentSprite.children.length; j++)
        {
          if(currentSprite.children[j].visible)
          {
            currentSprite.renderSearchIndex = j + 1;
            //move down
            currentSprite = currentSprite.children[j]; 
            tempSprites.push(currentSprite);
            renderSpritesDone = false;
            break;
          }
        }
        currentSprite.renderSearchIndex = 0;
        if(renderSpritesDone)
        {
          // move up
          if(currentSprite.parent !== this)
          {
            currentSprite = currentSprite.parent;
          }  
          else
          {
            finished = true;
            this.renderSprites = this.renderSprites.concat(tempSprites);
            tempSprites.length = 0;
          }
        }  
      }  
    }  
  }
}
class Game 
{
  //Your game sublcasses this
  constructor(xTiles, yTiles, xTile, yTile)
  {
    this.gameWorld = new GameWorld(xTiles, yTiles, xTile, yTile);
    this.canvas = this.gameWorld.canvas;
    this.ctx = this.gameWorld.ctx;
    this.spriteSheet = null;
    this.spriteShapes = new Array();
    this.image = document.createElement("img"); //spritesheet image
  }
  loadSpriteSheet()
  {
    let oldCanvasWidth = this.canvas.width;
    let oldCanvasHeight = this.canvas.height;
    let rows = 10;
    let spriteSheetRectangles = new Array();
    this.canvas.width = rows * this.gameWorld.tileX;
    this.canvas.height = Math.ceil((this.spriteShapes.length / rows)) * this.gameWorld.tileY;
    let colNum = 0;
    let rowNum = -1;
    this.spriteShapes.forEach((spriteShape, index) =>
    {
      if(index / rows === colNum + 1)
      {
        colNum ++;
        rowNum = 0;
      }  
      else
      {
        rowNum ++;
      }  
      spriteShape.forEach((element) =>
      {
        this.ctx.save();
        CanvasFunctions.DrawPolygon(this.ctx,rowNum * this.gameWorld.tileX, colNum * this.gameWorld.tileY, 
            element.points, element.fillStyle,
            element.strokeStyle, element.lineWidth);
        this.ctx.restore();    
        if(element.name)
        {
          spriteSheetRectangles.push(new Rectangle(new Point(rowNum * this.gameWorld.tileX, colNum * this.gameWorld.tileY), 
              this.gameWorld.tileX, this.gameWorld.tileY, element.name));
        }      
      });      
    });  
    this.image.src = this.canvas.toDataURL("image/png");
     
    this.canvas.width = oldCanvasWidth;
    this.canvas.height = oldCanvasHeight;
    return new SpriteSheet(this.image, spriteSheetRectangles);
  }
  preload()
  {
    this.image.onload = () =>
    {
      this.create();
    };
  }
  create()
  {
    //initialise game objects here
    this.gameWorld.game = this;
  }
  update(deltaTime)
  {
    
  }
}
class MathsFunctions
{
  static RandomInt(min, max) 
  {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }
  static RandomIntInclusive(min, max) 
  {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
  }
  static RandomFloat(min, max)
  {
    return Math.random() * (max - min) + min;
  }
  static RotateVertices(vertices, origin, angle)
  {
    let rotatedVertices = new Array();
    let vertAngle = 0;
    let vertLength = 0;
    for(let i = 0; i < vertices.length; i++)
    {
      vertAngle = Math.atan2(vertices[i].y - origin.y, vertices[i].x - origin.x);
      vertLength = Math.sqrt(Math.pow(vertices[i].x - origin.x, 2) + Math.pow(vertices[i].y - origin.y, 2));
      rotatedVertices.push(new Point((Math.cos(angle + vertAngle) * vertLength) + origin.x,
          (-Math.sin(angle + vertAngle) * vertLength) + origin.y));    
    }  
    return rotatedVertices;
  }
  static DisSq(point1, point2)
  {
    //distance squared
    return Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2);
  }
  static Dis(point1, point2)
  {
    //distance
    return Math.sqrt(MathsFunctions.DisSq(point1, point2));
  }
}
class ArrayFunctions
{
  static FindArrayMaxIndex(array, callback)
  {
    let maxVal = 0;
    let index = -1;
    let member = null;
    for(let i = 0; i < array.length; i++)
    {
      if(callback)
      {
        member = callback(array[i], i);
        if(member > maxVal)
        {
          maxVal = member;
          index = i;
        }  
      }
      else
      {
        if(array[i] < maxVal)
        {
          maxVal = array[i];
          index = i;
        }  
      }  
    }
    return index;
  }
  static FindAllObjectIndexes(array, object, memberCallback)
  {
    let foundIndexes = []; 
    
    array.forEach((element, index) =>
    {
      if(memberCallback && memberCallback(element) === object)
      {
        foundIndexes.push(index);
      }  
      else if(element === object)
      {
        foundIndexes.push(index);
      }  
    });
    
    return foundIndexes;
  }
  static FindAllObjects(array, object, memberCallback)
  {
    let foundIndexes = ArrayFunctions.FindAllObjectIndexes(array, object, memberCallback);
    let foundObjects = [];
    foundIndexes.forEach((element) =>
    {
      foundObjects.push(array[element]);
    });
    return foundObjects;
  }
  static FindObjectIndex(array, object, memberCallback)
  {
    let index = -1;
    let found = false;
    if(memberCallback)
    {  
      index = array.findIndex((element) =>
      {      
        if(memberCallback(element) === object)
        {
          found = true;
        }  
        return found; 
      });
    }
    else
    {
      index = array.findIndex((element) =>
      {
        if(element === object)
        {
          found = true;
        }  
        return found; 
      });
    }  
    return index;
  }
  static FindObject(array, object, memberCallback)
  {
    let index = ArrayFunctions.FindObjectIndex(array, object, memberCallback);
    return array[index]; 
  }
  static MoveObjectTo(array, object, newIndex)
  {
    //move object index to new index
    let currentIndex = ArrayFunctions.FindObjectIndex(array, object, null);
    array.splice(currentIndex, 1);//remove from old pos
    array.splice(newIndex, 0, object);
  }
}

class Point
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  } 
  compare(another)
  {
    if(another)
    {  
      if(another.x === this.x && another.y === this.y)
      {
        return true;
      }  
      else
      {
        return false;
      }  
    }
    else 
    {  
      return false;
    }  
  }
  setTo(another)
  {
    this.x = another.x;
    this.y = another.y;
  }
  add(another)
  {
    if(another)
    {  
      this.x += another.x;
      this.y += another.y;
    }  
  }
  addNew(another)
  {
    //add and return a new point
    return new Point(this.x + another.x, this.y + another.y);
  }
}
class Rectangle
{
  constructor(position, width, height, name)
  {
    this.position = position;
    this.width = width;
    this.height = height;
    this.name = name;
  }
}
class Pool
{
  //object pool class
  constructor()
  {
    this._pool = new Array();
  }
  free(object)
  {
    object.reset();
    this._pool.push(object);
  }
  freeAll(objects)
  {
    for(let i = 0; i < objects.length; i++)
    {
      this.free(objects[i]);
    }  
  }
  obtain(objectArgs)
  {
    let returnObj = null;
    if(this._pool.length > 0)
    {
      returnObj = this._pool[this._pool.length - 1];
      returnObj.set(objectArgs);
      this._pool.splice(this._pool.length - 1, 1);
    }  
    else
    {
      //create new object
      returnObj = this.newObject(objectArgs);
    }  
    return returnObj;
  }
  newObject(objectArgs)
  {
    //override me
    return {};
  }
}


class SpriteSheet
{
  constructor(image, rectangles)
  {
    this.image = image;
    this.rectangles = rectangles;
  }
}

class Sprite //extends Updateable(Poolable(class{}))
{
  //sprite class
  static get SPRITE_SHEET()
  {
    return 1;
  }
  static get POLY_SHAPE()
  {
    return 2;
  }
  static get TEXT()
  {
    return 3;
  }
  constructor(game,type,frames, x, y, fixed, animated)
  {
    this.game = game;
    this.type = type;
    this.frameRectangles = new Array();
    this.frames = null;
    this.frame = null;
    this.frameIndex = 0;
    this.width = game.gameWorld.tileX; //just for now
    this.height = game.gameWorld.tileY; //just for now
    this.frameRectangle = null;
    this._setFrames(type, frames);

    if(fixed)
    {  
      this.fixed = fixed;
    }
    else
    {
      this.fixed = false;
    }  
    this.inputEnabled = false;
    this.position = new Point(x, y);
    this.speed = new Point(0, 0);

    this.centre = new Point(0, 0);
    this.worldPosition = new Point(0, 0);
    this.calcCentre();
    this.children = new Array(); //this.children sprites
    this.parent = null;
    this.visible = true;
    this.events =
    {
      onDown:null,
      onUp:null,
      onWorldDown:null,
      onWorldUp:null
    };
    this.angle = 0;
    this.scale = new Point(1, 1);
    this.renderSearchIndex = 0; //used when determining render order
    this.animRate = 1 / 20;
    if(animated)
    {  
      this.animated = animated;
    }
    else
    {
      this.animated = false;
    }  
    this.animTime = 0;
    this.alpha = 1;
  }
  _setFrames(type, frames)
  {
    if(Array.isArray(frames))
    {
      this.frames = frames;
    }  
    else
    {
      this.frames = [frames];
    }  
    this.frame = this.frames[0];
    this.frameRectangle = null;
    if(type === Sprite.SPRITE_SHEET)
    {  
      this._setFrameRectangles();
    }
    else if(type === Sprite.TEXT)
    {
      //get width of text
      let oldFont = this.game.gameWorld.ctx.font;
      this.game.gameWorld.ctx.font = this.frame.font;
      this.width = this.game.gameWorld.ctx.measureText(this.frame.text).width;
      this.game.gameWorld.ctx.font = oldFont;
    }  
  }
  _setFrameRectangles()
  {
    for(let i = 0; i < this.frames.length; i++)
    {
      this.frameRectangles.push(
          ArrayFunctions.FindObject(this.game.spriteSheet.rectangles,
          this.frames[i], (element) => {return element.name;}));
    }  
    this.frameRectangle = this.frameRectangles[0];
  }
  _playAnim(deltaTimeSec)
  {
    this.animTime += deltaTimeSec;
    if(this.animTime > this.animRate)
    {
      //set next frame;
      this.animTime = 0;
      if(this.frameIndex < this.frames.length - 1)
      {  
        this.frameIndex ++;
      }
      else
      {
        this.frameIndex = 0;
      }  
      this.frame = this.frames[this.frameIndex];
      this.frameRectangle = this.frameRectangles[this.frameIndex];
    }  
  }
  setFrame(frameIndex)
  {
    this.frameIndex = frameIndex;
    this.frame = this.frames[this.frameIndex];
    this.frameRectangle = this.frameRectangles[this.frameIndex];
  }
  update(deltaTimeSec)
  {
    this.calcCentre();
    if(this.animated)
    {
      this._playAnim(deltaTimeSec);
    }  
  }
  setVisible(visible)
  {
    this.visible = visible;
    this.game.gameWorld.calcRenderOrder();
  }
  calcCentre()
  {
    this.centre.x = this.worldPosition.x + (this.width * 0.5);
    this.centre.y = this.worldPosition.y + (this.width * 0.5);
  }
  addChild(child)
  {
    this.children.push(child);
    child.parent = this;
    this.game.gameWorld.calcRenderOrder();
    return child;
  }
  removeChild(child)
  {
    let index = -1;
    index = this.children.findIndex((element) =>
    {
      if(element === child)
      {
        return true;
      }  
      else
      {
        return false;
      }  
    });
    if(index > 0)
    {
      this.children.splice(index, 1);
      child.parent = null;
    }
    this.game.gameWorld.calcRenderOrder();
  }
  removeAllChildren()
  {
    this.children.forEach((child) =>
    {
      child.parent = null;
    });
    this.children.length = 0;
    this.game.gameWorld.calcRenderOrder();
  }
  reset()
  {
    //reset object when put into pool
    this.position.x = 0;
    this.position.y = 0;
    this.speed.x = 0;
    this.speed.y = 0;
    this.inputEnabled = false;
    this.fixed = false;
    this.angle = 0;
  }
  set(objectArgs)
  {
    //set obtained objects
    if(objectArgs.x)
    {
      this.position.x = objectArgs.x;
    }  
    else
    {  
      this.position.x = 0;
    }
    if(objectArgs.y)
    {  
      this.position.y = objectArgs.y;
    }
    else
    {
      this.position.y = 0;
    }  
    if(objectArgs.frames)
    {
      this.frameRectangles.length = 0;
      this._setFrames(objectArgs.type, objectArgs.frames);
    }  
    if(objectArgs.fixed)
    {  
      this.fixed = objectArgs.fixed;
    }
    else
    {
      this.fixed = false;
    }  
    this.calcCentre();
  }
}
class TextFrame
{
  constructor(font, text, fillStyle)
  {
    this.font = font;
    this.text = text;
    this.fillStyle = fillStyle;
  }
}
class ParticleEmitter extends Sprite
{
  constructor(game, x, y, fixed, particleSprite, particles, spawnRate, particleSpeedMin,
      particleSpeedMax, spawnNumber)
  {
    super(game,null,null, x, y, fixed, null);
    {
      this.particleSprites = new Array();
      for(let i = 0; i < particles; i++)
      {
        this.particleSprites.push(new ParticleSprite(game,particleSprite.type,
            particleSprite.frames, particleSprite.position.x,
            particleSprite.position.y, particleSprite.animated, particleSprite.lifeSpan));
        this.particleSprites[i].angle = MathsFunctions.RandomFloat(0, Math.PI);
        this.addChild(this.particleSprites[i]);
      }  
      this.spawnRate = spawnRate;
      this.particleSpeedMin = particleSpeedMin;
      this.particleSpeedMax = particleSpeedMax;
      this.spawnNumber = spawnNumber;
      this.emitting = false;
      this.aliveSprites = new Array();
      this.spawnCounter = this.spawnRate;      
      this.finishWhenAllAlive = true;
      this.onFinished = null;
    }
    
  }
  setEmitting(emitting)
  {
    this.emitting = emitting;
    this.spawnCounter = this.spawnRate;
  }
  particleFinished(sprite)
  {
    this.aliveSprites.splice(ArrayFunctions.FindObjectIndex(
    this.aliveSprites, sprite, null), 1);
  }
  update(deltaTimeSec)
  {
    super.update(deltaTimeSec);
    if(this.emitting)
    {
      this.spawnCounter += deltaTimeSec;
      if(this.spawnCounter >= this.spawnRate)
      {
        if(this.finishWhenAllAlive && this.aliveSprites.length === this.particleSprites.length)
        {
          if(this.onFinished)
          {
            this.onFinished();
          }  
          this.setEmitting(false);
        }  
        else
        {  
          this.spawnCounter = 0;
          let required = this.spawnNumber;

          //spawn new particle sprite
          for(let i = 0; i < this.particleSprites.length; i++)
          {
            let index = -1;       
            index = this.aliveSprites.findIndex(
                (element) =>
                {
                  if(element === this.particleSprites[i])
                  {
                    return true;
                  }  
                  else
                  {
                    return false;
                  }  
                });  
            if(index < 0)
            {
              let chosenSprite = this.particleSprites[i];
              let speed = MathsFunctions.RandomFloat(this.particleSpeedMin,
                  this.particleSpeedMax);
              let angle = MathsFunctions.RandomFloat(0, Math.PI * 2);
              chosenSprite.setVisible(true);
              chosenSprite.speed.x = Math.cos(angle) * speed;
              chosenSprite.speed.y = -Math.sin(angle) * speed;
              this.aliveSprites.push(chosenSprite);
              required --;
            }  
            if(required === 0)
            {
              break;
            }  
          } 
        }  
      }  
    }  
  }
}
class ParticleSprite extends Sprite
{
  constructor(game,type,frame, x, y, animated, lifeSpan)
  {
    super(game, type, frame, x, y, false, animated); 
    this.setVisible(false);
    this.lifeSpan = lifeSpan;
    this.aliveCounter = 0;
  }
  update(deltaTimeSec)
  {
    super.update(deltaTimeSec);
    if(this.visible)
    {
      this.aliveCounter += deltaTimeSec;
      if(this.aliveCounter > this.lifeSpan)
      {
        this.aliveCounter = 0;
        this.setVisible(false);
        this.position.x = 0;
        this.position.y = 0;
        this.parent.particleFinished(this);
      }  
    }  
  }
}
class TweenContainer
{
  //used for storing tweens so they can be chained
  constructor()
  {
    this.tweens = new Array();
  }
  addTween(tween)
  {
    this.tweens.push(tween);
    return tween;
  }
  removeTween(tween)
  {
    this.tweens.splice(ArrayFunctions.FindObjectIndex(this.tweens, tween, null), 1);
  }
}
class Tween
{
  static get CONST_SPEED()
  {
    return 1;
  }
  static get CONST_ACCEL()
  {
    return 2;
  }
  constructor(sprite, duration, repeats, type)
  {
    this.sprite = sprite;
    this.duration = duration;
    if(type)
    {
      this.type = type;
    }  
    else
    {
      this.type = Tween.CONST_SPEED;
    }  
    this.onComplete = null;
    this.repeats = repeats;// negative value means infinite repeats
    this._repeatsCounter = repeats;
    this.amountComplete = 0; //range between 0-1.  1 = complete
    this.travel = null;
    this.onReachedEnd = null;
    this.onReachedStart = null;
    this.active = false;
    this._totalTime = 0;
    this._initSpeed = null;
    this.outbound = true;
    this.averageTravelSpeed = 0;
    this.travelDistance = 0;
    this.acceleration = 0;
  }
  
  setStartEnd(start, end)
  {
    
  }
  
  setDuration(duration)
  {
    if(duration)
    {
      this.duration = duration;
    }  
  }
  
  setAcceleration()
  {
    this.acceleration = (2 * this.travelDistance) / Math.pow(this.duration, 2);    
    this._initSpeed = this.acceleration * this.duration;
    this.acceleration *= -1; //make negative
  }
  _updateAmountComplete(deltaTime)
  { 
    this._totalTime += deltaTime;

    if(this.type === Tween.CONST_SPEED)
    {
      this.amountComplete = ((this._totalTime * this.averageTravelSpeed) /
          this.travelDistance);
    }  
    else if(this.type === Tween.CONST_ACCEL)
    {
      this.amountComplete = (((this._initSpeed * this._totalTime) + 
          (0.5 * this.acceleration * Math.pow(this._totalTime, 2))) / this.travelDistance);  
    }  
    
    if(!this.outbound)
    {
      this.amountComplete = 1 - this.amountComplete;
    }  
    
    if(this._totalTime > this.duration)
    {
      this._totalTime = 0;
      if(!this._checkComplete())
      {
        if(this.outbound)
        {  
          this.outbound = false;
          if(this.onReachedEnd)
          {
            this.onReachedEnd();
          } 
        }
        else
        {
          this.outbound = true;
          if(this.onReachedStart)
          {
            this.onReachedStart();
          }
        }
      }  
    }  
  }
  _checkComplete()
  {
    if(this.repeats >= 0)
    {  
      this._repeatsCounter --;
      if(this._repeatsCounter < 0)
      {
        //reset tween
        this.reInit();
        if(this.onComplete)
        {
          this.onComplete(this);
        }  
        return true;
      }  
      return false;
    }
    return false;
  }
  reInit()
  {
    this.active = false;
    this._repeatsCounter = this.repeats;
    this.outbound = true;
    this.amountComplete = 0;
    this._totalTime = 0;
  }
  update(deltaTimeSec)
  {
    if(this.active)
    {  
      this._updateAmountComplete(deltaTimeSec);
    }  
  }
}
class PointsTween extends Tween
{
  constructor(sprite, duration, repeat,type, startPoint, endPoint)
  {
    //for tweening between points
    super(sprite, duration, repeat,type);
    this.diffX = 0;
    this.diffY = 0;
    this.startPoint = new Point(0,0);
    this.endPoint = new Point(0,0);
    this.setStartEnd(startPoint, endPoint);
  }
  update(deltaTime)
  {
    super.update(deltaTime);
  }
  setStartEnd(startPoint, endPoint)
  {
    this.startPoint.setTo(startPoint);
    this.endPoint.setTo(endPoint);
    this.diffX = this.endPoint.x - this.startPoint.x;
    this.diffY = this.endPoint.y - this.startPoint.y;
    this.travelDistance = MathsFunctions.Dis(this.startPoint, this.endPoint);
    this.setDuration(null);  
    this.setAcceleration();
  }
  setDuration(duration)
  {
    super.setDuration(duration);
    this.averageTravelSpeed = this.travelDistance / this.duration;
  }
}
class MoveTween extends PointsTween
{
  constructor(sprite, duration, repeat,type, startPoint, endPoint)
  {
    //for tweening between positions
    super(sprite, duration, repeat,type, startPoint, endPoint);
  }
  update(deltaTime)
  {
    super.update(deltaTime);
    if(this.active)
    {  
      this.sprite.position.x = this.startPoint.x + (this.amountComplete * this.diffX);
      this.sprite.position.y = this.startPoint.y + (this.amountComplete * this.diffY);
    }  
  }
}
class ScaleTween extends PointsTween
{
  constructor(sprite, duration, repeat,type, startPoint, endPoint)
  {
    //for tweening between positions
    super(sprite, duration, repeat,type, startPoint, endPoint);
  }
  update(deltaTime)
  {
    super.update(deltaTime);
    if(this.active)
    {  
      this.sprite.scale.x = this.startPoint.x + (this.amountComplete * this.diffX);
      this.sprite.scale.y = this.startPoint.y + (this.amountComplete * this.diffY);
    }  
  }
}
class RotateTween extends Tween
{
  constructor(sprite, duration, repeat,type, rotateBy)
  {
    super(sprite, duration, repeat,type);
    this.startAngle = 0;
    this.endAngle = 0;
    this.rotateBy = 0;
    this.setStartEnd(sprite.angle, rotateBy);
  }
  update(deltaTimeSec)
  {
    super.update(deltaTimeSec);
    if(this.active)
    {  
      this.sprite.angle = this.startAngle + (this.amountComplete * this.rotateBy);
    }    
  }
  setStartEnd(start, rotateBy)
  {
    this.startAngle = start;
    this.rotateBy = rotateBy;
    this.endAngle = this.startAngle + rotateBy; 
    this.travelDistance = this.rotateBy;
    this.setDuration(null);
    this.setAcceleration();
  }
  setDuration(duration)
  {
    super.setDuration(duration);
    this.averageTravelSpeed = this.rotateBy / this.duration;
  }
}
class AlphaTween extends Tween
{
  //tween a sprites alpha value
  constructor(sprite, duration, repeat,type, startAlpha, endAlpha)
  {
    super(sprite, duration, repeat, type);
    this.startAlpha = 0;
    this.endAlpha = 0;
    this.setStartEnd(startAlpha, endAlpha);
  }
  setStartEnd(startAlpha, endAlpha)
  {
    this.startAlpha = startAlpha;
    this.endAlpha = endAlpha;
    this.travelDistance = endAlpha - startAlpha;
    this.setDuration(null);  
    this.setAcceleration();
  }
  setDuration(duration)
  {
    super.setDuration(duration);
    this.averageTravelSpeed = this.travelDistance / this.duration;
  }
  update(deltaTimeSec)
  {
    super.update(deltaTimeSec);
    if(this.active)
    {  
      this.sprite.alpha = this.startAlpha + (this.amountComplete * this.travelDistance);
    }    
  }
}

class CanvasFunctions
{
  //for drawing onto canvas
  static DrawPolygon(ctx,x, y, points, fillStyle, strokeStyle,lineWidth)
  {
    if(!x)
    {
      x = 0;
    }  
    if(!y)
    {
      y = 0;
    }     
    if(fillStyle)
    {
      ctx.fillStyle = fillStyle;
    } 
    if(strokeStyle)
    {
      ctx.strokeStyle = strokeStyle;
    }  
    if(lineWidth)
    {
      ctx.lineWidth = lineWidth;
    }  
    ctx.beginPath();
    ctx.moveTo(points[0].x + x, points[0].y + y);
    for(let i = 1; i < points.length; i++)
    {    
      ctx.lineTo(points[i].x + x, points[i].y + y);
      if(!fillStyle)
      {  
        ctx.stroke();
      }  
    }  
    ctx.closePath();
    if(fillStyle)
    {
      ctx.fill();
    } 
  }
}
class PolyShape
{
  //simple shapes
  constructor(points, name, fillStyle, strokeStyle, lineWidth)
  {
    this.points = points;
    this.name = name;
    this.fillStyle = fillStyle;
    this.strokeStyle = strokeStyle;
    this.lineWidth = lineWidth;
  }
  static RightArrow(x, y, xDiv, yDiv, name, fillStyle)
  {
    if(!name)
    {
      name = "rightArrow";
    }     
    let arrowPoints = [new Point(0, yDiv / 4),
        new Point(xDiv / 2, yDiv / 4),
        new Point(xDiv / 2, 0),
        new Point(xDiv, yDiv / 2),
        new Point(xDiv / 2, yDiv),
        new Point(xDiv / 2, yDiv * (3 / 4)),
        new Point(0, yDiv * (3 / 4)),
        new Point(0, yDiv / 4)
        ];    
    arrowPoints.forEach((arrowPoint) =>
    {
      arrowPoint.x += x;
      arrowPoint.y += y;
    });
    return new PolyShape(arrowPoints, "rightArrow", fillStyle, null, null);    
  }
  static UpArrow(x, y, xDiv, yDiv, name, fillStyle)
  {
    if(!name)
    {
      name = "upArrow";
    }  
    let rightArrow = PolyShape.RightArrow(x, y, xDiv, yDiv, null, null);
    let upArrowPoints = MathsFunctions.RotateVertices(rightArrow.points, 
        new Point((xDiv / 2) + x, (yDiv / 2) + y), Math.PI / 2);
    return new PolyShape(upArrowPoints, "upArrow", fillStyle, null, null);
  }
  static LeftArrow(x, y, xDiv, yDiv, name, fillStyle)
  {
    if(!name)
    {
      name = "leftArrow";
    }  
    let rightArrow = PolyShape.RightArrow(x, y, xDiv, yDiv, null, null);
    let leftArrowPoints = MathsFunctions.RotateVertices(rightArrow.points, 
        new Point((xDiv / 2) + x, (yDiv / 2) + y), Math.PI);
    return new PolyShape(leftArrowPoints, "leftArrow", fillStyle, null, null);
  }
  static DownArrow(x, y, xDiv, yDiv, name, fillStyle)
  {
    if(!name)
    {
      name = "downArrow";
    }  
    let rightArrow = PolyShape.RightArrow(x, y, xDiv, yDiv, null, null);
    let downArrowPoints = MathsFunctions.RotateVertices(rightArrow.points, 
        new Point((xDiv / 2) + x, (yDiv / 2) + y), Math.PI * (3 / 2));
    return new PolyShape(downArrowPoints, "downArrow", fillStyle, null, null);
  }
  static Circle(x, y, radius, startAngle, endAngle, points, name, fillStyle, 
      strokeStyle, lineWidth)
  {
    if(!name)
    {
      name = "circle";
    }  
    if(!startAngle)
    {
      startAngle = 0;
    }         
    if(!endAngle)
    {
      endAngle = Math.PI * 2;
    }  
    if(!points)
    {  
      points = 100;
    }
    let circlePoints = new Array();
    let pointAngle = ((endAngle - startAngle) / points);
    for(let i = 0; i < points; i++)
    {
      circlePoints[i] = new Point((Math.cos((i * pointAngle) + startAngle) * radius) + radius + x,
          (-Math.sin((i * pointAngle) + startAngle) * radius) + radius + y);
    }  
    return new PolyShape(circlePoints, name, fillStyle, strokeStyle, lineWidth);
  }
  static Rectangle(x, y, width, height, name, fillStyle)
  {
    let rectPoints = [new Point(x, y), new Point(x + width, y),
        new Point(x + width, y + height), new Point(x, y + height),
        new Point(x, y)];
    return new PolyShape(rectPoints, name, fillStyle, null, null);  
  }
  static BevelledRectangle(x, y, width, height,bevell, name, fillStyle)
  {
    let bevelOrigins = new Array(new Point(x + width - bevell, y + bevell),
        new Point(x + bevell, y + bevell), new Point(x + bevell, y + height - bevell),
        new Point(x + width - bevell, y + height - bevell));

    let totalAngle = 0;
    let arcPoints = null;
    let bevelPoints = new Array();
    for(let i = 0; i < bevelOrigins.length; i++)
    {
      arcPoints = PolyShape.Circle(bevelOrigins[i].x - bevell, bevelOrigins[i].y - bevell ,bevell,
          totalAngle, totalAngle + (Math.PI / 2), null, null, null, null, null).points; 
      bevelPoints = bevelPoints.concat(arcPoints);
 
      totalAngle += Math.PI / 2;
    }  
    return new PolyShape(bevelPoints, name, fillStyle, null, null);
  }
  static Home(x, y, xDiv, yDiv,name, fillStyle)
  {
    if(!name)
    {
      name = "home";
    }  
    let homePoints = [new Point(0, yDiv), new Point(0,  yDiv / 4),
        new Point(xDiv / 2, 0), new Point(xDiv, yDiv / 4), 
        new Point(xDiv, yDiv), new Point((xDiv / 2) + (xDiv / 5), yDiv),
        new Point((xDiv / 2) + (xDiv / 5), yDiv - (yDiv / 3)),
        new Point((xDiv / 2) - (xDiv / 5), yDiv - (yDiv / 3)),
        new Point((xDiv / 2) - (xDiv / 5), yDiv),
        new Point(xDiv / 5, yDiv)];
    homePoints.forEach((homePoint) =>
    {
      homePoint.x += x;
      homePoint.y += y;
    });
    return new PolyShape(homePoints, name, fillStyle, null, null);  
  }
  static LaserBeam(x,y,width, amp, pointsXWidth, offset, name, strokeStyle)
  {
    if(!name)
    {
      name = "laserBeam";
    }  
    let side = 1;
    let pointsToStart = Math.floor(offset / pointsXWidth);
    if(pointsToStart % 2 > 0)
    {
      //odd number
      side = -1;
    }  
    let xPoint = offset - (pointsToStart * pointsXWidth);
    let tanAngle = amp / (pointsXWidth);
    let laserPoints = new Array();
    laserPoints.push(new Point(x,(y + (amp * side)) + xPoint * tanAngle * side * -1));
    while(xPoint < width)
    {
      laserPoints.push(new Point(x + (xPoint),
          y + (side * amp)));
      xPoint += pointsXWidth;
      side *= -1;
    }  
    laserPoints.push(new Point(x + width,y + ((x + width - (xPoint - (pointsXWidth / 2))) * tanAngle) * side ));
    
    return new PolyShape(laserPoints, name, null, strokeStyle, null);
  }
  static Star(pentX, pentY,starX, starY, pentRadius, starRadius, name, fillStyle)
  {
    let pentCircle = PolyShape.Circle(pentX, pentY, pentRadius, null, null, 5, null, null, null, null);
    let starAngle = 0.2 * Math.PI;
    let starCircle = PolyShape.Circle(starX, starY, starRadius, starAngle, starAngle + (Math.PI * 2),
        5, null, null, null, null);
    let starPoints = [];
    pentCircle.points.forEach((pentPoint, pentIndex) =>
    {
      starPoints.push(pentPoint);
      starPoints.push(starCircle.points[pentIndex]);
    });
    starPoints = MathsFunctions.RotateVertices(starPoints, 
        new Point(pentX + pentRadius, pentY + pentRadius), starAngle / -2);
    return new PolyShape(starPoints, name, fillStyle, null, null);
  }
}
