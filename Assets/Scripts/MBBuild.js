#pragma strict

public class MBBuild extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var PUB_wallTexture_LR : Material;
var PUB_wallTexture_L : Material;
var PUB_wallTexture_R : Material;
var PUB_wallTexture_N : Material;
//var PUB_wallTexture_LR_Low : Material;
//var PUB_wallTexture_L_Low : Material;
//var PUB_wallTexture_R_Low : Material;
//var PUB_wallTexture_N_Low : Material;
var PUB_wallTexture_Thin : Material;
var PUB_floorTexture : Material;
var PUB_ceilTexture : Material;

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var linker : MBInit;

private var size : float;
private var height : float;
private var wallWidth : float;
private var halfWallWidth : float;
private var wallCount : int;

private final var WALL_UP    : byte = 1;
private final var WALL_DOWN  : byte = 2;
private final var WALL_LEFT  : byte = 4;
private final var WALL_RIGHT : byte = 8;
private final var WALL_FILL  : byte = 15;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// This function, given the right variables, will create a mesh, plopped into the game
// world and returned as an object for further manipulation.
function WallBuild(pX1: float, pZ1: float, 
                   pX2: float, pZ2: float,
                   floor: boolean, flipped: boolean, tiled: boolean,
                   offset: float, tex: Material)
{
	var wall : GameObject = new GameObject("wall" + wallCount);
	wall.transform.position = Vector3((pX1 + pX2) * 0.5, height * 0.5, (pZ1 + pZ2) * 0.5);
	var mf: MeshFilter = wall.AddComponent(MeshFilter);
	var mesh = new Mesh();
	mf.mesh = mesh;

	var vertices: Vector3[] = new Vector3[4];

	if (floor) {
		vertices[0] = new Vector3(pX1, offset, pZ1) - wall.transform.position;
		vertices[1] = new Vector3(pX1, offset, pZ2) - wall.transform.position;
		vertices[2] = new Vector3(pX2, offset, pZ1) - wall.transform.position;
		vertices[3] = new Vector3(pX2, offset, pZ2) - wall.transform.position;
	} else {
		vertices[0] = new Vector3(pX1, offset, pZ1) - wall.transform.position;
		vertices[1] = new Vector3(pX2, offset, pZ2) - wall.transform.position;
		vertices[2] = new Vector3(pX1, offset+height, pZ1) - wall.transform.position;
		vertices[3] = new Vector3(pX2, offset+height, pZ2) - wall.transform.position;
		wall.tag = "Wall";
		wall.layer = 8;
	}

	mesh.vertices = vertices;

	var tri: int[] = new int[6];

	if (flipped) {
		tri[0] = 0;
		tri[1] = 2;
		tri[2] = 1;
	
		tri[3] = 2;
		tri[4] = 3;
		tri[5] = 1;
	} else {
		tri[0] = 0;
		tri[1] = 1;
		tri[2] = 2;
	
		tri[3] = 2;
		tri[4] = 1;
		tri[5] = 3;
	}

	mesh.triangles = tri;
	mesh.RecalculateNormals();

	//var normals: Vector3[] = new Vector3[4];
	//
	//normals[0] = -Vector3.forward;
	//normals[1] = -Vector3.forward;
	//normals[2] = -Vector3.forward;
	//normals[3] = -Vector3.forward;
	//
	//mesh.normals = normals;

	var uv: Vector2[] = new Vector2[4]; 
	var norm : Vector3 = mesh.normals[0];
	
	if (tiled) {
		if (Mathf.Abs(norm.x) == 1.0) {
			uv[0] = new Vector2(vertices[0].y, vertices[0].z);
			uv[1] = new Vector2(vertices[1].y, vertices[1].z);
			uv[2] = new Vector2(vertices[2].y, vertices[2].z);
			uv[3] = new Vector2(vertices[3].y, vertices[3].z); 
		} else if (Mathf.Abs(norm.y) == 1.0) {
			uv[0] = new Vector2(vertices[0].x, vertices[0].z);
			uv[1] = new Vector2(vertices[1].x, vertices[1].z);
			uv[2] = new Vector2(vertices[2].x, vertices[2].z);
			uv[3] = new Vector2(vertices[3].x, vertices[3].z);
		} else if (Mathf.Abs(norm.z) == 1.0) {
			uv[0] = new Vector2(vertices[0].x, vertices[0].y);
			uv[1] = new Vector2(vertices[1].x, vertices[1].y);
			uv[2] = new Vector2(vertices[2].x, vertices[2].y);
			uv[3] = new Vector2(vertices[3].x, vertices[3].y);
		} else {
			uv[0] = new Vector2(0, 0);
			uv[1] = new Vector2(1, 0);
			uv[2] = new Vector2(0, 1);
			uv[3] = new Vector2(1, 1); 
		}
	} else {
		uv[0] = new Vector2(0, 0);
		uv[1] = new Vector2(1, 0);
		uv[2] = new Vector2(0, 1);
		uv[3] = new Vector2(1, 1);
	}

	mesh.uv = uv;
	var mr : MeshRenderer;
	mr = wall.AddComponent(MeshRenderer);
	if (!floor) {
		var wo : WallOptimize;
		wo = wall.AddComponent(WallOptimize);
		if (tex.GetTag("WallType", false) == "1") {
			var lw = tex.GetFloat("_LineWidth");
			var x = Vector3.Distance(vertices[0],vertices[1]);
			var y = Vector3.Distance(vertices[0],vertices[2]);
			tex.SetFloat("_LineWidthX", lw * (y/x));
		}
		wo.Init(linker, vertices);
	}
	mr.material = tex;
	
	var mc : MeshCollider;
	mc = wall.AddComponent(MeshCollider);
	//mc.sharedMesh = mesh;
	//mc.convex = true;
	
	//var rb : Rigidbody;
	//rb = wall.AddComponent(Rigidbody);
	//rb.isKinematic = true;
	//rb.useGravity = false;
	
	wallCount++;
	
}

// This function will return the correct wall material to use based on given
// numerical input. 0b1 = right, 0b2 = left.
function GetWallMat (n : byte) {
	switch(n)
	{
	case 1:
		return PUB_wallTexture_R;
	case 2:
		return PUB_wallTexture_L;
	case 3:
		return PUB_wallTexture_LR;
	default:
		return PUB_wallTexture_N;
	}
}

// This function will handle the systematic process of creating all the 3D structure of a maze.
function Build (maze : byte[], x : int, y : int, start : int, exit : int) {
	
	////
	// We need to run 4 passes through the indexes of the maze array. Each pass is for the
	// different sides of the walls.
	//
	// WALL_UP:    Runs along X, points at -Z
	// WALL_DOWN:  Runs along X, points at Z
	// WALL_LEFT:  Runs along -Z, points at X
	// WALL_RIGHT: Runs along -Z, points at -X
	//
	// While going through the array, if we have a cell with the wall we are looking for,
	// mark the start and keep going. If we hit a dead end for the wall, mark the end and
	// build the wall.
	//
	// If we have an open cell before the start and/or after, make sure those are noted, and
	// based off of that, add extra spacing on the walls based off wall thickness.
	//
	// If we have the particular wall as the dead end (the opposite side being the only one
	// open), immediately build the wall and continue on.
	//
	// If we are at a cell without the particular wall we're looking for, and the next cell
	// also is open, we create a wall just for that width between the two cells.
	
	linker = GetComponent(MBInit);
	size = linker.GetSize();
	height = linker.GetHeight();
	wallWidth = linker.GetWallWidth();
	halfWallWidth = wallWidth / 2.0;
	
	for (var i = 0; i < maze.length; i++) {
		
		//Debug.Log(maze[i]);
		var cx : int = i % x;
		var cy : int = i / x;
		var lo : float = 0;
		var ro : float = 0;
		var bcheck : byte = 0;
		
		////
		//Wall Up
		if ((maze[i] & WALL_UP) != 0) {
			// Border check - Left
			if ((maze[i] & WALL_LEFT) != 0) {
				// Yes, there's a wall.
				lo += halfWallWidth;
				bcheck += 2;
			} else if ((maze[i-1] & WALL_UP) == 0) {
				// No wall, but still at edge of WALL_UP
				lo -= halfWallWidth;
				bcheck += 2;
			}
			
			// Border check - Right
			if ((maze[i] & WALL_RIGHT) != 0) {
				ro += halfWallWidth;
				bcheck += 1;
			} else if ((maze[i+1] & WALL_UP) == 0) {
				ro -= halfWallWidth;
				bcheck += 1;
			}
			
			// Build wall
			WallBuild(cx * size + lo,
			          -cy * size - halfWallWidth,
			          (cx+1) * size - ro,
			          -cy * size - halfWallWidth,
			          false,true,false,0,GetWallMat(bcheck));
		} else if ((maze[i] & WALL_LEFT) == 0 &&
		           (maze[i-1] & WALL_UP) == 0) {
			// We have a thin wall, build it!
			WallBuild(cx * size - halfWallWidth,
			          -cy * size - halfWallWidth,
			          cx * size + halfWallWidth,
			          -cy * size - halfWallWidth,
			          false,true,false,0,PUB_wallTexture_Thin);
		}
		
		lo = 0;
		ro = 0;
		bcheck = 0;
		
		////
		//Wall Down
		if ((maze[i] & WALL_DOWN) != 0) {
			// Border check - Left
			if ((maze[i] & WALL_LEFT) != 0) {
				lo += halfWallWidth;
				bcheck += 2;
			} else if ((maze[i-1] & WALL_DOWN) == 0) {
				lo -= halfWallWidth;
				bcheck += 2;
			}
			
			// Border check - Right
			if ((maze[i] & WALL_RIGHT) != 0) {
				ro += halfWallWidth;
				bcheck += 1;
			} else if ((maze[i+1] & WALL_DOWN) == 0) {
				ro -= halfWallWidth;
				bcheck += 1;
			}
			
			// Build wall
			WallBuild(cx * size + lo,
			          -(cy+1) * size + halfWallWidth,
			          (cx+1) * size - ro,
			          -(cy+1) * size + halfWallWidth,
			          false,false,false,0,GetWallMat(bcheck));
		} else if ((maze[i] & WALL_LEFT) == 0 &&
		           (maze[i-1] & WALL_DOWN) == 0) {
			// We have a thin wall, build it!
			WallBuild(cx * size - halfWallWidth,
			          -(cy+1) * size + halfWallWidth,
			          cx * size + halfWallWidth,
			          -(cy+1) * size + halfWallWidth,
			          false,false,false,0,PUB_wallTexture_Thin);
		}
		
		lo = 0;
		ro = 0;
		bcheck = 0;
		
		////
		//Wall Left
		if ((maze[i] & WALL_LEFT) != 0) {
			// Border check - Up
			if ((maze[i] & WALL_UP) != 0) {
				lo -= halfWallWidth;
				bcheck += 2;
			} else if ((maze[i-x] & WALL_LEFT) == 0) {
				lo += halfWallWidth;
				bcheck += 2;
			}
			
			// Border check - Down
			if ((maze[i] & WALL_DOWN) != 0) {
				ro -= halfWallWidth;
				bcheck += 1;
			} else if ((maze[i+x] & WALL_LEFT) == 0) {
				ro += halfWallWidth;
				bcheck += 1;
			}
			
			// Build wall
			WallBuild(cx * size + halfWallWidth,
			          -cy * size + lo,
			          cx * size + halfWallWidth,
			          -(cy+1) * size - ro,
			          false,false,false,0,GetWallMat(bcheck));
		} else if ((maze[i] & WALL_UP) == 0 &&
		           (maze[i-x] & WALL_LEFT) == 0) {
			// We have a thin wall, build it!
			WallBuild(cx * size + halfWallWidth,
			          -cy * size + halfWallWidth,
			          cx * size + halfWallWidth,
			          -cy * size - halfWallWidth,
			          false,false,false,0,PUB_wallTexture_Thin);
		}
		
		lo = 0;
		ro = 0;
		bcheck = 0;
		
		////
		//Wall Right
		if ((maze[i] & WALL_RIGHT) != 0) {
			// Border check - Up
			if ((maze[i] & WALL_UP) != 0) {
				lo -= halfWallWidth;
				bcheck += 2;
			} else if ((maze[i-x] & WALL_RIGHT) == 0) {
				lo += halfWallWidth;
				bcheck += 2;
			}
			
			// Border check - Down
			if ((maze[i] & WALL_DOWN) != 0) {
				ro -= halfWallWidth;
				bcheck += 1;
			} else if ((maze[i+x] & WALL_RIGHT) == 0) {
				ro += halfWallWidth;
				bcheck += 1;
			}
			
			// Build wall
			WallBuild((cx+1) * size - halfWallWidth,
			          -cy * size + lo,
			          (cx+1) * size - halfWallWidth,
			          -(cy+1) * size - ro,
			          false,true,false,0,GetWallMat(bcheck));
		} else if ((maze[i] & WALL_UP) == 0 &&
		           (maze[i-x] & WALL_RIGHT) == 0) {
			// We have a thin wall, build it!
			WallBuild((cx+1) * size - halfWallWidth,
			          -cy * size + halfWallWidth,
			          (cx+1) * size - halfWallWidth,
			          -cy * size - halfWallWidth,
			          false,true,false,0,PUB_wallTexture_Thin);
		}
		
	}
	
	
	////
	//Floor + Ceiling
	WallBuild(0,0,x*size,-y*size,true,true,true,0,PUB_floorTexture);
	WallBuild(0,0,x*size,-y*size,true,false,true,height,PUB_ceilTexture);
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