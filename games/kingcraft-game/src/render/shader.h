#ifndef KINGCRAFT_SHADER_H
#define KINGCRAFT_SHADER_H

#include <string>
#include <unordered_map>

// Simple shader class
class Shader {
public:
    Shader() = default;
    ~Shader();
    
    bool load(const std::string& vertex_path, const std::string& fragment_path);
    void use();
    void unuse();
    
    // Uniforms
    void setMat4(const std::string& name, const float* mat);
    void setVec3(const std::string& name, float x, float y, float z);
    void setFloat(const std::string& name, float v);
    void setInt(const std::string& name, int v);
    
    unsigned int getID() const { return id; }
    bool isValid() const { return id != 0; }

private:
    unsigned int id = 0;
    std::unordered_map<std::string, int> uniform_cache;
    
    int getLocation(const std::string& name);
    unsigned int compileShader(unsigned int type, const std::string& source);
    std::string readFile(const std::string& path);
};

#endif // KINGCRAFT_SHADER_H
