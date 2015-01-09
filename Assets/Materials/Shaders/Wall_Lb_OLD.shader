Shader "Maze Wall/Wall Left Border" {
	Properties {
		_WallColor ("Tint Color", Color) = (0.5,0.5,0.5,1)
		_MinAlpha ("Minumum Alpha", float) = 0  
		_Stretcher ("Alpha Dampening", Range(0.01,2)) = 1
		_Offset ("Alpha Offset", float) = 0
		_LineColor ("Line Color", Color) = (1,1,1,1)
		_LineWidth ("Line Width", float) = 0.1
		_LineWidthX ("X adjust DON'T TOUCH", float) = 0.1
	}
	SubShader {
		Tags {"isWall" = "True"
			  "Queue"  = "Transparent"}
		Cull Back
		Blend SrcAlpha OneMinusSrcAlpha
		ColorMask RGB
		Zwrite Off
		
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
				
				half4 frag (v2f i) : COLOR { 
					half4 alpha = i.uv.x/i.uv.y / _Stretcher;
					alpha = max(alpha + _Offset, 0);
					alpha = min(alpha + _MinAlpha, 1);
				
					return half4(i.color.rgb, i.color.a*alpha);
				}
			ENDCG
		}
		
		// Render Border
        Pass {    
         Tags { "LightMode" = "ForwardBase" } 
           // pass for first light source
 
         CGPROGRAM
 
         #pragma vertex vert  
         #pragma fragment frag 
 
         uniform float4 _LineColor; // define shader property for shaders
         float _LineWidth;
		 float _LineWidthX;
 
         // The following built-in uniforms (apart from _LightColor0) 
         // are defined in "UnityCG.cginc", which could be #included 
         //uniform float4 unity_Scale; // w = 1/scale; see _World2Object
         // uniform float3 _WorldSpaceCameraPos;
         // uniform float4x4 _Object2World; // model matrix
         // uniform float4x4 _World2Object; // inverse model matrix 
            // (all but the bottom-right element have to be scaled 
            // with unity_Scale.w if scaling is important) 
         //uniform float4 _WorldSpaceLightPos0; 
            // position or direction of light source
         uniform float4 _LightColor[4];
            // color of light source (from "Lighting.cginc")
 
         struct vertexInput {
            float4 vertex : POSITION;
            float4 texcoord : TEXCOORD0;
            float3 normal : NORMAL;
         };
         struct vertexOutput {
            float4 pos : SV_POSITION;
            float4 col : COLOR;
            float2 uv  : TEXCOORD0;
         };
 
         vertexOutput vert(vertexInput input) 
         {
            vertexOutput output;
 
            float4x4 modelMatrix = _Object2World;
            float4x4 modelMatrixInverse = _World2Object; 
               // multiplication with unity_Scale.w is unnecessary 
               // because we normalize transformed vectors
 
            float3 normalDirection = normalize(float3(
               mul(float4(input.normal, 0.0), modelMatrixInverse)));
            float3 lightDirection;
            float attenuation;
 
            if (0.0 == _WorldSpaceLightPos0.w) // directional light?
            {
               attenuation = 1.0; // no attenuation
               lightDirection = 
                  normalize(float3(_WorldSpaceLightPos0));
            } 
            else // point or spot light
            {
               float3 vertexToLightSource = float3(_WorldSpaceLightPos0 
                  - mul(modelMatrix, input.vertex));
               float distance = length(vertexToLightSource);
               attenuation = 1.0 / distance; // linear attenuation
               lightDirection = normalize(vertexToLightSource);
            }
 
            float3 diffuseReflection = 
               attenuation * float3(_LightColor[0]) * float3(_LineColor) * 4;
 
            output.col = float4(diffuseReflection, 1.0);
            output.pos = mul(UNITY_MATRIX_MVP, input.vertex);
            output.uv = input.texcoord;
            return output;
         }
 
         float4 frag(vertexOutput input) : COLOR
         {
            if (input.uv.x < _LineWidthX ||
				input.uv.y < _LineWidth ||
				input.uv.y > 1 - _LineWidth)
			{
				input.col.a = 1;
			}
			else
			{
				input.col.a = 0;
			}
            return input.col;
         }
 
         ENDCG
      }
 
      Pass {    
         Tags { "LightMode" = "ForwardAdd" } 
            // pass for additional light sources
         Blend One One // Additive
         //BlendOp Sub 
 
         CGPROGRAM
 
         #pragma vertex vert  
         #pragma fragment frag 
 
         uniform float4 _LineColor; // define shader property for shaders
         float _LineWidth;
		 float _LineWidthX;
 
         // The following built-in uniforms (apart from _LightColor0) 
         // are defined in "UnityCG.cginc", which could be #included 
         //uniform float4 unity_Scale; // w = 1/scale; see _World2Object
         // uniform float3 _WorldSpaceCameraPos;
         // uniform float4x4 _Object2World; // model matrix
         // uniform float4x4 _World2Object; // inverse model matrix 
            // (all but the bottom-right element have to be scaled 
            // with unity_Scale.w if scaling is important) 
         //uniform float4 _WorldSpaceLightPos0; 
            // position or direction of light source
         uniform float4 _LightColor[4]; 
            // color of light source (from "Lighting.cginc")
 
         struct vertexInput {
            float4 vertex : POSITION;
            float4 texcoord : TEXCOORD0;
            float3 normal : NORMAL;
         };
         struct vertexOutput {
            float4 pos : SV_POSITION;
            float4 col : COLOR;
            float2 uv  : TEXCOORD0;
         };
 
         vertexOutput vert(vertexInput input) 
         {
            vertexOutput output;
 
            float4x4 modelMatrix = _Object2World;
            float4x4 modelMatrixInverse = _World2Object; 
               // multiplication with unity_Scale.w is unnecessary 
               // because we normalize transformed vectors
 
            float3 normalDirection = normalize(float3(
               mul(float4(input.normal, 0.0), modelMatrixInverse)));
            float3 lightDirection;
            float attenuation;
 
            if (0.0 == _WorldSpaceLightPos0.w) // directional light?
            {
               attenuation = 1.0; // no attenuation
               lightDirection = 
                  normalize(float3(_WorldSpaceLightPos0));
            } 
            else // point or spot light
            {
               float3 vertexToLightSource = float3(_WorldSpaceLightPos0 
                  - mul(modelMatrix, input.vertex));
               float distance = length(vertexToLightSource);
               attenuation = 1.0 / distance; // linear attenuation
               lightDirection = normalize(vertexToLightSource);
            }
 
            float3 diffuseReflection = 
               attenuation * float3(_LightColor[0]) * float3(_LineColor) * 4;
 
            output.col = float4(diffuseReflection, 1.0);
            output.pos = mul(UNITY_MATRIX_MVP, input.vertex);
            output.uv = input.texcoord;
            return output;
         }
 
         float4 frag(vertexOutput input) : COLOR
         { 
         	if (input.uv.x < _LineWidthX ||
				input.uv.y < _LineWidth ||
				input.uv.y > 1 - _LineWidth)
			{
				return input.col;
			}
			else
			{
				return float4(0,0,0,0);
			}
         }
 
         ENDCG
      }
	} 
	//FallBack "VertexLit"
}