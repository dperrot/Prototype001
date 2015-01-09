// Upgrade NOTE: commented out 'float3 _WorldSpaceCameraPos', a built-in variable
// Upgrade NOTE: commented out 'float4x4 _Object2World', a built-in variable
// Upgrade NOTE: commented out 'float4x4 _World2Object', a built-in variable

Shader "Cg per-vertex diffuse lighting" {
   Properties {
      _Color ("Diffuse Material Color", Color) = (1,1,1,1) 
   }
   SubShader {
      Pass {    
         Tags { "LightMode" = "ForwardBase" } 
           // pass for first light source
 
         CGPROGRAM
 
         #pragma vertex vert  
         #pragma fragment frag 
 
         uniform float4 _Color; // define shader property for shaders
 
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
         uniform float4 _LightColor0; 
            // color of light source (from "Lighting.cginc")
 
         struct vertexInput {
            float4 vertex : POSITION;
            float3 normal : NORMAL;
         };
         struct vertexOutput {
            float4 pos : SV_POSITION;
            float4 col : COLOR;
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
               attenuation * float3(_LightColor0) * float3(_Color)
               * abs(dot(normalDirection, lightDirection)) * 2;
 
            output.col = float4(diffuseReflection, 1.0);
            output.pos = mul(UNITY_MATRIX_MVP, input.vertex);
            return output;
         }
 
         float4 frag(vertexOutput input) : COLOR
         {
            return input.col;
         }
 
         ENDCG
      }
 
      Pass {    
         Tags { "LightMode" = "ForwardAdd" } 
            // pass for additional light sources
         Blend One One // additive blending 
 
         CGPROGRAM
 
         #pragma vertex vert  
         #pragma fragment frag 
 
         uniform float4 _Color; // define shader property for shaders
 
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
         uniform float4 _LightColor0; 
            // color of light source (from "Lighting.cginc")
 
         struct vertexInput {
            float4 vertex : POSITION;
            float3 normal : NORMAL;
         };
         struct vertexOutput {
            float4 pos : SV_POSITION;
            float4 col : COLOR;
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
               attenuation * float3(_LightColor0) * float3(_Color)
               * abs(dot(normalDirection, lightDirection)) * 2;
 
            output.col = float4(diffuseReflection, 1.0);
            output.pos = mul(UNITY_MATRIX_MVP, input.vertex);
            return output;
         }
 
         float4 frag(vertexOutput input) : COLOR
         {
            return input.col;
         }
 
         ENDCG
      }
   }
   // The definition of a fallback shader should be commented out 
   // during development:
   // Fallback "Diffuse"
}