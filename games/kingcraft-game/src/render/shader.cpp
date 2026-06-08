#include "render/shader.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <glad/gl.h>

Shader::~Shader() {
    if (id) glDeleteProgram(id);
}

std::string Shader::readFile(const std::string& path) {
    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "[Shader] Failed to open: " << path << "\n";
        return "";
    }
    std::stringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

unsigned int Shader::compileShader(unsigned int type, const std::string& source) {
    unsigned int shader = glCreateShader(type);
    const char* src = source.c_str();
    glShaderSource(shader, 1, &src, nullptr);
    glCompileShader(shader);
    
    int success;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        char infoLog[1024];
        glGetShaderInfoLog(shader, 1024, nullptr, infoLog);
        std::cerr << "[Shader] Compile error (" << (type == GL_VERTEX_SHADER ? "vertex" : "fragment") << "):\n" << infoLog << "\n";
        glDeleteShader(shader);
        return 0;
    }
    
    return shader;
}

bool Shader::load(const std::string& vertex_path, const std::string& fragment_path) {
    std::string vert_src = readFile(vertex_path);
    std::string frag_src = readFile(fragment_path);
    
    if (vert_src.empty() || frag_src.empty()) return false;
    
    unsigned int vert = compileShader(GL_VERTEX_SHADER, vert_src);
    unsigned int frag = compileShader(GL_FRAGMENT_SHADER, frag_src);
    
    if (!vert || !frag) return false;
    
    id = glCreateProgram();
    glAttachShader(id, vert);
    glAttachShader(id, frag);
    glLinkProgram(id);
    
    int success;
    glGetProgramiv(id, GL_LINK_STATUS, &success);
    if (!success) {
        char infoLog[1024];
        glGetProgramInfoLog(id, 1024, nullptr, infoLog);
        std::cerr << "[Shader] Link error:\n" << infoLog << "\n";
        glDeleteProgram(id);
        id = 0;
        return false;
    }
    
    glDeleteShader(vert);
    glDeleteShader(frag);
    
    std::cout << "[Shader] Loaded: " << vertex_path << " + " << fragment_path << "\n";
    return true;
}

void Shader::use() {
    if (id) glUseProgram(id);
}

void Shader::unuse() {
    glUseProgram(0);
}

int Shader::getLocation(const std::string& name) {
    auto it = uniform_cache.find(name);
    if (it != uniform_cache.end()) return it->second;
    int loc = glGetUniformLocation(id, name.c_str());
    uniform_cache[name] = loc;
    return loc;
}

void Shader::setMat4(const std::string& name, const float* mat) {
    glUniformMatrix4fv(getLocation(name), 1, GL_FALSE, mat);
}

void Shader::setVec3(const std::string& name, float x, float y, float z) {
    glUniform3f(getLocation(name), x, y, z);
}

void Shader::setFloat(const std::string& name, float v) {
    glUniform1f(getLocation(name), v);
}

void Shader::setInt(const std::string& name, int v) {
    glUniform1i(getLocation(name), v);
}
