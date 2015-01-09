// TODO: Set up a function that sets up material based on what the linkTo is,
// so that the materials make all points point to the exit.

#pragma strict

public class CellBlock extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var PUB_floorpos : float;
var PUB_frameDuration : float;

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var gameHandler : GHInit;
private var collision : BoxCollider;
private var mat : Material;
private var meshObj : GameObject;
private var meshOffset : Vector3;
private var render : MeshRenderer;
private var filter : MeshFilter;
private var pos : int;
private var cellX : byte;
private var cellSize : float;
private var cellDistFromSolution : int;
private var parentSolutionId : int;
private var linkTo : CellBlock;
private var isSolution : boolean;
private var dBlock : DeathBlock;
private var isPlaying : boolean = false;

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
function GetPos() { return pos; }
function GetLink() { return linkTo; }
function GetDBlock() { return dBlock; }
function SetDBlock(d : DeathBlock) { dBlock = d; }
function SetLinkTo(c : CellBlock) { 
	linkTo = c;
	this.AdjustMeshRotation(pos - c.GetPos());
}

// Check if this cell is a solution cell
function CheckSolution() { return isSolution; } 

// Adjust mesh rotation to point the right direction
function AdjustMeshRotation(dif : int) {
	if (dif == 1) {
		meshObj.transform.Rotate(Vector3(0,90,0));
		meshOffset = new Vector3(-cellSize * 0.25,0,0);
	} else if (dif == -1) {
		meshObj.transform.Rotate(Vector3(0,270,0));
		meshOffset = new Vector3(cellSize * 0.25,0,0);
	} else if (dif > 0) {
		meshObj.transform.Rotate(Vector3(0,180,0));
		meshOffset = new Vector3(0,0,cellSize * 0.25);
	} else if (dif < 0) {
		meshOffset = new Vector3(0,0,-cellSize * 0.25);
	}
}

// Make the mesh visible and start animation
function TurnOn() {
	render.enabled = true;
	this.PlayAnim();
}

// Turn off mesh visibility
function TurnOff() { render.enabled = false; }

// Play the pointing animation while arrow is visible
function PlayAnim() {
	if (isPlaying) { return; }
	isPlaying = true;
	while (render.enabled) {
		yield WaitForSeconds(PUB_frameDuration);
		meshObj.transform.localPosition += meshOffset;
		yield WaitForSeconds(PUB_frameDuration);
		meshObj.transform.localPosition -= meshOffset;
	}
} 

// Spawns children based on any undiscovered open walls and adjusts distance accordingly
function SpawnChildren() {
	var cell : byte = gameHandler.GetCell(pos);
	var lastPos : int = linkTo.GetPos();
	var newObj : GameObject;
	var newCellBlock : CellBlock;
	
	if ((cell & WALL_UP) == 0 && pos-cellX != lastPos) {
		newObj = Instantiate(gameHandler.GetCellBlock(),
							 transform.position + Vector3(0,0,cellSize),
							 Quaternion.identity);
		newCellBlock = newObj.GetComponent(CellBlock);
		newCellBlock.Init(gameHandler, mat, pos-cellX, parentSolutionId,
		                  cellDistFromSolution + 1, false);
		newCellBlock.SetLinkTo(this);
		newCellBlock.SpawnChildren();
	}
	
	if ((cell & WALL_DOWN) == 0 && pos+cellX != lastPos) {
		newObj = Instantiate(gameHandler.GetCellBlock(),
							 transform.position + Vector3(0,0,-cellSize),
							 Quaternion.identity);
		newCellBlock = newObj.GetComponent(CellBlock);
		newCellBlock.Init(gameHandler, mat, pos+cellX, parentSolutionId,
		                  cellDistFromSolution + 1, false);
		newCellBlock.SetLinkTo(this);
		newCellBlock.SpawnChildren();
	}
	
	if ((cell & WALL_LEFT) == 0 && pos-1 != lastPos) {
		newObj = Instantiate(gameHandler.GetCellBlock(),
							 transform.position + Vector3(-cellSize,0,0),
							 Quaternion.identity);
		newCellBlock = newObj.GetComponent(CellBlock);
		newCellBlock.Init(gameHandler, mat, pos-1, parentSolutionId,
		                  cellDistFromSolution + 1, false);
		newCellBlock.SetLinkTo(this);
		newCellBlock.SpawnChildren();
	}
	
	if ((cell & WALL_RIGHT) == 0 && pos+1 != lastPos) {
		newObj = Instantiate(gameHandler.GetCellBlock(),
							 transform.position + Vector3(cellSize,0,0),
							 Quaternion.identity);
		newCellBlock = newObj.GetComponent(CellBlock);
		newCellBlock.Init(gameHandler, mat, pos+1, parentSolutionId,
		                  cellDistFromSolution + 1, false);
		newCellBlock.SetLinkTo(this);
		newCellBlock.SpawnChildren();
	}
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Init(gh : GHInit, m : Material, p : int, pIndex : int, d : int, isS : boolean) {
	gameHandler = gh;
	mat = m;
	collision = gameObject.GetComponent(BoxCollider);
	cellX = gh.GetCellX();
	cellDistFromSolution = d;
	pos = p;
	parentSolutionId = pIndex;
	isSolution = isS;
	gameHandler.SetCellList(this);
	
	cellSize = gh.GetCellSize();
	var ch : float = gh.GetCellHeight();
	var csHalf : float = cellSize * 0.5;
	var chHalf : float = ch * 0.5;
	collision.size = Vector3(cellSize,ch,cellSize);
	
	
	// Build mesh here
	meshObj = new GameObject("CellBlock Mesh");
	meshObj.transform.position = gameObject.transform.position;
	filter = meshObj.AddComponent(MeshFilter);
	var mesh = new Mesh();
	filter.mesh = mesh;
	
	var vertices : Vector3[] = new Vector3[4];
	vertices[0] = new Vector3(-csHalf, -chHalf + PUB_floorpos, csHalf);
	vertices[1] = new Vector3(csHalf, -chHalf + PUB_floorpos, csHalf);
	vertices[2] = new Vector3(-csHalf, -chHalf + PUB_floorpos, -csHalf);
	vertices[3] = new Vector3(csHalf, -chHalf + PUB_floorpos, -csHalf);
	mesh.vertices = vertices;
	
	var tri : int[] = [0,1,2,2,1,3];
	mesh.triangles = tri;
	mesh.RecalculateNormals();
	
	var uv: Vector2[] = new Vector2[4];
	uv[0] = new Vector2(0, 0);
	uv[1] = new Vector2(1, 0);
	uv[2] = new Vector2(0, 1);
	uv[3] = new Vector2(1, 1);
	mesh.uv = uv;
	
	meshObj.transform.parent = gameObject.transform;
	render = meshObj.AddComponent(MeshRenderer);
	render.material = mat;
	this.TurnOff();
}

function Start () {

}

function Update () {

}

function OnTriggerEnter(c : Collider) {
	gameHandler.UpdatePlayerInfo(this, 
		(cellDistFromSolution == 0 ? parentSolutionId + 1 : parentSolutionId),
		cellDistFromSolution);
	//Debug.Log("Cell(" + pos + "): " + (cellDistFromSolution == 0 ? parentSolutionId + 1 : parentSolutionId) +
	//          ", " + cellDistFromSolution);
	
	// If death exists, trigger the death sequence
	if (dBlock != null) { gameHandler.DeathInit(); }
}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	Gizmos.color = Color(0.3,0.3,0.3,1);
	Gizmos.DrawCube(transform.position + Vector3(0,12,0), Vector3(1,1,1));
}

function OnDrawGizmosSelected () {

}

//--END--

}