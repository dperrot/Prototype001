// TODO: Make a two color gradient system so lighting model can implement color
// blend based on two points. Vertex lighting doens't work and per-pixel lighting
// does shit at what you want to do.
//
// One light source at cell has certain color, but the 4 corner points will take
// the average color of its surrounding light sources to get the true colors.
// These corner points will determine the wall colors and produce the correct
// blending we need, and it's as simple as a lerp function on the UV scale!
// No need to use Unity's lighting!

Shader "Maze Wall/Wall Left-Right Border" {
	Properties {
		_WallColor ("Tint Color", Color) = (0.5,0.5,0.5,1)
		_MinAlpha ("Minumum Alpha", float) = 0  
		_Stretcher ("Alpha Dampening", float) = 1
		_Offset ("Alpha Offset", float) = 0
		_LineColor1 ("Begin Color", Color) = (1,1,1,1)
		_LineColor2 ("End Color", Color) = (1,1,1,1)
		_LineWidth ("Line Width", float) = 0.1
		_LineWidthX ("X adjust DON'T TOUCH", float) = 0.1
	}
	SubShader {
		Tags {"WallType" = "1"
			  "Queue"  = "Transparent"}
		Cull Back
		Blend SrcAlpha OneMinusSrcAlpha
		ColorMask RGB
		Zwrite Off
		Lighting Off
		Fog { Mode off }
		
		// Render Alpha Inner Wall
		Pass {
			CGPROGRAM
				#pragma vertex vert
				#pragma fragment frag
				#include "UnityCG.cginc"
				
				uniform fixed4 _WallColor;
				uniform half _Stretcher,
							 _MinAlpha,
							 _Offset;
				
				struct appdata_vert {
					float4 vertex : POSITION;
					half4 texcoord : TEXCOORD0;
					fixed4 color : COLOR;
				};
				
				struct v2f {
					float4 pos : SV_POSITION;
					half2 uv : TEXCOORD0;
					fixed4 color : COLOR;
				};
				
				v2f vert (appdata_vert v) {
					v2f o;
					o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
					o.color = _WallColor;
					UNITY_TRANSFER_DEPTH(o.uv);
					return o;
				}
				
				fixed4 frag (v2f i) : COLOR { 
					half4 alpha = i.uv.x/i.uv.y / _Stretcher;
					alpha = max(alpha + _Offset, 0);
					alpha = min(alpha + _MinAlpha, 1);
				
					return fixed4(i.color.rgb, i.color.a*alpha);
				}
			ENDCG
		}
		
		// Render Border
        Pass {
         CGPROGRAM
// Upgrade NOTE: excluded shader from OpenGL ES 2.0 because it does not contain a surface program or both vertex and fragment programs.
#pragma exclude_renderers gles
         #pragma fragment frag
         #pragma fragmentoption ARB_fog_exp2
		 #pragma fragmentoption ARB_precision_hint_fastest
         #include "UnityCG.cginc"
         
         fixed4 _LineColor1;
         fixed4 _LineColor2;
         fixed _LineWidth;
         fixed _LineWidthX;
         
         fixed4 frag(v2f_vertex_lit input) : COLOR
         {       	
            if (input.uv.x < _LineWidthX ||
				input.uv.y < _LineWidth ||
				input.uv.x > 1 - _LineWidthX ||
				input.uv.y > 1 - _LineWidth)
			{
				return lerp(_LineColor1,_LineColor2,input.uv.x);
			}
			else
			{
				return fixed4(0,0,0,0);
			}
         }
 
         ENDCG
        }
 
	} 
	//FallBack "VertexLit"
}