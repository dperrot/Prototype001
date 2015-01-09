// Upgrade NOTE: replaced 'PositionFog()' with multiply of UNITY_MATRIX_MVP by position
// Upgrade NOTE: replaced 'V2F_POS_FOG' with 'float4 pos : SV_POSITION'
// Upgrade NOTE: replaced 'glstate.matrix.modelview[0]' with 'UNITY_MATRIX_MV'

// Upgrade NOTE: replaced 'glstate.matrix.mvp' with 'UNITY_MATRIX_MVP'

Shader "Custom/Tron Outline SeeThrough" {
	Properties {
		_WallColor ("Tint Color", Color) = (0.5,0.5,0.5,1)
		_MinAlpha ("Minumum Alpha", float) = 0  
		_Stretcher ("Alpha Dampening", Range(0.01,2)) = 1
		_Offset ("Alpha Offset", float) = 0
		_LineColor ("Line Color", Color) = (1,1,1,1)
		_GridColor ("Grid Color", Color) = (0,0,0,0)
		_LineWidth ("Line Width", float) = 0.1
		_LineWidthX ("X adjust DON'T TOUCH", float) = 0.1
	}
	SubShader {
		Tags {"isWall" = "True"
			  "Queue"  = "Transparent"}
		Cull Back
		Blend SrcAlpha OneMinusSrcAlpha
		ColorMask RGB
		ZWrite On
		
		// Render Alpha Inner Wall
		Pass {
			Lighting Off
			CGPROGRAM
				#pragma vertex vert
				#pragma fragment frag
				#include "UnityCG.cginc"
				
				uniform float4 _WallColor;
				uniform float _Stretcher,
							  _MinAlpha,
							  _Offset;
				
				struct appdata_vert {
					float4 vertex : POSITION;
					float4 texcoord : TEXCOORD0;
					float4 color : COLOR;
				};
				
				struct v2f {
					float4 pos : SV_POSITION;
					float2 uv : TEXCOORD0;
					float4 color : COLOR;
				};
				
				v2f vert (appdata_vert v) {
					v2f o;
					o.pos = mul (UNITY_MATRIX_MVP, v.vertex);
					o.color = _WallColor;
					UNITY_TRANSFER_DEPTH(o.uv);
					return o;
				}
				
				float4 frag (v2f i) : COLOR { 
					half4 alpha = i.uv.x/i.uv.y / _Stretcher;
					alpha = max(alpha + _Offset, 0);
					alpha = min(alpha + _MinAlpha, 1);
				
					return float4(i.color.rgb, i.color.a*alpha);
				}
			ENDCG
		}
		
		// Render Border
        Pass {
			Lighting On

			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#include "UnityCG.cginc"
			
			float4 _LineColor;
			float4 _GridColor;
			float _LineWidth;
			float _LineWidthX;
			
			struct appdata {
			    float4 vertex : POSITION;
			    float4 texcoord : TEXCOORD0;
			    float4 color : COLOR;
			};
			
			struct v2f {
			    float4 pos : POSITION;
			    float4 texcoord : TEXCOORD0;
			    float4 color : COLOR;
			};
			
			v2f vert (appdata v) {
			  v2f o;
			  o.pos = mul( UNITY_MATRIX_MVP, v.vertex);
			  o.texcoord = v.texcoord;
			  o.color = v.color;
			  return o;
			}
			
			float4 frag (v2f i) : COLOR {
				if (i.texcoord.x < _LineWidthX ||
					i.texcoord.y < _LineWidth ||
					i.texcoord.x > 1 - _LineWidthX ||
					i.texcoord.y > 1 - _LineWidth)
				{
					return _LineColor;
				}
			
				else
				{
					return _GridColor;
				}
			}
			
			ENDCG

        }
	} 
	//Fallback "Vertex Colored", 1
}