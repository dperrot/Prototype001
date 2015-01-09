// colored vertex lighting
Shader "Simple colored lighting" {
    // a single color property
    Properties {
        _Color ("Main Color", Color) = (1,.5,.5,1)
    }
    // define one subshader
    SubShader {
        Pass {
            Color [_Color]
        }
    }
} 