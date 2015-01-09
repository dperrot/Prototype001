#pragma strict

public class MBInit extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var PUB_cellX : int;
var PUB_cellY : int;
var PUB_cellSize : float;
var PUB_cellHeight : float;
var PUB_cellWallWidth : float;
var PUB_solverType : int;
var PUB_exitDistance : float;
var PUB_lightObject : Transform;
var PUB_exitLightIndex : int;
var PUB_wallOptimizeAdjust : float;
var PUB_wallMinUpdateTime : float;
var PUB_wallDisableDist : float;

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var myTransform : Transform;
private var gameHandler : GHInit;
private var generator : MBGenerate;
private var builder : MBBuild;

private final var WALL_UP    : byte = 1;
private final var WALL_DOWN  : byte = 2;
private final var WALL_LEFT  : byte = 4;
private final var WALL_RIGHT : byte = 8;
private final var WALL_FILL  : byte = 15;
private final var DFS_NOT_VISITED : byte = 16;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// Getter functions for other scripts to call.
function GetSize () { return PUB_cellSize; }
function GetHeight () { return PUB_cellHeight; }
function GetWallWidth () { return PUB_cellWallWidth; }
function GetHandler () { return gameHandler; }
function GetOptimizeAdjust() { return PUB_wallOptimizeAdjust; }
function GetMinUpdateTime() { return PUB_wallMinUpdateTime; }
function GetDisableDistance() { return PUB_wallDisableDist; }

// This function returns a 1D array of empty cells ready to be used for creating mazes
function MakeEmptyMaze(n : byte) 
{
	var a = new byte[PUB_cellX * PUB_cellY];
	for(var i=0; i < a.length; i++) { a[i] = n; }
	return a;
}

// This function will return a random dead end cell that is further than the given squared
// distance. This is ideally used for finding an exit. If none is found, choose furthest
// away cell.
function ChooseDeadEnd(maze : byte[], x : int, y : int, 
					   start : int, dist : float) 
{
	var deadEndList = new int[maze.length];
	var de_i : int = 0;
	var maxDeadEnd : int;
	var maxDeadEndDist : int = 0;
	var sx : int = start % x;
	var sy : int = start / x;
	dist = (x*x + y*y) * dist;
	
	for (var i = 0; i < maze.length; i++) 
	{
		var wallCount : int = 0;
		var cx : int = i % x;
		var cy : int = i / x;
		wallCount += maze[i] & WALL_UP;
		wallCount += maze[i] & WALL_DOWN;
		wallCount += maze[i] & WALL_LEFT;
		wallCount += maze[i] & WALL_RIGHT;
		if (NumOfBits(wallCount) == 3) 
		{
			var tx : int = cx-sx;
			var ty : int = cy-sy;
			var newDist : int = tx*tx + ty*ty;
			if (newDist >= maxDeadEndDist) { maxDeadEnd = i; maxDeadEndDist = newDist; }
			if (newDist >= dist) { deadEndList[de_i++] = i; }
		}
	}
	
	if (de_i == 0) 
	{
		// No dead ends found past the distance. Return furthest dead end.
		return maxDeadEnd;
	} 
	else 
	{
		// We've found some dead ends. Return random set found.
		return deadEndList[RandInt(de_i)];
	}
	
}

// This function will return a random dead end cell that is closest to the starting
// point. This is ideal for finding a good starting place for the player.
function ChooseDeadEnd(maze : byte[], x : int, y : int, start : int) 
{
	var minDeadEnd : int;
	var minDeadEndDist : int = x*x + y*y;
	var sx : int = start % x;
	var sy : int = start / x;
	
	for (var i = 0; i < maze.length; i++) 
	{
		var wallCount : int = 0;
		var cx : int = i % x;
		var cy : int = i / x;
		wallCount += maze[i] & WALL_UP;
		wallCount += maze[i] & WALL_DOWN;
		wallCount += maze[i] & WALL_LEFT;
		wallCount += maze[i] & WALL_RIGHT;
		if (NumOfBits(wallCount) == 3) 
		{
			var tx : int = cx-sx;
			var ty : int = cy-sy;
			var newDist : int = tx*tx + ty*ty;
			if (newDist < minDeadEndDist) { minDeadEnd = i; minDeadEndDist = newDist; }
		}
	}
	
	return minDeadEnd;
	
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Start () {

}

function Initialize (gh : GHInit) 
{
	myTransform = transform;
	generator = GetComponent(MBGenerate);
	builder = GetComponent(MBBuild);
	gameHandler = gh;
	
	var maze : byte[] = MakeEmptyMaze(WALL_FILL);
	var start : int;
	var exit : int;
	var lightCount : int = 0;
	var cornerCount : int = 0;
	
	////
	//Solve the maze
	switch (PUB_solverType)
	{
	case 1: 
		maze = generator.Solve_DFS(maze, PUB_cellX, PUB_cellY); 
		break;
	case 2:
		maze = generator.Solve_Prim(maze, PUB_cellX, PUB_cellY);
		break;
	}
	
	////
	//Now get the start and exit, and build it!
	start = ChooseDeadEnd(maze, PUB_cellX, PUB_cellY, 0);
	exit = ChooseDeadEnd(maze, PUB_cellX, PUB_cellY, start, PUB_exitDistance);
	builder.Build(maze,PUB_cellX,PUB_cellY,0,exit);
	
	////
	//Set up lights
	var tLightList = new CellLight[PUB_cellX * PUB_cellY];
	
	for (var i = 0; i < maze.length; i++) 
	{
		// Initial data numbers
		var cx : int = i % PUB_cellX;
		var cy : int = i / PUB_cellX;
		var halfS : float = PUB_cellSize / 2.0;
		var height : float = PUB_cellHeight / 2.0;
		
		// Light adding step
		var light = Instantiate (PUB_lightObject, 
			Vector3(cx * PUB_cellSize + halfS, height, -cy * PUB_cellSize - halfS), 
			Quaternion.identity);
		light.name = "CellLight" + lightCount++;
		tLightList[i] = light.GetComponent(CellLight);
		if (cx > 0) { tLightList[i].SetNeighbor(tLightList[i-1], true); }
		if (cy > 0) { tLightList[i].SetNeighbor(tLightList[i-PUB_cellX], true); }
		
		// Corner adding step
		// --UPPER-LEFT--
		var tObj = new GameObject("CornerPoint" + cornerCount++);
		tObj.transform.position = Vector3(cx * PUB_cellSize, height, -cy * PUB_cellSize);
		var cp : CornerPoint = tObj.AddComponent(CornerPoint);
		cp.GetWalls(PUB_cellWallWidth);
		cp.AddLight(tLightList[i]);
		if (cx > 0) { cp.AddLight(tLightList[i-1]); }
		if (cy > 0) { cp.AddLight(tLightList[i-PUB_cellX]); }
		if (cy > 0 && cx > 0) { cp.AddLight(tLightList[i-PUB_cellX-1]); }
		
		// --UPPER-RIGHT--
		if (cx == PUB_cellX - 1)
		{
			tObj = new GameObject("CornerPoint" + cornerCount++);
			tObj.transform.position = Vector3((cx+1) * PUB_cellSize, height, -cy * PUB_cellSize);
			cp = tObj.AddComponent(CornerPoint);
			cp.GetWalls(PUB_cellWallWidth);
			cp.AddLight(tLightList[i]);
			if (cy > 0) { cp.AddLight(tLightList[i-PUB_cellX]); }
		}
		
		// --LOWER-LEFT--
		if (cy == PUB_cellY - 1)
		{
			tObj = new GameObject("CornerPoint" + cornerCount++);
			tObj.transform.position = Vector3(cx * PUB_cellSize, height, (-cy-1) * PUB_cellSize);
			cp = tObj.AddComponent(CornerPoint);
			cp.GetWalls(PUB_cellWallWidth);
			cp.AddLight(tLightList[i]);
			if (cx > 0) { cp.AddLight(tLightList[i-1]); }
		}
		
		// --LOWER-RIGHT--
		if (i == maze.length - 1)
		{
			tObj = new GameObject("CornerPoint" + cornerCount++);
			tObj.transform.position = Vector3((cx+1) * PUB_cellSize, height, (-cy-1) * PUB_cellSize);
			cp = tObj.AddComponent(CornerPoint);
			cp.GetWalls(PUB_cellWallWidth);
			cp.AddLight(tLightList[i]);
		}
		
		// Apply color to our lights and corner objects.
		tLightList[i].ComputeColor();
	}
	
	gh.SetLightList(tLightList);
	tLightList[exit].SetLightLevel(PUB_exitLightIndex,1,false);
	
	////
	// Final tweaks
	var dBlockBoolList = new boolean[PUB_cellX * PUB_cellY];
	for (i = 0; i < dBlockBoolList.length; i++) { dBlockBoolList[i] = false; }
	gameHandler.SetDBlockBoolList(dBlockBoolList);
	gameHandler.SetMaze(maze);
	gameHandler.SetCellX(PUB_cellX);
	gameHandler.SetCellY(PUB_cellY);
	gameHandler.SetCellSize(PUB_cellSize);
	gameHandler.SetCellHeight(PUB_cellHeight);
	gameHandler.SetCellWallWidth(PUB_cellWallWidth);
	gameHandler.SetStart(start);
	gameHandler.SetExit(exit);
}

function Update () {

}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	////
	//Object itself
	Gizmos.color = Color(0,1,1,.5); //Teal, semi-transparent
    Gizmos.DrawSphere(transform.position, 0.375);
}

function OnDrawGizmosSelected () {
	////
	//Object itself
	Gizmos.color = Color(0,1,1,1); //Teal
    Gizmos.DrawSphere(transform.position, 0.375);
    
    ////
    //Display what maze could look like
    
    //Floor
    Gizmos.color = Color(1,1,0,1);
    Gizmos.DrawCube(Vector3(PUB_cellX * PUB_cellSize / 2.0,-0.25,-PUB_cellY * PUB_cellSize / 2.0), 
    				Vector3(PUB_cellX * PUB_cellSize, 0.5, PUB_cellY * PUB_cellSize));
    //Walls
    Gizmos.color = Color(0,1,1,.5);
    var max : int = (PUB_cellX < PUB_cellY ? PUB_cellY : PUB_cellX);
    for (var i=0;i<=max;i++) 
    {
    	if (i <= PUB_cellX)
    		Gizmos.DrawCube(Vector3(i * PUB_cellSize, PUB_cellHeight / 2.0, -PUB_cellY * PUB_cellSize / 2.0),
    						Vector3(PUB_cellWallWidth, PUB_cellHeight, PUB_cellY * PUB_cellSize));
    	if (i <= PUB_cellY)
    		Gizmos.DrawCube(Vector3(PUB_cellX * PUB_cellSize / 2.0, PUB_cellHeight / 2.0, -i * PUB_cellSize),
    						Vector3(PUB_cellX * PUB_cellSize, PUB_cellHeight, PUB_cellWallWidth));
    }
    
    //Exit distance
    Gizmos.color = Color(1,0,0,1);
    Gizmos.DrawWireSphere(transform.position,
    	Mathf.Sqrt(PUB_exitDistance * (PUB_cellX*PUB_cellX + PUB_cellY*PUB_cellY)) * PUB_cellSize);
    
}

//--END--

}