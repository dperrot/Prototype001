#pragma strict

public class MBGenerate extends CommonFunctions {

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

private final var WALL_UP    : byte = 1;
private final var WALL_DOWN  : byte = 2;
private final var WALL_LEFT  : byte = 4;
private final var WALL_RIGHT : byte = 8;
private final var WALL_FILL  : byte = 15;
private final var DFS_NOT_VISITED : byte = 16;
private final var PRIM_OUT : byte = 16;
private final var PRIM_FRONTIER : byte = 32;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// This function returns a maze that has been carved using the Depth First Search
// method.
function Solve_DFS(maze : byte[], x : int, y : int) {
	//Make the maze not visited
	for (var i = 0; i < maze.length; i++) { maze[i] += DFS_NOT_VISITED; }

	//Setup the open list
	var open = new int[x*y];
	open[0] = RandInt(x * y);
	maze[open[0]] -= DFS_NOT_VISITED;
	var oi : int = 0;
	
	//Start the loop. When open list length is 0, we're done.
	while (oi >= 0) {
		//See if we have any spots to carve into
		var check = new int[4];
		var check_i : int = 0;
		var ti : int;
		var ci : int = open[oi];
		var cx : int = ci % x;
		var cy : int = ci / x;
		
		ti = cy*x+cx-1;
		if (cx > 0 && (maze[ti] & DFS_NOT_VISITED) != 0) { //Check Left
			check[check_i] = ti; 
			check_i++;
		}
		ti = cy*x+cx+1;
		if (cx < x-1 && (maze[ti] & DFS_NOT_VISITED) != 0) { //Check Right
			check[check_i] = ti; 
			check_i++;
		}
		ti = (cy-1)*x+cx;
		if (cy > 0 && (maze[ti] & DFS_NOT_VISITED) != 0) { //Check Up
			check[check_i] = ti; 
			check_i++;
		}
		ti = (cy+1)*x+cx;
		if (cy < y-1 && (maze[ti] & DFS_NOT_VISITED) != 0) { //Check Down
			check[check_i] = ti;
			check_i++;
		}
			
		//Are we blocked? Keep backtracing, else choose and carve!
		if (check_i == 0) {
			oi--;
		} else {
			var ni : int = check[RandInt(check_i)];
			if (ci - ni == x) { //Carve up?
				maze[ni] -= WALL_DOWN;
				maze[ci] -= WALL_UP;
			} else if (ni - ci == x) { //Carve down?
				maze[ni] -= WALL_UP;
				maze[ci] -= WALL_DOWN;
			} else if (ci - ni == 1) { //Carve left?
				maze[ni] -= WALL_RIGHT;
				maze[ci] -= WALL_LEFT;
			} else if (ni - ci == 1) { //Carve right?
				maze[ni] -= WALL_LEFT;
				maze[ci] -= WALL_RIGHT;
			}
			maze[ni] -= DFS_NOT_VISITED;
			oi++;
			open[oi] = ni;
		}
	}
	
	return maze;
}

// This function returns a maze that has been carved using Prim's Algorithm.
function Solve_Prim(maze : byte[], x : int, y : int) 
{
	// Make the maze not visited
	for (var i = 0; i < maze.length; i++) { maze[i] += PRIM_OUT; }
	
	// Choose random point on maze and set frontiers.
	var frontierList = new int[x*y];
	var frontierCount : int = 0;
	var si : int = maze[RandInt(x * y)];
	var sx : int = si % x;
	var sy : int = si / x;
	maze[si] -= PRIM_OUT;
	if (sx > 0) { frontierList[frontierCount++] = si-1; maze[si-1] -= PRIM_OUT; }
	if (sx < x-1) { frontierList[frontierCount++] = si+1; maze[si+1] -= PRIM_OUT; }
	if (sy > 0) { frontierList[frontierCount++] = si-x; maze[si-x] -= PRIM_OUT; }
	if (sy < y-1) { frontierList[frontierCount++] = si+x; maze[si+x] -= PRIM_OUT; }
	
	while (frontierCount > 0)
	{
		var randi : int = RandInt(frontierCount);
		var ci : int = frontierList[randi];
		var cx : int = ci % x;
		var cy : int = ci / x;
		
		
		
		frontierList[randi] = frontierList[--frontierCount];
	}
	
	return maze;
} 

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

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

}

function OnDrawGizmosSelected () {

}

//--END--

}