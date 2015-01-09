#pragma strict

public class CellLight extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var CL_Color : Color[];
var CL_LightLevel : float[];
var CL_LightRange : byte[];

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var cellSize : float;
private var cellX : int;
private var cellY : int;
private var cellNeighbors = new CellLight[4];
private var cellNeighborCount : byte = 0;
private var cornerPoints = new CornerPoint[4];
private var cornerPointCount : byte = 0;
private var finalColor : Color;
private var alreadySet : boolean = false;

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// Setters and Getters
function SetSize(n : float) { cellSize = n; }
function GetLightLevel(i : int) { return CL_LightLevel[i]; }
function GetColor() { return finalColor; }

// This function will add CellLight n to cellNeighbors. If pass is true,
// n will also recieve this function command to add this object as n's
// neighbor, so both will be recognized as neighbors.
function SetNeighbor(n : CellLight, pass : boolean)
{
	cellNeighbors[cellNeighborCount++] = n;
	if (pass) { n.SetNeighbor(this, false); }
}

// This function will add a corner point to the list of corner points to send
// color updates to
function AddCornerPoint(cp : CornerPoint)
{
	cornerPoints[cornerPointCount++] = cp;
}

// This function will set the light level at given index. If the function is not forced
// and the light level is greater than normValue * range, it is ignored, otherwise set
// value and then for every neighbor, call this function with 1 less the light value.
// If a change has occured, a call to calculate the final color will be made.
// If forced is true, light level will change for all calls made regardless of
// the original light level being greater.
function SetLightLevel (index : int, normValue : float, forced : boolean)
{
	if (normValue < 0.0) { return; }
	
	//if (normValue > 1.0) { normValue = 1.0; }
	var level : float = normValue * CL_LightRange[index];
	if (!forced && level <= CL_LightLevel[index]) { return; }
	if (forced && alreadySet && level < CL_LightLevel[index]) { return; }
	CL_LightLevel[index] = level;
	alreadySet = true;
	
	for (var i = 0; i < cellNeighborCount; i++)
	{
		cellNeighbors[i].SetLightLevel(index, (level-1) / CL_LightRange[index], forced);
	}
	
	alreadySet = false;
	this.ComputeColor();
}

// This function computes the final color value for this light source
function ComputeColor()
{
	finalColor = Color(0,0,0,1);

	for (var i = 0; i < CL_Color.length; i++)
	{
		finalColor = Color.Lerp(finalColor, CL_Color[i], 
						        CL_LightLevel[i] / CL_LightRange[i]);
	}

	for (i = 0; i < cornerPointCount; i++)
	{
		cornerPoints[i].CalculateColor();
		cornerPoints[i].UpdateWalls();
	}
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Start ()
{
	//Debug.Log(cellNeighbors[1]);
}

function Update ()
{

}

//     ____ ___   ____ ______ ____   ___       _____ ____   ___   ____
//    / __// _ \ /  _//_  __// __ \ / _ \     / ___// __ \ / _ \ / __/
//   / _/ / // /_/ /   / /  / /_/ // , _/    / /__ / /_/ // // // _/  
//  /___//____//___/  /_/   \____//_/|_|     \___/ \____//____//___/  
//                                                                    

function OnDrawGizmos () {
	Gizmos.color = finalColor - Color(0,0,0,0.5);
	Gizmos.DrawSphere(transform.position, 0.5);
}

function OnDrawGizmosSelected () {
	Gizmos.color = finalColor;
	Gizmos.DrawSphere(transform.position, 0.5);
	
	// Cell Light Neighbors
	Gizmos.color = Color(0,1,1,1);
	for(var i = 0; i < cellNeighborCount; i++)
	{
		Gizmos.DrawLine(transform.position, cellNeighbors[i].transform.position);
	}
	
	// Corner connections
	Gizmos.color = Color(0,1,0,1);
	for (i = 0; i < cornerPointCount; i++)
	{
		Gizmos.DrawLine(transform.position, cornerPoints[i].transform.position);
	}
	
}

//--END--

}