#pragma strict
import System.Collections.Generic;

public class GHInit extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var mazeBuilder : Transform;
var player : Transform;
var deathBlock : GameObject;
var deathBlockOverlay : GameObject;
var overlayCam : CamTexture;
var deathFlashSeconds : float;
var deathDurationBeforePixels : float;
var deathPixelDuration : float;
var delayBeforeRestart : float;
var timeBeforeFlood : float;
var dbFillRate : float;
var dbSpeedFillRate : float;
var dbNormKillPoint : float;
var dbVisUpdateTime : float;
var dbMinUpdateDur : float;
var tempExitSphere : GameObject;
var cellBlock : GameObject;
var cellBlockMat : Material;
var startSolutionsCount : int;
var distCalcAdjust : float;
var minRescueDistance : int;

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var cam : Transform;
private var cellX : int;
private var cellY : int; 
private var cellSize : float;
private var cellHeight : float;
private var cellWallWidth : float;
private var maze : byte[];
private var solutionPath : int[];
private var start : int;
private var exit : int;
private var score : int[];
private var mazeBuilderScript : MBInit;
private var lightList : CellLight[];
private var cellBlockList : CellBlock[];
private var dBlockBoolList : boolean[];

private var p_closestSolutionIndex : int;
private var p_dist : int;
private var p_currentCell : CellBlock;
private var rescueCells : CellBlock[]; 
private var rescueTarget : int;
private var rescueMode : boolean;
private var rescueFail : boolean;

private final var WALL_UP    : byte = 1;
private final var WALL_DOWN  : byte = 2;
private final var WALL_LEFT  : byte = 4;
private final var WALL_RIGHT : byte = 8;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// Setters and Getters
function GetLight(i : int) { return lightList[i]; }
function GetWalls(i : int) { return maze[i]; }
function GetDBlockBool (i : int) { return dBlockBoolList[i]; }
function GetDBlock() { return deathBlock; }
function GetPlayer() { return player; }
function GetCellSize() { return cellSize; }
function GetCellHeight() { return cellHeight; }
function GetCellX() { return cellX; }
function GetCellBlock() { return cellBlock; }
function GetCell(i : int) { return maze[i]; }
function GetCellBlock(i : int) { return cellBlockList[i]; }
function GetPlayerCellBlock() { return p_currentCell; }
function GetFillRate() { return (rescueFail ? dbSpeedFillRate : dbFillRate); }
function SetLightList (l : CellLight[]) { lightList = l; }
function SetDBlockBoolList (l : boolean[]) { dBlockBoolList = l; }
function SetDBlockBool (i : int, b : boolean) { dBlockBoolList[i] = b; }
function SetCellX (n : int) { cellX = n; }
function SetCellY (n : int) { cellY = n; }
function SetCellSize (n : float) { cellSize = n; }
function SetCellHeight (n : float) { cellHeight = n; }
function SetCellWallWidth (n : float) { cellWallWidth = n; }
function SetCellList (c : CellBlock) { cellBlockList[c.GetPos()] = c; }
function SetMaze (m : byte[]) { maze = m; }
function SetStart (n : int) { start = n; }
function SetExit (n : int) { exit = n; }

// This function places the player in the appropriate position and sets rotation
// of the object pointing torwards an empty space
function SetPlayerPosition(pos : int)
{
	var x : int = pos % cellX;
	var y : int = pos / cellX;
	player.transform.position = Vector3(x * cellSize + (cellSize * 0.5), 1,
										-y * cellSize - (cellSize * 0.5));
	player.rotation = Quaternion.identity;
	
	if ((maze[pos] & WALL_DOWN) == 0) { player.Rotate(0,180,0); }
	else if ((maze[pos] & WALL_LEFT) == 0) { player.Rotate(0,270,0); }
	else if ((maze[pos] & WALL_RIGHT) == 0) { player.Rotate(0,90,0); }
}

// This function will wait a certain amount of time, then spawn a death block at
// starting location, feeding it its initial variables so the block can recursively
// do its job.
function SpawnDeathBlock(time : float)
{
	var sx : int = start % cellX;
	var sy : int = start / cellX;
	var halfS : float = cellSize / 2.0;
	var height : float = cellHeight / 2.0;
	yield WaitForSeconds(time);
	
	var db : GameObject = Instantiate(deathBlock, 
		Vector3(sx * cellSize + halfS, height, -sy * cellSize - halfS),
		Quaternion.identity);
	var dbScript : DeathBlock = db.GetComponent(DeathBlock);
	
	dbScript.SetSize(Vector3(cellSize,cellHeight,cellSize));
	dbScript.SetCellXYSize(cellX, cellY, cellSize);
	dbScript.SetGameHandler(this);
	dbScript.Initialize(start, dbFillRate, dbNormKillPoint, dbVisUpdateTime,
						dbMinUpdateDur);
	this.CheckPlayerProgress();
}

// This function will utilize a WaitForSeconds synced up with the death block
// fill rate to check after a death block iteration where the player is in
// relation to the exit and whether or not a rescue needs to be called. This
// function will also check if the rescue was not successful after a certain
// amount of time, altering the fill rate of the death blocks.
function CheckPlayerProgress() {
	var dbSPos : int = 0;
	
	while (!rescueFail) {
		if (rescueMode) {
			if (dbSPos >= rescueTarget) { rescueFail = true; } 
		} else if (p_dist > 0) {
			if ((p_closestSolutionIndex - dbSPos <= p_dist * distCalcAdjust) ||
			    (p_closestSolutionIndex - dbSPos <= minRescueDistance)) {
				this.RescueInit();
			}
		}
		
		yield WaitForSeconds(dbFillRate);
		dbSPos++;
	}
}

// This function is a comparator for the FindShortestPath function
function CellComparator(a : int, b : int) {
	var exitVector : Vector2 = Vector2(exit % cellX, exit / cellX);
	var aV : float = (Vector2(a % cellX, a / cellX) - exitVector).magnitude + score[a];
	var bV : float = (Vector2(b % cellX, b / cellX) - exitVector).magnitude + score[b];
	if (aV == bV) { return 0; }
	return (aV < bV ? -1 : 1);
}

// This function will return a list of indexes in order of traversal that indicates
// the shortest path needed to reach the exit.
function FindShortestPath() {
	var openList : List.<int> = new List.<int>();
	var openListCount : int = 1;
	var visitPath : int[] = new int[cellX*cellY];
	score = new int[cellX*cellY];
	var curPos : int;
	var nextPos : int;
	for (var i=0; i < visitPath.length; i++) { visitPath[i] = -2; }
	openList.Add(start);
	visitPath[start] = -1;
	
	while (openListCount-- > 0) {
		curPos = openList[0];
		openList.RemoveAt(0);
		
		nextPos = curPos-cellX; //UP
		if ((maze[curPos] & WALL_UP) == 0 && visitPath[nextPos] == -2) {
			openList.Add(nextPos);
			openListCount++;
			visitPath[nextPos] = curPos;
			score[nextPos] = score[curPos] + 1;
			if (nextPos == exit) { break; }
		}
		
		nextPos = curPos+cellX; //DOWN
		if ((maze[curPos] & WALL_DOWN) == 0 && visitPath[nextPos] == -2) {
			openList.Add(nextPos);
			openListCount++;
			visitPath[nextPos] = curPos;
			score[nextPos] = score[curPos] + 1;
			if (nextPos == exit) { break; }
		}
		
		nextPos = curPos-1; //LEFT
		if ((maze[curPos] & WALL_LEFT) == 0 && visitPath[nextPos] == -2) {
			openList.Add(nextPos);
			openListCount++;
			visitPath[nextPos] = curPos;
			score[nextPos] = score[curPos] + 1;
			if (nextPos == exit) { break; }
		}
		
		nextPos = curPos+1; //RIGHT
		if ((maze[curPos] & WALL_RIGHT) == 0 && visitPath[nextPos] == -2) {
			openList.Add(nextPos);
			openListCount++;
			visitPath[nextPos] = curPos;
			score[nextPos] = score[curPos] + 1;
			if (nextPos == exit) { break; }
		}
		
		openList.Sort(CellComparator);
	}
	
	curPos = exit;
	var path : List.<int> = new List.<int>();
	while (curPos != -1) {
		path.Add(curPos);
		curPos = visitPath[curPos];
	}
	
	path.Reverse();
	solutionPath = path.ToArray();
	
}

// This function updates variables when a player collides with a cell block.
function UpdatePlayerInfo(c : CellBlock, si : int, d : int) {
	if (rescueMode && d > p_dist) { c.TurnOn(); }
	else if (rescueMode) { c.TurnOff(); }
	p_currentCell = c;
	p_closestSolutionIndex = si;
	p_dist = d; 
	if (rescueMode && si == rescueTarget) { this.RescueSuccess(); }
}

// This function will initialize the rescue mode of the game, where cells point
// back to the solution path and save the player before the lava fills up and
// kills off the player.
function RescueInit() {
	rescueCells = new CellBlock[1+p_dist];
	var i : int = 0;
	var curCell : CellBlock = p_currentCell;
	
	while (!curCell.CheckSolution()) {
		rescueCells[i++] = curCell;
		curCell.TurnOn();
		curCell = curCell.GetLink();
	}
	rescueCells[i] = curCell;
	rescueTarget = p_closestSolutionIndex + 1;
	curCell.TurnOn();
	rescueMode = true;
}

// This function will turn off rescue mode and resume normal play
function RescueSuccess() {
	for (var i = 0; i < rescueCells.length; i++) {
		rescueCells[i].TurnOff();
	}
	rescueMode = false;
}

// This function controls freezing/unfreezing of the player character.
public function SetPlayerFreeze(b : boolean) {
	cam.GetComponent(MouseLook).SetFrozen(b);
	player.GetComponent(MouseLook).SetFrozen(b);
	player.GetComponent(FPSWalkerEnhanced).SetFrozen(b);
}

// This function starts the death sequence, triggering special animation and facilitating
// the restart of the game.
function DeathInit() : IEnumerator {
	//Debug.Log("Death has been triggered");
	SetPlayerFreeze(true);
	overlayCam.triggerWhiteFlash(deathFlashSeconds);
	deathBlockOverlay.particleSystem.Play();
	yield WaitForSeconds(deathDurationBeforePixels);
	overlayCam.WhiteFadeIn(deathPixelDuration);
	overlayCam.AnimateBlackPixels(deathPixelDuration);
	yield WaitForSeconds(deathPixelDuration);
	
	deathBlockOverlay.particleSystem.Stop();
	deathBlockOverlay.particleSystem.Clear();
	cam.camera.enabled = false;
	yield WaitForEndOfFrame;
	
	// Reset the board, then wait for a couple of seconds before spawning player again 
	//Debug.Log("Destroying all death blocks");
	for (var dBlock in GameObject.FindGameObjectsWithTag("DeathBlock")) {
		UnityEngine.Object.Destroy(dBlock);
	}
	if (rescueMode) { 
		//Debug.Log("We are in rescue mode, turning it off");
		this.RescueSuccess(); 
	} else {
		//Debug.Log("We aren't in rescue mode");
	}
	//Debug.Log("Doing further resetting checks for each cell.");
	for (var i = 0; i < maze.Length; i++) {
		lightList[i].SetLightLevel(1,0,true);
		cellBlockList[i].TurnOff();
		dBlockBoolList[i] = false;
	}
	//lightList[exit].SetLightLevel(2,1,true);
	//Debug.Log("Turning on starting solution paths again");
	for (i = 0; i < startSolutionsCount; i++) {
		cellBlockList[solutionPath[i]].TurnOn();
	}
	rescueFail = false;
	//Debug.Log("Waiting for " + delayBeforeRestart + " seconds...");
	//yield WaitForSeconds(delayBeforeRestart);
	//Debug.Log("Spawning the player");
	
	this.SpawnPlayer(delayBeforeRestart);
}

// This function handles spawning the player either initially or after death.
function SpawnPlayer(delay : float) {
	yield WaitForEndOfFrame;
	if (delay != 0) {
		yield WaitForSeconds(delay);
	}
	
	cam.GetComponent(MouseLook).ResetY();
	this.SetPlayerPosition(start);
	
	//Fancy spawn animation stuff here
	cam.camera.enabled = true;
	overlayCam.ReverseAnimateBlackPixels(deathPixelDuration);
	overlayCam.triggerWhiteFlash(deathPixelDuration);
	yield WaitForSeconds(deathPixelDuration * 0.5);
	
	//Enable player movement
	SetPlayerFreeze(false);
	
	//Spawn the death block after grace period ends.
	this.SpawnDeathBlock(timeBeforeFlood);
	
	yield WaitForSeconds(deathPixelDuration * 0.5);
	overlayCam.ClearBlackPixels();
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Start () {
	cam = player.FindChild("Main Camera");
	
	// Create the maze. The variables will come back to this class.
	mazeBuilderScript = mazeBuilder.GetComponent(MBInit);
	mazeBuilderScript.Initialize(this);
	
	// Figure out the shortest path from start to end. This will be used to determine
	// ways of detecting if the player is heading the right way or not and to figure
	// out if they can still complete the maze.
	this.FindShortestPath();
	cellBlockList = new CellBlock[cellX*cellY];
	var tempObj : GameObject;
	var childObj : GameObject;
	var tempCellBlock : CellBlock;
	var childCellBlock : CellBlock;
	var lastCellBlock : CellBlock;
	var sx : int;
	var sy : int;
	for(var i = 0; i < solutionPath.length; i++) {
		sx = solutionPath[i] % cellX;
		sy = solutionPath[i] / cellX;
		tempObj = Instantiate(cellBlock,
							  Vector3(sx * cellSize + cellSize / 2.0, cellHeight / 2.0, -sy * cellSize - cellSize / 2.0),
							  Quaternion.identity);
		tempCellBlock = tempObj.GetComponent(CellBlock);
		tempCellBlock.Init(this, cellBlockMat, solutionPath[i], i-1, 0, true);
		if (i < startSolutionsCount) { tempCellBlock.TurnOn(); }
		if (i == 0) { p_currentCell = tempCellBlock; }
		if (lastCellBlock != null) { lastCellBlock.SetLinkTo(tempCellBlock); }
		
		if ((maze[solutionPath[i]] & WALL_UP) == 0 && 
		    (i == solutionPath.Length-1 ? true : solutionPath[i]-cellX != solutionPath[i+1]) &&
		    (i == 0 ? true : solutionPath[i]-cellX != solutionPath[i-1])) {
			childObj = Instantiate(cellBlock,
								   tempObj.transform.position + Vector3(0,0,cellSize),
								   Quaternion.identity);
			childCellBlock = childObj.GetComponent(CellBlock);
			childCellBlock.Init(this, cellBlockMat, solutionPath[i]-cellX, i, 1, false);
			childCellBlock.SetLinkTo(tempCellBlock);
			childCellBlock.SpawnChildren();
		}
		
		if ((maze[solutionPath[i]] & WALL_DOWN) == 0 && 
		    (i == solutionPath.Length-1 ? true : solutionPath[i]+cellX != solutionPath[i+1]) &&
		    (i == 0 ? true : solutionPath[i]+cellX != solutionPath[i-1])) {
			childObj = Instantiate(cellBlock,
								   tempObj.transform.position + Vector3(0,0,-cellSize),
								   Quaternion.identity);
			childCellBlock = childObj.GetComponent(CellBlock);
			childCellBlock.Init(this, cellBlockMat, solutionPath[i]+cellX, i, 1, false);
			childCellBlock.SetLinkTo(tempCellBlock);
			childCellBlock.SpawnChildren();
		}
		
		if ((maze[solutionPath[i]] & WALL_LEFT) == 0 && 
		    (i == solutionPath.Length-1 ? true : solutionPath[i]-1 != solutionPath[i+1]) &&
		    (i == 0 ? true : solutionPath[i]-1 != solutionPath[i-1])) {
			childObj = Instantiate(cellBlock,
								   tempObj.transform.position + Vector3(-cellSize,0,0),
								   Quaternion.identity);
			childCellBlock = childObj.GetComponent(CellBlock);
			childCellBlock.Init(this, cellBlockMat, solutionPath[i]-1, i, 1, false);
			childCellBlock.SetLinkTo(tempCellBlock);
			childCellBlock.SpawnChildren();
		}
		
		if ((maze[solutionPath[i]] & WALL_RIGHT) == 0 && 
		    (i == solutionPath.Length-1 ? true : solutionPath[i]+1 != solutionPath[i+1]) &&
		    (i == 0 ? true : solutionPath[i]+1 != solutionPath[i-1])) {
			childObj = Instantiate(cellBlock,
								   tempObj.transform.position + Vector3(cellSize,0,0),
								   Quaternion.identity);
			childCellBlock = childObj.GetComponent(CellBlock);
			childCellBlock.Init(this, cellBlockMat, solutionPath[i]+1, i, 1, false);
			childCellBlock.SetLinkTo(tempCellBlock);
			childCellBlock.SpawnChildren();
		}  
		
		lastCellBlock = tempCellBlock;
	}
	p_closestSolutionIndex = 0;
	p_dist = 0;
	rescueMode = false;
	
	// Create start player and place exit sphere
	var ex : int = exit % cellX;
	var ey : int = exit / cellX;
	Instantiate(tempExitSphere, 
		Vector3(ex * cellSize + cellSize / 2.0, cellHeight / 2.0, -ey * cellSize - cellSize / 2.0),
		Quaternion.identity);
	//for(var i = 0; i < solutionPath.length; i++) {
	//	Instantiate(tempExitSphere, 
	//		Vector3((solutionPath[i] % cellX) * cellSize + cellSize / 2.0,
	//		        cellHeight / 2.0,
	//		        -(solutionPath[i] / cellX) * cellSize - cellSize / 2.0),
	//		Quaternion.identity);
	//}
	
	player.gameObject.SetActive(true);
	this.SpawnPlayer(0);
}

function Update () {

}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	Gizmos.color = Color (1,0,0,.5);
    Gizmos.DrawCube (transform.position, Vector3 (1,1,1));
}

function OnDrawGizmosSelected () {
	Gizmos.color = Color (1,0,0,1);
    Gizmos.DrawCube (transform.position, Vector3 (1,1,1));
}

//--END--

}