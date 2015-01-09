Shader "Maze Wall/Wall Thin" {
	Properties {
		_LineColor ("Line Color", Color) = (1,1,1,1)
	}
	SubShader {
		Tags {"WallType" = "3"}
		Cull Back
		ColorMask RGB
		ZWrite On
		
		// Render Border
        Pass {
			CGPROGRAM
// Upgrade NOTE: excluded shader from OpenGL ES 2.0 because it does not contain a surface program or both vertex and fragment programs.
#pragma exclude_renderers gles
			#pragma fragment frag
			#pragma fragmentoption ARB_fog_exp2
            #pragma fragmentoption ARB_precision_hint_fastest
			
			fixed4 _LineColor;
			
			struct v2f_vertex_lit_mod {
			   fixed4 diff   : COLOR0;
            };
			
			fixed4 frag (v2f_vertex_lit_mod i) : COLOR {
				return _LineColor;
			}
			
			ENDCG

        }
	} 
	//FallBack "VertexLit"
}