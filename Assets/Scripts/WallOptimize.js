#pragma strict

// TODO: Make sure this script is added to every wall that is being created and run the init
// function.
//
// The init function will save the corner points so that calculations can be done faster. Due
// to the closeness to the other walls, you should also grab the nearby walls to ignore 
// raytracing if possible.
//
// The important thing to do is to determine what the material is, then store both the high end
// shader and the low end shader as well as its variables so that when switching between the 
// shaders is done, the variables can be switched without having to do any lookups.

public class WallOptimize extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  



//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var player : Transform;
private var corners : Vector3[];
private var linker : MBInit;
private var isInvisible : boolean;
private var isDisabled : boolean;
//private var isSelected : boolean;

private final var WALL_MASK : int = 768;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

function Checker(isDelayed : boolean) {
	if (isDelayed) { 
		yield WaitForSeconds(Vector3.Distance(transform.position, player.position)  * linker.GetOptimizeAdjust());
	}
	var hits : RaycastHit[];
	var minHit : int;
	var dist : float;
	var minDist : float;
	var wait : float;
	
	while (true) { //Keep checking forever
		//Corner 1
		dist = Vector3.Distance(corners[0], player.position);
		minDist = dist;
		hits = Physics.RaycastAll(corners[0],
								  Vector3.Normalize(player.position - corners[0]),
								  dist, WALL_MASK);
		minHit = hits.Length;
								  
		//Corner 2
		dist = Vector3.Distance(corners[1], player.position);
		minDist = (minDist < dist ? minDist : dist);
		hits = Physics.RaycastAll(corners[1],
								  Vector3.Normalize(player.position - corners[1]),
								  dist, WALL_MASK);
		minHit = (minHit <= hits.Length ? minHit : hits.Length);
								  
		//Corner 3
		dist = Vector3.Distance(corners[2], player.position);
		minDist = (minDist < dist ? minDist : dist);
		hits = Physics.RaycastAll(corners[2],
								  Vector3.Normalize(player.position - corners[2]),
								  dist, WALL_MASK);
		minHit = (minHit <= hits.Length ? minHit : hits.Length);
								  
		//Corner 4
		dist = Vector3.Distance(corners[3], player.position);
		minDist = (minDist < dist ? minDist : dist);
		hits = Physics.RaycastAll(corners[3],
								  Vector3.Normalize(player.position - corners[3]),
								  dist, WALL_MASK);
		minHit = (minHit <= hits.Length ? minHit : hits.Length);
								  
		//if (isSelected) { Debug.Log("hits: " + hits.Length); }
		
		// If we're too far, disable this checker entirely so we free up some
		// resources
		if (minDist > linker.GetDisableDistance()) {
			gameObject.layer = 9;
			isInvisible = true;
			isDisabled = true;
			break;
		} 
		
		// Invisible check
		if (isInvisible) {
			if (minHit < 3) {
				gameObject.layer = 8;
				isInvisible = false;
			}
		} else {
			if (minHit >= 3) {
				gameObject.layer = 9;
				isInvisible = true;
			}
		}
		
		wait = minDist * linker.GetOptimizeAdjust();
		yield WaitForSeconds((wait > linker.GetMinUpdateTime() ? wait : linker.GetMinUpdateTime()));
		yield WaitForEndOfFrame;
	}
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Init (l : MBInit, nCorners : Vector3[]) {
	linker = l;
	corners = nCorners;
	corners[0] += transform.position;
	corners[1] += transform.position;
	corners[2] += transform.position;
	corners[3] += transform.position;
	player = l.GetHandler().GetPlayer();
	
	isInvisible = false;
	isDisabled = false;
	//isSelected = false;
	
	yield WaitForEndOfFrame;
	this.Checker(false);
}

function Start () {

}

function Update () {
	
}

// This function is used when the wall touches the player's update checker
// and will re-enable it if need be.
function OnTriggerEnter(other : Collider) {
	if (isDisabled) {
		isDisabled = false;
		this.Checker(true);
	}
}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	//isSelected = false;
}

function OnDrawGizmosSelected () {
	//isSelected = true;
	//Gizmos.color = Color(0,1,1,1);
	//Gizmos.DrawRay(Ray(transform.position, Vector3.Normalize(player.position - transform.position)));
}

//--END--

}