#pragma strict

public class CornerPoint extends CommonFunctions {

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

private var wallList : Renderer[];
private var wallAttrList : String[];
private var lightList = new CellLight[4];
private var lightCount : byte = 0;
private var finalColor : Color;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// Setters and Getters
function GetColor() { return finalColor; }

// This function will add given light to this object's light list, and pass the
// message back to the light to add itself to the light's collection.
function AddLight(l : CellLight)
{
	lightList[lightCount] = l;
	lightCount++;
	l.AddCornerPoint(this);
}

// This function will grab all walls given a certain radius. Based on the material's
// "WallTag" type and where it's positioned relative to this object's position for
// each wall, a shader variable will be declared for that wall to apply color to for
// future color updates.
function GetWalls(r : float)
{
	var colliders = Physics.OverlapSphere(transform.position, r, 1 << 8);
	wallList = new Renderer[colliders.length];
	wallAttrList = new String[colliders.length];
	
	for (var i = 0; i < wallList.length; i++)
	{
		wallList[i] = colliders[i].renderer;
		
		if (wallList[i].material.GetTag("WallType", false) == "3")
		{
			wallAttrList[i] = "_LineColor";
		}
		else
		{
			var pos : Vector3 = colliders[i].transform.position - transform.position;
			if ((Mathf.Abs(pos.x) > r && pos.x > 0) || 
			    (Mathf.Abs(pos.z) > r && pos.z < 0)) 
			{ wallAttrList[i] = "_LineColor1"; }
			else { wallAttrList[i] = "_LineColor2"; }
		}
	}
}

// This function calculates the average color from the connected light sources
function CalculateColor()
{
	finalColor = Color(0,0,0,0);
	for (var i = 0; i < lightCount; i++)
	{
		finalColor += lightList[i].GetColor() / lightCount;
	}
}

// This function sends all connected walls their updated color information to be
// rendered to the scene.
function UpdateWalls()
{
	for (var i = 0; i < wallList.length; i++)
	{
		wallList[i].material.SetColor(wallAttrList[i], finalColor);
	}
}


//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Start () {
	//this.TestFunction();
}

function Update () {

}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	Gizmos.color = finalColor - Color(0,0,0,0.5);
	Gizmos.DrawCube(transform.position, Vector3(1,10,1));
}

function OnDrawGizmosSelected () {
	Gizmos.color = finalColor;
	Gizmos.DrawCube(transform.position, Vector3(1,10,1));
	
	// Draw light connections
	Gizmos.color = Color(0,1,1,1);
	for (var i = 0; i < lightCount; i++)
	{
		Gizmos.DrawLine(transform.position, lightList[i].transform.position);
	}
	
	// Draw all wall connections. Red = beginning, Blue = end, White = thin
	for (i = 0; i < wallList.length; i++)
	{
		if (wallAttrList[i] == "_LineColor1") { Gizmos.color = Color(1,0,0,1); }
		if (wallAttrList[i] == "_LineColor2") { Gizmos.color = Color(0,0,1,1); }
		if (wallAttrList[i] == "_LineColor") { Gizmos.color = Color(1,1,1,1); }
		Gizmos.DrawLine(transform.position, wallList[i].transform.position);
	}
}

//--END--

}