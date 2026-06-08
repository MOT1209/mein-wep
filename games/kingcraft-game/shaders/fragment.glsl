#version 330 core
out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in vec2 UV;
in float AO;
flat in uint TextureID;

uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform float uTime;
uniform sampler2DArray uTextureArray;

void main() {
    // Normalize normal
    vec3 norm = normalize(Normal);
    
    // Directional light
    float diff = max(dot(norm, normalize(uSunDir)), 0.0);
    vec3 diffuse = diff * uSunColor;
    
    // Ambient
    vec3 ambient = uAmbientColor * 0.5;
    
    // Hemisphere light (sky vs ground)
    float hemi = norm.y * 0.5 + 0.5;
    vec3 hemi_color = mix(vec3(0.2, 0.15, 0.1), vec3(0.6, 0.7, 0.9), hemi);
    
    // Sample texture
    vec4 texColor = texture(uTextureArray, vec3(UV, float(TextureID)));
    
    // Combine
    vec3 lighting = ambient + hemi_color * 0.3 + diffuse * 0.8;
    lighting *= AO;  // ambient occlusion
    
    FragColor = texColor * vec4(lighting, 1.0);
    
    // Fog (simple)
    float dist = length(FragPos);
    float fog = clamp((dist - 50.0) / 100.0, 0.0, 0.8);
    vec3 fogColor = vec3(0.6, 0.7, 0.85);
    FragColor.rgb = mix(FragColor.rgb, fogColor, fog);
}
