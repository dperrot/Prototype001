#pragma strict

public class MBBuild_OLD extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var PUB_wallTexture : Material;
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

private final var WALL_UP    : int = 1;
private final var WALL_DOWN  : int = 2;
private final var WALL_LEFT  : int = 4;
private final var WALL_RIGHT : int = 8;
private final var WALL_FILL  : int = 15;

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
	mr.material = tex;
	if (mr.material.GetTag("isWall", false) == "True") {
		var lw = mr.material.GetFloat("_LineWidth");
		var x = Vector3.Distance(vertices[0],vertices[1]);
		var y = Vector3.Distance(vertices[0],vertices[2]);
		mr.material.SetFloat("_LineWidthX", lw * (y/x));
	} 
	
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

// This function will handle the systematic process of creating all the 3D structure of a maze.
function Build (maze : int[], x : int, y : int, start : int, exit : int) {
	
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
	   
	var seopen : int = 0;
	var sx : int = -1;
	var sy : int = -1; 
	var ex : int = -1;
	var ey : int = -1;
	
	////
	// WALL_UP 
	for (var i = 0; i < maze.length; i++) {
		// First, let's check if we're at a cell where the
		// previous and the current both don't have our
		// target wall and build the nudge wall for it.
		if (sx == -1 &&
		    (maze[i] & (WALL_UP + WALL_LEFT)) == 0 &&
		    (maze[i-1] & WALL_UP) == 0) {
		    sx = i % x; sy = i / x;
			WallBuild(sx * size - halfWallWidth,
					  -sy * size - halfWallWidth,
					  sx * size + halfWallWidth,
					  -sy * size - halfWallWidth,
					  false,true,false,0,PUB_wallTexture);
			sx = -1; sy = -1;
			continue;    
		}
		
		// Did we hit the left end of the wall on this cell?
		// Mark it if we did. Skip if we already have it.
		if (sx == -1 && (maze[i] & WALL_UP) != 0) {
			//Is the cell before this one open? Mark it if
			//it is.
			if (i > 0 && (maze[i-1] & (WALL_UP + WALL_RIGHT)) == 0)
				seopen += 1;
			sx = i % x;
			sy = i / x;
		}
		
		// Did we hit right end of the wall?
		if (sx != -1) {
			if ((maze[i] & WALL_UP) == 0) {
				seopen += 2; ex = (i%x)-1; ey = i/x;
			} else if ((maze[i] & WALL_RIGHT) != 0) {
				ex = i%x; ey = i/x;
			}
		}
		
		// Do we have both ends? Let's build a wall!
		if (sx != -1 && ex != -1) {
			WallBuild(sx * size + (halfWallWidth * ((seopen & 1) == 0 ? 1 : -1)),
					  -sy * size - halfWallWidth,
					  (ex+1) * size + (halfWallWidth * ((seopen & 2) == 0 ? -1 : 1)),
					  -ey * size - halfWallWidth,
					  false,true,false,0,PUB_wallTexture);
			sx = -1;
			sy = -1;
			ex = -1;
			ey = -1;
			seopen = 0;
		}
	}
	
	////
	// WALL_DOWN
	for (i = 0; i < maze.length; i++) {
		if (sx == -1 &&
		    (maze[i] & (WALL_DOWN + WALL_LEFT)) == 0 &&
		    (maze[i-1] & WALL_DOWN) == 0) {
		    sx = i % x; sy = i / x;
			WallBuild(sx * size - halfWallWidth,
					  -(sy+1) * size + halfWallWidth,
					  sx * size + halfWallWidth,
					  -(sy+1) * size + halfWallWidth,
					  false,false,false,0,PUB_wallTexture);
			sx = -1; sy = -1;
			continue;    
		}
		
		if (sx == -1 && (maze[i] & WALL_DOWN) != 0) {
			if (i > 0 && (maze[i-1] & (WALL_DOWN + WALL_RIGHT)) == 0)
				seopen += 1;
			sx = i % x;
			sy = i / x;
		}
		
		if (sx != -1) {
			if ((maze[i] & WALL_DOWN) == 0) {
				seopen += 2; ex = (i%x)-1; ey = i/x;
			} else if ((maze[i] & WALL_RIGHT) != 0) {
				ex = i%x; ey = i/x;
			}
		}
		
		if (sx != -1 && ex != -1) {
			WallBuild(sx * size + (halfWallWidth * ((seopen & 1) == 0 ? 1 : -1)),
					  -(sy+1) * size + halfWallWidth,
					  (ex+1) * size + (halfWallWidth * ((seopen & 2) == 0 ? -1 : 1)),
					  -(ey+1) * size + halfWallWidth,
					  false,false,false,0,PUB_wallTexture);
			sx = -1;
			sy = -1;
			ex = -1;
			ey = -1;
			seopen = 0;
		}
	}
	
	////
	// WALL_LEFT
	for (i = 0; i < maze.length; i++) {
		var i2: int = ((i*x) % maze.length) + (i/y); 
		if (sx == -1 &&
		    (maze[i2] & (WALL_LEFT + WALL_UP)) == 0 &&
		    (maze[i2-x] & WALL_LEFT) == 0) {
		    sx = i2 % x; sy = i2 / x;
			WallBuild(sx * size + halfWallWidth,
					  -sy * size + halfWallWidth,
					  sx * size + halfWallWidth,
					  -sy * size - halfWallWidth,
					  false,false,false,0,PUB_wallTexture);
			sx = -1; sy = -1;
			continue;    
		}
		
		if (sx == -1 && (maze[i2] & WALL_LEFT) != 0) {
			if (i2 >= x && (maze[i2-x] & (WALL_LEFT + WALL_DOWN)) == 0)
				seopen += 1;
			sx = i2 % x;
			sy = i2 / x;
		}
		
		if (sx != -1) {
			if ((maze[i2] & WALL_LEFT) == 0) {
				seopen += 2; ex = i2%x; ey = (i2/x)-1;
			} else if ((maze[i2] & WALL_DOWN) != 0) {
				ex = i2%x; ey = i2/x;
			}
		}
		
		if (sx != -1 && ex != -1) {
			WallBuild(sx * size + halfWallWidth,
					  -sy * size + (halfWallWidth * ((seopen & 1) == 0 ? -1 : 1)),
					  ex * size + halfWallWidth,
					  -(ey+1) * size + (halfWallWidth * ((seopen & 2) == 0 ? 1 : -1)),
					  false,false,false,0,PUB_wallTexture);
			sx = -1;
			sy = -1;
			ex = -1;
			ey = -1;
			seopen = 0;
		}
	}
	
	////
	// WALL_RIGHT
	for (i = 0; i < maze.length; i++) {
		i2 = ((i*x) % maze.length) + (i/y); 
		if (sx == -1 &&
		    (maze[i2] & (WALL_RIGHT + WALL_UP)) == 0 &&
		    (maze[i2-x] & WALL_RIGHT) == 0) {
		    sx = i2 % x; sy = i2 / x;
			WallBuild((sx+1) * size - halfWallWidth,
					  -sy * size + halfWallWidth,
					  (sx+1) * size - halfWallWidth,
					  -sy * size - halfWallWidth,
					  false,true,false,0,PUB_wallTexture);
			sx = -1; sy = -1;
			continue;    
		}
		
		if (sx == -1 && (maze[i2] & WALL_RIGHT) != 0) {
			if (i2 >= x && (maze[i2-x] & (WALL_RIGHT + WALL_DOWN)) == 0)
				seopen += 1;
			sx = i2 % x;
			sy = i2 / x;
		}
		
		if (sx != -1) {
			if ((maze[i2] & WALL_RIGHT) == 0) {
				seopen += 2; ex = i2%x; ey = (i2/x)-1;
			} else if ((maze[i2] & WALL_DOWN) != 0) {
				ex = i2%x; ey = i2/x;
			}
		}
		
		if (sx != -1 && ex != -1) {
			WallBuild((sx+1) * size - halfWallWidth,
					  -sy * size + (halfWallWidth * ((seopen & 1) == 0 ? -1 : 1)),
					  (ex+1) * size - halfWallWidth,
					  -(ey+1) * size + (halfWallWidth * ((seopen & 2) == 0 ? 1 : -1)),
					  false,true,false,0,PUB_wallTexture);
			sx = -1;
			sy = -1;
			ex = -1;
			ey = -1;
			seopen = 0;
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