//creates mazes by neilbgames
class MazeCreator
{
  static CreateMaze(xGrid, yGrid)
  {
    //create a new maze
    let mazeGrid = new MazeGrid(xGrid, yGrid);
    let gridSquarePool = new GridSquarePool();
    let mazeMakerGridPathPool = new MazeMakerGridPathPool();
    let mazeMakerGridPathFinderPool = new MazeMakerGridPathFinderPool();
   
    let startPoint = new Point(MathsFunctions.RandomIntInclusive(0, xGrid - 1), 
        MathsFunctions.RandomIntInclusive(0, yGrid - 1));
    let endPoint = new Point(startPoint.x, startPoint.y);    
    let mazeMakerGridPathFinder = mazeMakerGridPathFinderPool.obtain({fillGrid: mazeGrid,
        start: startPoint, end: endPoint, gridPaths: null,branchStart: null, gridSquarePool: gridSquarePool, 
        gridPathPool: mazeMakerGridPathPool});  
    mazeMakerGridPathFinder.process();
    
    // now finish off rest of maze
    let clearSideSquare = null;
    let returnPoint = null;
    let sideIndex = 0;
    let sides = [];
    do
    {
      //get random clear sided square
      clearSideSquare = mazeGrid.clearSideSquares[
          MathsFunctions.RandomInt(0, mazeGrid.clearSideSquares.length)];

      //get random sides of square
      sides = MazeCreator._RandomSides();
      sides.some((arraySide) =>
      {
        if(clearSideSquare.clearSides[arraySide])
        {
          sideIndex = arraySide;
          return true;
        }  
      });
      
      startPoint.setTo(mazeGrid.directionObj.directions[sideIndex].point.
          addNew(new Point(clearSideSquare.x, clearSideSquare.y)));     
     
      endPoint.x = MathsFunctions.RandomIntInclusive(0, xGrid - 1);
      endPoint.y = MathsFunctions.RandomIntInclusive(0, yGrid - 1);
      returnPoint = MazeCreator._Walk(endPoint, mazeGrid, null);
      endPoint = returnPoint;
      mazeMakerGridPathFinderPool.free(mazeMakerGridPathFinder);
      mazeMakerGridPathFinder = mazeMakerGridPathFinderPool.obtain({fillGrid: mazeGrid,
        start: startPoint, end: endPoint, gridPaths: null,branchStart: clearSideSquare, gridSquarePool: gridSquarePool, 
        gridPathPool: mazeMakerGridPathPool});         
          
          
      let pointsChecked = [];
      while(mazeMakerGridPathFinder.gridPaths[0].end && !mazeMakerGridPathFinder.process()) 
      {
        returnPoint = MazeCreator._Walk(endPoint, mazeGrid, pointsChecked);
        if(returnPoint)
        {
          pointsChecked.push(returnPoint);
        }  
        if(!returnPoint)
        {
          break;
        }  
        endPoint = returnPoint;  
        mazeMakerGridPathFinderPool.free(mazeMakerGridPathFinder);
        mazeMakerGridPathFinderPool.obtain({fillGrid: mazeGrid,
        start: startPoint, end: endPoint, gridPaths: null,branchStart: clearSideSquare, gridSquarePool: gridSquarePool, 
        gridPathPool: mazeMakerGridPathPool});    
      }   
    }while(!mazeGrid.filled())
    mazeGrid._calcLineSides();
    return mazeGrid;
  }
  static FindForks(mainPath, allPaths)
  {
    //find forks off main path;
    let forkedPaths = [];
    let forkSquares = [];
    let forkIndexes = [];
    allPaths.forEach((gridPath) =>
    {
      if(gridPath !== mainPath)
      {  
        gridPath.gridSquares.some((gridSquare, gridSquareIndex) =>
        {
          if(gridSquare.direction !== (mainPath.gridSquares[gridSquareIndex]).direction
              && gridSquare.direction !== Direction.NONE)
          {
            let nextSquare = gridPath.gridSquares[gridSquareIndex + 1];
            let foundForkSquare = false;
            forkSquares.some((forkSquare) =>
            {
              if(forkSquare.position.compare(nextSquare.position))
              {
                foundForkSquare = true;
                return true;
              }  
            });
            if(!foundForkSquare)
            {  
              forkSquares.push(nextSquare);
              let foundPaths = [];
              //get all gridPaths which pass through nextSquare
              allPaths.forEach((checkPath) =>
              {
                checkPath.gridSquares.some((checkSquare) =>
                {
                  if(checkSquare.position.compare(nextSquare.position))
                  {
                    foundPaths.push(checkPath);
                    return true;
                  }  
                });  
              });
              forkedPaths.push(foundPaths[ArrayFunctions.FindArrayMaxIndex(foundPaths, (foundPath) =>
              {
                {return foundPath.gridSquares.length;}
              })]);
              forkIndexes.push({forkedPath: forkedPaths[forkedPaths.length - 1], 
                  forkIndex: gridSquareIndex});
            }  
            return true;
          }  
        });
      }  
    });
    //sort forkedPaths by forkIndexes
    forkIndexes.sort((a, b) =>
    {
      return a.forkIndex - b.forkIndex;
    });
    return forkIndexes;
  }
  static _Walk(testPoint, grid, pointsChecked)
  {
    let backwardPoint = new Point(testPoint.x, testPoint.y);
    let forwardPoint = new Point(testPoint.x, testPoint.y);
    let points = [backwardPoint, forwardPoint];
    let limits = [false, false]; //top bottom
    let matching = false;
    let foundPoint = null;
    do
    {
      points.some((point, index) =>
      { 
        if(!limits[index])
        {  
          matching = false;
          if(pointsChecked && pointsChecked.findIndex(testPoint.compare, point) >= 0)
          {
            matching = true;
          }  
          if(!matching && grid.getFilled(point.x, point.y))
          {
            matching = true;
          }
          if(!matching)
          {
            foundPoint = new Point(point.x, point.y);
            return true; //break;
          }  
        } 
      });
      if(matching)
      {
        if(!limits[1])
        {  
          //walk forward (right/down)
          if(forwardPoint.x < grid.xSquares - 1)
          {
             forwardPoint.x ++;
          }  
          else if(forwardPoint.y > 0)
          {
            forwardPoint.x = 0;
            forwardPoint.y --;
          }  
          else
          {
            limits[1] = true;
          }  
        }
        if(!limits[0])
        {
          //walk backward (left/up)
          if(backwardPoint.x > 0)
          {
             backwardPoint.x --;
          }  
          else if(backwardPoint.y < grid.ySquares - 1)
          {
            backwardPoint.x = grid.xSquares - 1;
            backwardPoint.y ++;
          }  
          else
          {
            limits[0] = true;
          }  
        }  
        if(limits[0] && limits[1])
        {
          matching = false;
        }  
      }  
    }while(matching)
    return foundPoint;  
  }
  static _RandomSides()
  {
    let sides = [0,1,2,3];
    let randomSides = [];
    let index = 0;
    while(sides.length > 0)
    {
      index = MathsFunctions.RandomInt(0, sides.length);
      randomSides.push(sides[index]);
      sides.splice(index, 1);
    }  
    return randomSides;
  }

  static GetMazeGridPaths(maze, start)
  {
    //get all paths from this start point
    let pools = {mazeGridPathFinderPool: new MazeGridPathFinderPool(),
          mazeGridPathPool: new MazeGridPathPool(),
          gridSquarePool: new GridSquarePool()};
    let foundGridPaths = new Array();    
    for(let i = 0; i < maze.xSquares; i++)
    {
      for(let j = 0; j < maze.ySquares; j++)
      {
        foundGridPaths.push(MazeCreator.GetMazeGridPath(maze, start, new Point(i, j),
            pools));
      }  
    }
    return foundGridPaths;
  }
  static GetMazeGridPath(maze, start, end, pools)
  {
    //get path from start to tend
    if(!pools)
    {  
      pools = {mazeGridPathFinderPool: new MazeGridPathFinderPool(),
          mazeGridPathPool: new MazeGridPathPool(),
          gridSquarePool: new GridSquarePool()};
    }
    let mazeGridPathFinder = pools.mazeGridPathFinderPool.obtain({fillGrid: maze, start: start,
      end: end, gridPaths: null, gridSquarePool: pools.gridSquarePool,
      gridPathPool: pools.mazeGridPathPool});
    
    let gridPath = mazeGridPathFinder.process();
    mazeGridPathFinder.reset();
    return gridPath;
  }
}


class GridSquarePool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new GridSquare(objectArgs.position, objectArgs.direction);
  }
}
class MazeMakerGridPathPool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new MazeMakerGridPath(objectArgs.grid, objectArgs.start,
        objectArgs.end, objectArgs.gridSquares, objectArgs.gridSquarePool);
  }
}
class MazeGridPathPool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new MazeGridPath(objectArgs.grid, objectArgs.start,
        objectArgs.end, objectArgs.gridSquares, objectArgs.gridSquarePool);
  }
}
class MazeMakerGridPathFinderPool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new MazeMakerGridPathFinder(objectArgs.fillGrid, objectArgs.start,
        objectArgs.end, objectArgs.gridPaths, objectArgs.branchStart,
        objectArgs.gridSquarePool, objectArgs.gridPathPool);
  }
}
class MazeGridPathFinderPool extends Pool
{
  constructor()
  {
    super();
  }
  newObject(objectArgs)
  {
    return new MazeGridPathFinder(objectArgs.fillGrid, objectArgs.start,
        objectArgs.end, objectArgs.gridPaths, objectArgs.gridSquarePool,
        objectArgs.gridPathPool);
  }
}


class GridSquare 
{
  constructor(position, direction)
  {
    if(!position)
    {  
      this.position = new Point(0,0);
    }
    else
    {
      this.position = new Point(position.x, position.y);
    }  
    if(!direction)
    {  
      this.direction = Direction.NONE;
    }
    else
    {
      this.direction = direction;
    }  
  }
  reset()
  {
    this.direction = Direction.NONE;
    this.position.x = 0;
    this.position.y = 0;
  }
  set(objectArgs)
  {
    this.position.setTo(objectArgs.position);
    this.direction = objectArgs.direction;
  }
}
class GridPath 
{
  constructor(grid, start, end, gridSquares, gridSquarePool)
  {
    this.grid = grid;
    if(start)
    {  
      this.start = new Point(start.x, start.y);
    }
    else
    {
      this.start = new Point(0,0);
    }  
    if(end)
    {  
      this.end = new Point(end.x, end.y);
    }
    else
    {
      this.end = new Point(0,0);
    }  
    this.gridSquarePool = gridSquarePool;

    if(!gridSquares)
    {
      this.gridSquares = new Array();
      this.gridSquares.push(this.gridSquarePool.obtain({position: start, direction: Direction.NONE}));
    }  
    else
    {       
      //copy into new GridSquare array omit last element
      this.gridSquares = new Array();
      for(let i = 0; i < gridSquares.length - 1; i++)
      {
        this.gridSquares.push(this.gridSquarePool.obtain({position: gridSquares[i].position,
            direction: gridSquares[i].direction}));    
      }  
    }  
    this.order = Direction.ORDER;
    this.moves = 0;
    this.reachedEnd = false;
    this.deadEnd = false;
  }
  static get DEAD_END()
  {
    return 1;
  }
  static get REACHED_END()
  {
    return 2;
  }
  static get OK()
  {
    return 3;
  }
  static get OK_NO_FORK()
  {
    return 4;
  }
  scout(squaresVisited)
  {
    let refGridSquare = this.gridSquares[this.gridSquares.length - 1];
    let index = 0;
    let testPoint = new Point(0, 0);
    if(refGridSquare.direction !== Direction.NONE)
    {
      index = this.order.indexOf(refGridSquare.direction) + 1;
    }  
    for(let i = index; i < this.order.length; i++)
    {
      let direction = this.grid.directionObj.directions[i];
      testPoint.setTo(refGridSquare.position.addNew(direction.point));
      if(testPoint.x < this.grid.xSquares && testPoint.x >= 0 &&
          testPoint.y < this.grid.ySquares && testPoint.y >= 0)
      {
        if(this.isAtEnd(testPoint, refGridSquare, direction))
        {
          refGridSquare.direction = direction.id;
          this.moves = this.gridSquares.length;
          this.reachedEnd = true;
          this.gridSquares.push(this.gridSquarePool.obtain({position: testPoint,
              direction: Direction.NONE}));
          return GridPath.REACHED_END;
        }
        else if(!this.isCollide(testPoint, refGridSquare, direction) &&
            !this._hasBeen(testPoint))
        {
          if(squaresVisited.getFilled(testPoint.x, testPoint.y))
          {
            this.deadEnd = true;
          } 
          else
          {
            squaresVisited.makeFilled(testPoint.x, testPoint.y);
          }
          refGridSquare.direction = direction.id;
          this.gridSquares.push(this.gridSquarePool.obtain({position: testPoint,
              direction: Direction.NONE}));
          return GridPath.OK;
        }  
      }  
    }  
    this.deadEnd = true;
    return GridPath.DEAD_END;
  }
  _hasBeen(testPoint)
  {
    let hasBeen = false;
    for(let i = 0; i < this.gridSquares.length; i++)
    {
      if(this.gridSquares[i].position.x === testPoint.x &&
          this.gridSquares[i].position.y === testPoint.y)
      {
        hasBeen = true;
        break;
      }
    }
    return hasBeen;
  }
  reset()
  {
    this.gridSquarePool.freeAll(this.gridSquares);
    this.gridSquares.length = 0;
    this.moves = 0;
    this.reachedEnd = false;
    this.deadEnd = false;
    this.order = Direction.ORDER;
  }
  set(objectArgs)
  {
    this.start.setTo(objectArgs.start);
    this.end.setTo(objectArgs.end);
    if(!objectArgs.gridSquares)
    {
      this.gridSquares.push(this.gridSquarePool.obtain({position: objectArgs.start,
          direction: Direction.NONE}));
    }  
    else
    {  
      //copy into new GridSquare array omit last element
      for(let i = 0; i < objectArgs.gridSquares.length - 1; i++)
      {
        this.gridSquares.push(this.gridSquarePool.obtain({position: objectArgs.gridSquares[i].position,
            direction: objectArgs.gridSquares[i].direction}));
      }  
    }  
  }
  isCollide(testPoint, refGridSquare, direction)
  {
    //override me
    return true;
  }
  isAtEnd(testPoint, refGridSquare, position)
  {
    //override me
    return true;
  }
}
class MazeGridPath extends GridPath
{
  constructor(grid, start, end, gridSquares, gridSquarePool)
  {
    super(grid, start, end, gridSquares, gridSquarePool);
  }  
  isCollide(testPoint, refGridSquare, direction)
  {
    let wall = false;
    if(this.grid.getLineSides(refGridSquare.position.x, refGridSquare.position.y)
        [Direction.ORDER.indexOf(direction.id)])
    {
      //wall
      wall = true;
    }
    return wall;
  }
  isAtEnd(testPoint, refGridSquare, direction)
  {
    let end = false;
    if(!this.isCollide(testPoint, refGridSquare, direction) &&
        testPoint.compare(this.end))
    {
      end = true;
    }
    return end;
  }
}  
class MazeMakerGridPath extends GridPath
{
  constructor(grid, start, end, gridSquares, gridSquarePool)
  {
    super(grid, start, end, gridSquares, gridSquarePool);
  }  
  isCollide(testPoint)
  {
    let collide = false;
    if(this.grid.getFilled(testPoint.x,testPoint.y))
    {
      collide = true;
    }  
    return collide;
  }
  isAtEnd(testPoint)
  {
    let end = false;
    if(testPoint.compare(this.end))
    {
      end = true;
    }
    return end; 
  }
}  
class GridPathFinder
{
  constructor(fillGrid, start, end, gridPaths,
      gridSquarePool, gridPathPool)
  {
    this.fillGrid = fillGrid;
    this.gridSquarePool = gridSquarePool;
    this.gridPathPool = gridPathPool;
    if(!start)
    {
      start = new Point(0,0);
    }  
    if(!end)
    {
      end = new Point(0, 0);
    }  
    this.tilesVisited = new Grid(fillGrid.xSquares, fillGrid.ySquares);
    if(!gridPaths)
    {
      this.gridPaths = new Array();
      this.gridPaths.push(this.gridPathPool.obtain(
              {grid: fillGrid,start: start,end: end,gridSquares: null,gridSquarePool: this.gridSquarePool}));
    }  
    else
    {
      this.gridPaths = gridPaths;
    }
  }
  process()
  {
    let index = 0;
    let pathIndex = 0;
    let finished = false;
    let outcome = null;
    let pathActive = false; //at least one path active
    if(this.gridPaths[0].start.compare(this.gridPaths[0].end))
    {
      //start equals ends
      finished = true;
      pathActive = true;
    }  
    else
    {  
      do
      {
        if (!this.gridPaths[index].reachedEnd &&
            !this.gridPaths[index].deadEnd)
        {
          outcome = this.gridPaths[index].scout(this.tilesVisited);
          if(outcome === GridPath.OK)
          {
            //fork new path  
            this.gridPaths.push(this.gridPathPool.obtain({grid: this.fillGrid,start: this.gridPaths[index].start, 
                end: this.gridPaths[index].end, gridSquares: this.gridPaths[index].gridSquares,
                gridSquarePool: this.gridSquarePool}));    
            index ++;
            if(!pathActive)
            {
              pathActive = true;
            } 
          }  
          else if(outcome === GridPath.OK_NO_FORK)
          { 
            if(!pathActive)
            {
              pathActive = true;
            } 
          }  
          else if(outcome === GridPath.REACHED_END)
          {
            pathIndex = index;
            finished = true;
            if(!pathActive)
            {
              pathActive = true;
            } 
          }
        }
        else if(index < this.gridPaths.length - 1)
        {
          index ++;
        }
        else
        {
          if(!pathActive)
          {
            // no active paths
            finished = true;
          }  
          else
          {  
            index = 0;
            pathActive = false;
          }  
        }
      }while(!finished)
    }    
    return {pathActive: pathActive, pathIndex: pathIndex};
  }
  set(objectArgs)
  {
    this.gridPaths.push(this.gridPathPool.obtain({grid: this.fillGrid, start: objectArgs.start,
        end: objectArgs.end, gridSquares: null, gridSquarePool: this.gridSquarePool}));
    this.tilesVisited.clear();  
  }
  reset()
  {
    this.gridPathPool.freeAll(this.gridPaths);
    this.gridPaths.length = 0;
  }
}

class MazeMakerGridPathFinder extends GridPathFinder
{
  constructor(fillGrid, start, end, gridPaths, branchStart,
      gridSquarePool, gridPathPool)
  {
    super(fillGrid, start, end, gridPaths,
    gridSquarePool, gridPathPool);
    this.branchStart = branchStart;  
  }    
  process()
  {
    let processed = super.process();
    let pathActive = processed.pathActive;
    let pathIndex = processed.pathIndex;
    //add to fillGrid
    if(pathActive)
    {
      if(this.branchStart)
      {
        this.fillGrid.addConnected(this.branchStart.x,
            this.branchStart.y,
            this.gridPaths[pathIndex].gridSquares[0].position.x,
            this.gridPaths[pathIndex].gridSquares[0].position.y);  
        this.fillGrid.addConnected(this.gridPaths[pathIndex].gridSquares[0].position.x,
            this.gridPaths[pathIndex].gridSquares[0].position.y,
            this.branchStart.x,
            this.branchStart.y);
      }  
      for(let i = 0; i < this.gridPaths[pathIndex].gridSquares.length; i++)
      {
        this.fillGrid.makeFilled(this.gridPaths[pathIndex].gridSquares[i].position.x,
            this.gridPaths[pathIndex].gridSquares[i].position.y);
        if(i > 0)
        {
          this.fillGrid.addConnected(this.gridPaths[pathIndex].gridSquares[i].position.x,
              this.gridPaths[pathIndex].gridSquares[i].position.y,
              this.gridPaths[pathIndex].gridSquares[i - 1].position.x,
              this.gridPaths[pathIndex].gridSquares[i - 1].position.y);
        }
        if(i < this.gridPaths[pathIndex].gridSquares.length - 1)
        {
          this.fillGrid.addConnected(this.gridPaths[pathIndex].gridSquares[i].position.x,
              this.gridPaths[pathIndex].gridSquares[i].position.y,
              this.gridPaths[pathIndex].gridSquares[i + 1].position.x,
              this.gridPaths[pathIndex].gridSquares[i + 1].position.y);
        }
      }  
      return this.gridPaths[pathIndex];
    }
    else
    {
      return null;
    }
  }
  set(objectArgs)
  {
    super.set(objectArgs);
    this.branchStart = objectArgs.branchStart;
  }
}

class MazeGridPathFinder extends GridPathFinder
{
  constructor(fillGrid, start, end, gridPaths,
      gridSquarePool, gridPathPool)
  {
    super(fillGrid, start, end, gridPaths,
        gridSquarePool, gridPathPool);
    this.foundPath = null;    
  }   
  process()
  {
    let processed = super.process();
    let pathIndex = processed.pathIndex; 
    this.foundPath = this.gridPaths[pathIndex]; 
    return this.foundPath;
  }
  
  reset()
  {
    for(let i = 0; i < this.gridPaths.length; i++)
    {
      if(this.gridPaths[i] !== this.foundPath)
      {
        this.gridPathPool.free(this.gridPaths[i]);
      }   
    }  
    this.gridPaths.length = 0;
    this.foundPath = null;
  }
} 
 

class Direction
{
  constructor()
  {
    this.directions = new Array();
    this.directions.push({id:Direction.RIGHT, point: new Point(1, 0)},
        {id:Direction.UP, point: new Point(0, 1)}, 
        {id:Direction.LEFT, point: new Point(-1, 0)},
        {id:Direction.DOWN, point: new Point(0, -1)});
  }
  static get DIRECTION_OBJ()
  {
    return new Direction();
  }
  
  static get UP()
  {
    return 1;
  }
  static get DOWN()
  {
    return 2;
  }
  static get LEFT()
  {
    return 3;
  }
  static get RIGHT()
  {
    return 4;
  }
  static get NONE()
  {
    return 5;
  }
  static get ORDER()
  {
    return [Direction.RIGHT, Direction.UP, Direction.LEFT, Direction.DOWN];
  }
}
class BaseGrid
{
  constructor(xSquares, ySquares)
  {
    this._mazeSquares = new Array();
    this.xSquares = xSquares;
    this.ySquares = ySquares;
  }
  makeFilled(x, y)
  {
    this._mazeSquares[x][y].filled = true;  
  }
  getFilled(x, y)
  {
    return this._mazeSquares[x][y].filled;
  }
  filled()
  {
    let filled = true;
    for(let i = 0; i < this.xSquares; i++)
    {
      for(let j = 0; j < this.ySquares; j++)
      {
        if(!this.getFilled(i,j))
        {
          filled = false;
          break;
        }
      }  
    }
    return filled;
  }
  clear()
  {
    for(let i = 0; i < this.xSquares; i++)
    {
      for(let j = 0; j < this.ySquares; j++)
      {
        this._mazeSquares[i][j].clear();
      }  
    } 
  }
}
class Grid extends BaseGrid
{
  constructor(xSquares, ySquares)
  {
    super(xSquares, ySquares);
    for(let i = 0; i < xSquares; i++)
    {
      this._mazeSquares.push(new Array());
      for(let j = 0; j < ySquares; j++)
      {
        this._mazeSquares[i][j] = new Square(i, j, false);    
      }  
    } 
  }
}
class MazeGrid extends BaseGrid
{
  constructor(xSquares, ySquares)
  {
    super(xSquares, ySquares);
    for(let i = 0; i < xSquares; i++)
    {
      this._mazeSquares.push(new Array());
      for(let j = 0; j < ySquares; j++)
      {
        this._mazeSquares[i][j] = new MazeSquare(i, j, false,
            xSquares, ySquares);    
      }  
    } 
    this.clearSideSquares = []; //squares which can be connected to
    this.directionObj = Direction.DIRECTION_OBJ;
  }
  makeFilled(x, y)
  {
    super.makeFilled(x, y);
    this.doClearSides(this._mazeSquares[x][y], false, true);
    
    if(this._mazeSquares[x][y].checkClearSides())
    {
      this.clearSideSquares.push(this._mazeSquares[x][y]);
    } 
  }
  doClearSides(mazeSquare, remove, neighbour)
  {
    //which sides can be added to
    let squarePoint = new Point(0,0);
    for(let i = 0; i < this.directionObj.directions.length; i++)
    {  
      squarePoint.x = mazeSquare.x;
      squarePoint.y = mazeSquare.y;
      squarePoint.add(this.directionObj.directions[i].point);
      if(mazeSquare.x < this.xSquares - this.directionObj.directions[i].point.x
          && mazeSquare.x  > -1 - this.directionObj.directions[i].point.x &&
          mazeSquare.y < this.ySquares - this.directionObj.directions[i].point.y
          && mazeSquare.y > -1 - this.directionObj.directions[i].point.y &&
          this.getFilled(squarePoint.x, squarePoint.y))
      {
        
        mazeSquare.clearSides[i] = false;
        if(neighbour)
        {
          this.doClearSides(this._mazeSquares[squarePoint.x][squarePoint.y], true, false);
          
        }  
      }
    } 
    if(remove)
    {  
      if(!mazeSquare.checkClearSides())
      {
        // remove from clearSideSquares
        let index = this.clearSideSquares.findIndex(
            function(element)
            {
              if(element === this)
              {
                return true;
              }  
              else
              {
                return false;
              }  
            }, mazeSquare);
        if(index >= 0)
        {
          this.clearSideSquares.splice(index, 1);
        }  
      } 
    }  
  }
  addConnected(x, y, connectedX, connectedY)
  {
    this._mazeSquares[x][y].connectedWith.push(
        this._mazeSquares[connectedX][connectedY]);
  }
  getConnected(x, y)
  {
    return(this._mazeSquares[x][y].connectedWith);
  }
  getLineSides(x, y)
  {
    return(this._mazeSquares[x][y].lineSides);
  }
  setArrowSprite(x, y, arrowSprite)
  {
    this._mazeSquares[x][y].arrowSprite = arrowSprite;
  }
  getArrowSprite(x, y)
  {
    return this._mazeSquares[x][y].arrowSprite;
  }
  setFlagSprite(x, y, flagSprite)
  {
    this._mazeSquares[x][y].flagSprite = flagSprite;
  }
  getFlagSprite(x, y)
  {
    return this._mazeSquares[x][y].flagSprite;
  }
  _calcLineSides()
  {
    let connectedWith = null;
    for(let i = 0; i < this.xSquares; i++)
    {
      for(let j = 0; j < this.ySquares; j++)
      {
        connectedWith = this.getConnected(i, j);
        for(let k = 0; k < connectedWith.length; k++)
        { 
          for(let l = 0; l < this.directionObj.directions.length; l++)
          {  
            if(i + this.directionObj.directions[l].point.x === connectedWith[k].x
                && j + this.directionObj.directions[l].point.y === connectedWith[k].y)
            {
              this._mazeSquares[i][j].lineSides[l] = false;
              break;
            }
          }
        }  
      }
    }  
  }
}
class Square
{
  constructor(x, y, filled)
  {
    this.x = x;
    this.y = y;
    this.filled = filled;
  }
  clear()
  {
    this.filled = false;
  }
}
class MazeSquare extends Square
{
  constructor(x, y, filled, xSquares, ySquares)
  {
    super(x, y, filled);
    this.connectedWith = new Array();
    this.xSquares = xSquares;
    this.ySquares = ySquares;
    this.clearSides = [];
    this._initSetClearSides();
    this.arrowSprite = null;
    this.flagSprite = null;
    this.lineSides = [true, true, true, true];//right, up, left, down
  }
  clear()
  {
    super.clear();
    this._initSetClearSides();
    this.lineSides = [true, true, true, true];//right, up, left, down
  }
  _initSetClearSides()
  {
    this.clearSides = [true, true, true, true]; //right, up, left, down
    if(this.x === this.xSquares - 1)
    {
      this.clearSides[Direction.ORDER.indexOf(Direction.RIGHT)] = false;
    }  
    if(this.y === this.ySquares - 1)
    {
      this.clearSides[Direction.ORDER.indexOf(Direction.UP)] = false;
    }  
    if(this.x === 0)
    {
      this.clearSides[Direction.ORDER.indexOf(Direction.LEFT)] = false;
    }  
    if(this.y === 0)
    {
      this.clearSides[Direction.ORDER.indexOf(Direction.DOWN)] = false;
    }  
  }
  checkClearSides()
  {
    let clear = false;
    for(let i = 0; i < this.clearSides.length; i++)
    {
      if(this.clearSides[i])
      {
        clear = true;
        break;
      }  
    }
    return clear;
  }
}