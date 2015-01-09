// TODO: Make a two color gradient system so lighting model can implement color
// blend based on two points. Vertex lighting doens't work and per-pixel lighting
// does shit at what you want to do.
//
// One light source at cell has certain color, but the 4 corner points will take
// the average color of its surrounding light sources to get the true colors.
// These corner points will determine the wall colors and produce the correct
// blending we need, and it's as simple as a lerp function on the UV scale!
// No need to use Unity's lighting!

Shader "Maze Wall/Wall No Border LQ" {
	Properties {
		_WallColor ("Tint Color", Color) = (0.5,0.5,0.5,1)
		_LineColor1 ("Begin Color", Color) = (1,1,1,1)
		_LineColor2 ("End Color", Color) = (1,1,1,1)
		_LineWidth ("Line Width", float) = 0.1
		_LineWidthX ("X adjust DON'T TOUCH", float) = 0.1
	}
	SubShader {
		Tags {"WallType" = "1"
		      "RenderType" = "Opaque"}
		Cull Back
		ColorMask RGB
		Lighting Off
		Fog { Mode off }
		
		// Render Border
        Pass {
         CGPROGRAM
// Upgrade NOTE: excluded shader from OpenGL ES 2.0 because it does not contain a surface program or both vertex and fragment programs.
#pragma exclude_renderers gles
         #pragma fragment frag
         #pragma fragmentoption ARB_fog_exp2
		 #pragma fragmentoption ARB_precision_hint_fastest
         #include "UnityCG.cginc"
         
         float4 _LineColor1;
         float4 _LineColor2;
         float _LineWidth;
         float _LineWidthX;  
         
         float4 frag(v2f_vertex_lit input) : COLOR
         {       	
            if (input.uv.y < _LineWidth ||
				input.uv.y > 1 - _LineWidth)
			{
				return lerp(_LineColor1,_LineColor2,input.uv.x);
			}
			else
			{
				return float4(0,0,0,1);
			}
         }
 
         ENDCG
        }
 
	} 
	//FallBack "VertexLit"
}