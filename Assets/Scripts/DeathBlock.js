#pragma strict

public class DeathBlock extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var DB_lightIndex : int;
var DB_lightAdjust : float;
var DB_targetRate : float;
var DB_emitSizeAdjust : float;

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var pos : int;
private var cellX : int;
private var cellY : int;
private var cellSize : float;
private var DB_emitSize : Vector3;
private var DB_triggerSize : Vector3;
private var DB_canKill : boolean = false;
private var DB_debugHasGrown : float = 0.0;
private var particles : ParticleSystem;
private var gameHandler : GHInit;
private var lightSource : CellLight;
private var isInvisible : boolean;

private final var WALL_UP    : byte = 1;
private final var WALL_DOWN  : byte = 2;
private final var WALL_LEFT  : byte = 4;
private final var WALL_RIGHT : byte = 8;
private final var WALL_MASK : int = 768;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// Setters and Getters
function SetCellXYSize(x : int, y : int, s : float) { cellX = x; cellY = y; cellSize = s; }
function SetGameHandler(gh : GHInit) { gameHandler = gh; }
function SetSize(s : Vector3) { DB_triggerSize = s; 
								DB_emitSize = s - Vector3(DB_emitSizeAdjust,0,DB_emitSizeAdjust); } 

// This function will turn the kill switch on once it reaches a certain point in time.
function TurnKillSwitchOn(duration : float) : IEnumerator
{
	yield WaitForSeconds(duration);
	gameHandler.GetCellBlock(pos).SetDBlock(this);
	if (gameHandler.GetPlayerCellBlock().GetPos() == pos) {
		gameHandler.DeathInit();
	}
}

// This function will gradually grow the particles over a given amount of time
function GrowParticles(duration : float)
{
	var curTime : float = 0.0;
	var normCurTime : float = 0.0;
	var durationInverse : float = 1.0 / duration;
	
	while (curTime <= duration)
	{
		curTime += Time.deltaTime;
		normCurTime = curTime * durationInverse;
		DB_debugHasGrown = normCurTime;
		
		particles.emissionRate = DB_targetRate * normCurTime;
		particles.startSize = normCurTime;
		particles.startSpeed = normCurTime;
		lightSource.SetLightLevel(DB_lightIndex, normCurTime * DB_lightAdjust, false);
		yield WaitForEndOfFrame;
	}
	
	DB_debugHasGrown = 1;
	particles.emissionRate = DB_targetRate;
	particles.startSize = 1;
	particles.startSpeed = 1;
	lightSource.SetLightLevel(DB_lightIndex, 1, false);
}

// This function deals with spawning new DeathBlock children.
function SpawnChildren(index : int, fillRate : float, normKillPoint : float,
					   visUpdateTime : float, minUpdateDur : float)
{
	var newDBCount : int = 0;
	var newDBList = new GameObject[4];
	var newDBIndex = new int[4];
	if ((gameHandler.GetWalls(index) & WALL_UP) == 0 && !gameHandler.GetDBlockBool(index-cellX))
	{ 
		newDBList[newDBCount] = Instantiate(gameHandler.GetDBlock(), 
											  transform.position + Vector3(0,0,cellSize),
											  Quaternion.identity);
		newDBIndex[newDBCount++] = index-cellX;
	}
	if ((gameHandler.GetWalls(index) & WALL_DOWN) == 0 && !gameHandler.GetDBlockBool(index+cellX))
	{ 
		newDBList[newDBCount] = Instantiate(gameHandler.GetDBlock(), 
											  transform.position + Vector3(0,0,-cellSize),
											  Quaternion.identity);
		newDBIndex[newDBCount++] = index+cellX;
	}
	if ((gameHandler.GetWalls(index) & WALL_LEFT) == 0 && !gameHandler.GetDBlockBool(index-1))
	{ 
		newDBList[newDBCount] = Instantiate(gameHandler.GetDBlock(), 
											  transform.position + Vector3(-cellSize,0,0),
											  Quaternion.identity);
		newDBIndex[newDBCount++] = index-1;
	}
	if ((gameHandler.GetWalls(index) & WALL_RIGHT) == 0 && !gameHandler.GetDBlockBool(index+1))
	{ 
		newDBList[newDBCount] = Instantiate(gameHandler.GetDBlock(), 
											  transform.position + Vector3(cellSize,0,0),
											  Quaternion.identity);
		newDBIndex[newDBCount++] = index+1;
	}
	
	for (var i = 0; i < newDBCount; i++)
	{
		var newDBScript : DeathBlock = newDBList[i].GetComponent(DeathBlock);
		newDBScript.SetSize(DB_triggerSize);
		newDBScript.SetCellXYSize(cellX, cellY, cellSize);
		newDBScript.SetGameHandler(gameHandler);
		newDBScript.Initialize(newDBIndex[i], gameHandler.GetFillRate(), normKillPoint, visUpdateTime,
		                       minUpdateDur);
	}
}

// This function will continuously cast a ray towards a player, detecting how
// many walls it has hit. Particles will toggle visibility based on how far
// behind a certain number of walls it hits, with more triggering invisibility.
function VisualCheck(visUpdateTime : float, minDuration : float) {
	var p : Transform = gameHandler.GetPlayer();
	var dist : float;
	var hits : RaycastHit[];
	var wait : float;
	
	while (true) { //Keep checking forever
		dist = Vector3.Distance(transform.position, p.position);
		hits = Physics.RaycastAll(transform.position,
								  Vector3.Normalize(p.position - transform.position),
								  dist, WALL_MASK);
								  
		// Invisible check
		if (isInvisible) {
			if (hits.Length < 2) {
				particles.Play();
				isInvisible = false;
			}
		} else {
			if (hits.Length >= 2) {
				particles.Stop();
				particles.Clear();
				isInvisible = true;
			}
		}
		
		wait = dist * visUpdateTime;
		yield WaitForSeconds((wait < minDuration ? minDuration : wait));
	}
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Initialize(index : int, fillRate : float, normKillPoint : float,
					visUpdateTime : float, minUpdateDur : float)
{
	pos = index;
	isInvisible = false;
	lightSource = gameHandler.GetLight(index);
	particles = gameObject.GetComponent(ParticleSystem);
	gameHandler.SetDBlockBool(index, true);
	
	// Grow particles and wait till it's done
	this.TurnKillSwitchOn(fillRate * normKillPoint);
	yield StartCoroutine(GrowParticles(fillRate));
	
	// Death block is fully grown, spawn its neighbors
	// and start the visual checker to hide itself for
	// performance.
	this.SpawnChildren(index, fillRate, normKillPoint, visUpdateTime,
					   minUpdateDur);
	this.VisualCheck(visUpdateTime, minUpdateDur);
}

function Start () {

}

function Update () {

}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	var t : float = cellSize * DB_debugHasGrown * 0.5;
	Gizmos.color = Color(0.8,0.8,0.8,1);
	Gizmos.DrawCube(transform.position + Vector3(0,10,0), Vector3(t,1,t));	
}

function OnDrawGizmosSelected () {

}

//--END--

}