Shader "Maze Wall/Wall Thin" {
	Properties {
		_LineColor ("Line Color", Color) = (1,1,1,1)
	}
	SubShader {
		Cull Back
		ColorMask RGB
		ZWrite On
		
		// Render Border
        Pass {
        	Name "BASE"
            Tags {"RenderType" = "Opaque"
                  "LightMode" = "Vertex"} 
			Lighting On
			Material {
                Diffuse (1,1,1,1)
                Ambient (1,1,1,1)
            }

			CGPROGRAM
// Upgrade NOTE: excluded shader from OpenGL ES 2.0 because it does not contain a surface program or both vertex and fragment programs.
#pragma exclude_renderers gles
			#pragma fragment frag
			#pragma fragmentoption ARB_fog_exp2
            #pragma fragmentoption ARB_precision_hint_fastest 
			#include "UnityCG.cginc"
			
			float4 _LineColor;
			
			struct v2f_vertex_lit_mod {
               float4 diff   : COLOR0;
            };
			
			half4 frag (v2f_vertex_lit_mod i) : COLOR {
				half4 c;
				c.rgb = _LineColor.rgb * i.diff.xyz * 16;
				c.a = 1;
				return c;
			}
			
			ENDCG

        }
	} 
	FallBack "VertexLit"
}