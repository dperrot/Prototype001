#pragma strict

public class CamTexture extends CommonFunctions {

//     ___   __  __ ___   __    ____ _____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / / / // _ ) / /   /  _// ___/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// /_/ // _  |/ /__ _/ / / /__     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/    \____//____//____//___/ \___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//  

var whiteFlash : Material;
var blackOverlay : Material;
var blockCountWidth : int;
var blockCountHeight : int;
var blackPixelGraph : AnimationCurve;
var whiteFadeInGraph : AnimationCurve;

//     ___   ___   ____ _   __ ___  ______ ____    _   __ ___    ___   ____ ___    ___   __    ____ ____
//    / _ \ / _ \ /  _/| | / // _ |/_  __// __/   | | / // _ |  / _ \ /  _// _ |  / _ ) / /   / __// __/
//   / ___// , _/_/ /  | |/ // __ | / /  / _/     | |/ // __ | / , _/_/ / / __ | / _  |/ /__ / _/ _\ \  
//  /_/   /_/|_|/___/  |___//_/ |_|/_/  /___/     |___//_/ |_|/_/|_|/___//_/ |_|/____//____//___//___/  
//                                                                                                      

private var camTextureObj : GameObject;
private var meshF : MeshFilter;
private var meshR : MeshRenderer;
private var whiteFlashStartColor : Color = new Color(1,1,1,1);
private var whiteFlashInitColor : Color = new Color(1,1,1,0);
private var pWidthIter : float;
private var pHeightIter : float;
private var blackPixelList : GameObject[];

//    _____ __    ___    ____ ____     ____ __  __ _  __ _____ ______ ____ ____   _  __ ____
//   / ___// /   / _ |  / __// __/    / __// / / // |/ // ___//_  __//  _// __ \ / |/ // __/
//  / /__ / /__ / __ | _\ \ _\ \     / _/ / /_/ //    // /__   / /  _/ / / /_/ //    /_\ \  
//  \___//____//_/ |_|/___//___/    /_/   \____//_/|_/ \___/  /_/  /___/ \____//_/|_//___/  
//                                                                                          

// This will trigger a white flash for X ammount of seconds
function triggerWhiteFlash(sec : float) {
	sec = 1.0 / sec;
	var whiteAlpha : float = 1.0;
	meshR.material = whiteFlash;
	meshR.material.SetColor("_Color", whiteFlashStartColor);
	yield WaitForEndOfFrame;
	
	while (whiteAlpha > 0.0) {
		whiteAlpha -= Time.deltaTime * sec;
		meshR.material.SetColor("_Color", new Color(1,1,1,whiteAlpha));
		yield WaitForEndOfFrame;
	}
}

// This will trigger a white fade in for X ammount of seconds
function WhiteFadeIn(sec : float) {
	sec = 1.0 / sec;
	var whiteAlpha : float = 0.0;
	var dur : float = 0.0;
	meshR.material = whiteFlash;
	meshR.material.SetColor("_Color", new Color(1,1,1,0));
	yield WaitForEndOfFrame;
	
	while (dur < 1.0) {
		dur += Time.deltaTime * sec;
		whiteAlpha = whiteFadeInGraph.Evaluate(dur);
		meshR.material.SetColor("_Color", new Color(1,1,1,whiteAlpha));
		yield WaitForEndOfFrame;
	}
}

// This will create the black sqaure at the appropriate screen position with correct paramaters.
// and will be returned.
function createBlackPixel(pW : float, pH : float) {
	var blackPixelObj : GameObject = new GameObject("Black Pixel");
	blackPixelObj.transform.position = camera.ScreenToWorldPoint(Vector3(pW,pH,0.5));
	blackPixelObj.transform.parent = transform;
	blackPixelObj.layer = 14;
	var bPPos : Vector3 = blackPixelObj.transform.position;
	
	var blackPF : MeshFilter = blackPixelObj.AddComponent(MeshFilter);
	var mesh : Mesh = new Mesh();
	blackPF.mesh = mesh;
	
	mesh.vertices = [camera.ScreenToWorldPoint(Vector3(pW,pH,0.5)) - bPPos,
					 camera.ScreenToWorldPoint(Vector3(pW+pWidthIter,pH,0.5)) - bPPos,
					 camera.ScreenToWorldPoint(Vector3(pW,pH+pHeightIter,0.5)) - bPPos,
					 camera.ScreenToWorldPoint(Vector3(pW+pWidthIter,pH+pHeightIter,0.5)) - bPPos];
	mesh.triangles = [0,2,1,2,3,1];
	mesh.RecalculateNormals();
	mesh.uv = [Vector2(0,0),
			   Vector2(0,1),
			   Vector2(1,0),
			   Vector2(1,1)];
			   
	var blackPR : MeshRenderer = blackPixelObj.AddComponent(MeshRenderer);
	blackPR.material = blackOverlay;
	blackPR.enabled = true;
	
	return blackPixelObj;
}

// This function will reset the black pixels for another use.
function ClearBlackPixels() {
	for (var i = 0; i < blackPixelList.Length; i++) {
		blackPixelList[i].renderer.enabled = false;
	}
}

// This function will animate the visual apprearance of the black pixels over a given
// timeframe.
function AnimateBlackPixels(dur : float) {
	dur = 1.0 / dur;
	var i : int = 0;
	var animDur : float = 0;
	var animValue : float = 0;
	var tempBlackPixelList : GameObject[] = blackPixelList.Clone();
	var dif : int;
	Shuffle(tempBlackPixelList);
	
	while (i < tempBlackPixelList.Length) {
		yield WaitForEndOfFrame;
		animDur += Time.deltaTime * dur;
		animValue = blackPixelGraph.Evaluate(animDur) * tempBlackPixelList.Length;
		
		if (animValue >= i+1) {
			dif = Mathf.FloorToInt(animValue) - i;
			while (dif > 0) {
				tempBlackPixelList[i].renderer.enabled = true;
				i++;
				dif--;
			}
		} else if (animValue <= i-1) {
			dif = i - Mathf.FloorToInt(animValue);
			while (dif > 0) {
				tempBlackPixelList[i].renderer.enabled = false;
				i--;
				dif--;
			}
		}
	}
}

// This function will animate the visual apprearance of the black pixels over a given
// timeframe in reverse order.
function ReverseAnimateBlackPixels(dur : float) {
	dur = 1.0 / dur;
	var i : int = blackPixelList.Length - 1;
	var animDur : float = 0;
	var animValue : float = 0;
	var tempBlackPixelList : GameObject[] = blackPixelList.Clone();
	var dif : int;
	Shuffle(tempBlackPixelList);
	
	while (i >= 0) {
		yield WaitForEndOfFrame;
		animDur += Time.deltaTime * dur;
		animValue = blackPixelGraph.Evaluate(1-animDur) * tempBlackPixelList.Length;
		
		if (animValue >= i+1) {
			dif = Mathf.FloorToInt(animValue) - i;
			while (dif > 0) {
				tempBlackPixelList[i].renderer.enabled = true;
				i++;
				dif--;
			}
		} else if (animValue <= i-1) {
			dif = i - Mathf.FloorToInt(animValue);
			while (dif > 0) {
				tempBlackPixelList[i].renderer.enabled = false;
				i--;
				dif--;
			}
		}
	}
}

//     __  ___ ___    ____ _  __     _____ ____   ___   ____
//    /  |/  // _ |  /  _// |/ /    / ___// __ \ / _ \ / __/
//   / /|_/ // __ | _/ / /    /    / /__ / /_/ // // // _/  
//  /_/  /_//_/ |_|/___//_/|_/     \___/ \____//____//___/  
//                                                          

function Start () {
	camTextureObj = new GameObject("Cam Texture Mesh");
	camTextureObj.transform.position = transform.position + Vector3(0,0,1);
	camTextureObj.transform.parent = transform;
	camTextureObj.layer = 14;
	var cPos : Vector3 = camTextureObj.transform.position;
	
	// Create the white flash overlay
	meshF = camTextureObj.AddComponent(MeshFilter);
	var mesh : Mesh = new Mesh();
	meshF.mesh = mesh;
	
	mesh.vertices = [camera.ScreenToWorldPoint(Vector3(0,0,1)) - cPos,
					 camera.ScreenToWorldPoint(Vector3(camera.pixelWidth,0,1)) - cPos,
					 camera.ScreenToWorldPoint(Vector3(0,camera.pixelHeight,1)) - cPos,
					 camera.ScreenToWorldPoint(Vector3(camera.pixelWidth,camera.pixelHeight,1)) - cPos];
	mesh.triangles = [0,2,1,2,3,1];
	mesh.RecalculateNormals();
	mesh.uv = [Vector2(0,0),
			   Vector2(0,1),
			   Vector2(1,0),
			   Vector2(1,1)];
			   
	meshR = camTextureObj.AddComponent(MeshRenderer);
	meshR.material = whiteFlash;
	meshR.material.SetColor("_Color", whiteFlashInitColor);
	
	// Create all the black squares.
	pWidthIter = camera.pixelWidth / blockCountWidth;
	pHeightIter = camera.pixelHeight / blockCountHeight;
	blackPixelList = new GameObject[blockCountWidth*blockCountHeight];
	
	for (var i = 0; i < blackPixelList.length; i++) {
		blackPixelList[i] = createBlackPixel((i % blockCountWidth) * pWidthIter,
											 (i / blockCountWidth) * pHeightIter);
	}
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