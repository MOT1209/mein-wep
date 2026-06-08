#include "glad/gl.h"
#include <GLFW/glfw3.h>

// Core OpenGL function pointer definitions
// (declared extern in glad/gl.h)
GLADglGenBuffers glGenBuffers = NULL;
GLADglDeleteBuffers glDeleteBuffers = NULL;
GLADglBindBuffer glBindBuffer = NULL;
GLADglBufferData glBufferData = NULL;
GLADglBufferSubData glBufferSubData = NULL;

GLADglGenVertexArrays glGenVertexArrays = NULL;
GLADglDeleteVertexArrays glDeleteVertexArrays = NULL;
GLADglBindVertexArray glBindVertexArray = NULL;
GLADglVertexAttribPointer glVertexAttribPointer = NULL;
GLADglVertexAttribIPointer glVertexAttribIPointer = NULL;
GLADglEnableVertexAttribArray glEnableVertexAttribArray = NULL;
GLADglDisableVertexAttribArray glDisableVertexAttribArray = NULL;

GLADglCreateShader glCreateShader = NULL;
GLADglShaderSource glShaderSource = NULL;
GLADglCompileShader glCompileShader = NULL;
GLADglGetShaderiv glGetShaderiv = NULL;
GLADglGetShaderInfoLog glGetShaderInfoLog = NULL;
GLADglDeleteShader glDeleteShader = NULL;
GLADglCreateProgram glCreateProgram = NULL;
GLADglAttachShader glAttachShader = NULL;
GLADglLinkProgram glLinkProgram = NULL;
GLADglGetProgramiv glGetProgramiv = NULL;
GLADglGetProgramInfoLog glGetProgramInfoLog = NULL;
GLADglUseProgram glUseProgram = NULL;
GLADglDeleteProgram glDeleteProgram = NULL;

GLADglGetUniformLocation glGetUniformLocation = NULL;
GLADglUniform1i glUniform1i = NULL;
GLADglUniform1f glUniform1f = NULL;
GLADglUniform3f glUniform3f = NULL;
GLADglUniformMatrix4fv glUniformMatrix4fv = NULL;

GLADglGenTextures glGenTextures = NULL;
GLADglDeleteTextures glDeleteTextures = NULL;
GLADglActiveTexture glActiveTexture = NULL;
GLADglBindTexture glBindTexture = NULL;
GLADglTexImage2D glTexImage2D = NULL;
GLADglTexImage3D glTexImage3D = NULL;
GLADglTexSubImage3D glTexSubImage3D = NULL;
GLADglTexStorage3D glTexStorage3D = NULL;
GLADglTexParameteri glTexParameteri = NULL;
GLADglGenerateMipmap glGenerateMipmap = NULL;

GLADglEnable glEnable = NULL;
GLADglDisable glDisable = NULL;
GLADglCullFace glCullFace = NULL;
GLADglFrontFace glFrontFace = NULL;
GLADglDepthFunc glDepthFunc = NULL;
GLADglBlendFunc glBlendFunc = NULL;
GLADglClear glClear = NULL;
GLADglClearColor glClearColor = NULL;
GLADglViewport glViewport = NULL;

GLADglGetString glGetString = NULL;
GLADglGetIntegerv glGetIntegerv = NULL;
GLADglGetError glGetError = NULL;
GLADglDrawArrays glDrawArrays = NULL;
GLADglDrawElements glDrawElements = NULL;

struct GLVersion GLVersion = {0, 0};

int gladLoadGL(void* (*get_proc_addr)(const char* name)) {
    // Load all function pointers using the provided loader
    glGenBuffers = (GLADglGenBuffers)get_proc_addr("glGenBuffers");
    glDeleteBuffers = (GLADglDeleteBuffers)get_proc_addr("glDeleteBuffers");
    glBindBuffer = (GLADglBindBuffer)get_proc_addr("glBindBuffer");
    glBufferData = (GLADglBufferData)get_proc_addr("glBufferData");
    glBufferSubData = (GLADglBufferSubData)get_proc_addr("glBufferSubData");
    
    glGenVertexArrays = (GLADglGenVertexArrays)get_proc_addr("glGenVertexArrays");
    glDeleteVertexArrays = (GLADglDeleteVertexArrays)get_proc_addr("glDeleteVertexArrays");
    glBindVertexArray = (GLADglBindVertexArray)get_proc_addr("glBindVertexArray");
    glVertexAttribPointer = (GLADglVertexAttribPointer)get_proc_addr("glVertexAttribPointer");
    glVertexAttribIPointer = (GLADglVertexAttribIPointer)get_proc_addr("glVertexAttribIPointer");
    glEnableVertexAttribArray = (GLADglEnableVertexAttribArray)get_proc_addr("glEnableVertexAttribArray");
    glDisableVertexAttribArray = (GLADglDisableVertexAttribArray)get_proc_addr("glDisableVertexAttribArray");
    
    glCreateShader = (GLADglCreateShader)get_proc_addr("glCreateShader");
    glShaderSource = (GLADglShaderSource)get_proc_addr("glShaderSource");
    glCompileShader = (GLADglCompileShader)get_proc_addr("glCompileShader");
    glGetShaderiv = (GLADglGetShaderiv)get_proc_addr("glGetShaderiv");
    glGetShaderInfoLog = (GLADglGetShaderInfoLog)get_proc_addr("glGetShaderInfoLog");
    glDeleteShader = (GLADglDeleteShader)get_proc_addr("glDeleteShader");
    glCreateProgram = (GLADglCreateProgram)get_proc_addr("glCreateProgram");
    glAttachShader = (GLADglAttachShader)get_proc_addr("glAttachShader");
    glLinkProgram = (GLADglLinkProgram)get_proc_addr("glLinkProgram");
    glGetProgramiv = (GLADglGetProgramiv)get_proc_addr("glGetProgramiv");
    glGetProgramInfoLog = (GLADglGetProgramInfoLog)get_proc_addr("glGetProgramInfoLog");
    glUseProgram = (GLADglUseProgram)get_proc_addr("glUseProgram");
    glDeleteProgram = (GLADglDeleteProgram)get_proc_addr("glDeleteProgram");
    
    glGetUniformLocation = (GLADglGetUniformLocation)get_proc_addr("glGetUniformLocation");
    glUniform1i = (GLADglUniform1i)get_proc_addr("glUniform1i");
    glUniform1f = (GLADglUniform1f)get_proc_addr("glUniform1f");
    glUniform3f = (GLADglUniform3f)get_proc_addr("glUniform3f");
    glUniformMatrix4fv = (GLADglUniformMatrix4fv)get_proc_addr("glUniformMatrix4fv");
    
    glGenTextures = (GLADglGenTextures)get_proc_addr("glGenTextures");
    glDeleteTextures = (GLADglDeleteTextures)get_proc_addr("glDeleteTextures");
    glActiveTexture = (GLADglActiveTexture)get_proc_addr("glActiveTexture");
    glBindTexture = (GLADglBindTexture)get_proc_addr("glBindTexture");
    glTexImage2D = (GLADglTexImage2D)get_proc_addr("glTexImage2D");
    glTexImage3D = (GLADglTexImage3D)get_proc_addr("glTexImage3D");
    glTexSubImage3D = (GLADglTexSubImage3D)get_proc_addr("glTexSubImage3D");
    glTexStorage3D = (GLADglTexStorage3D)get_proc_addr("glTexStorage3D");
    glTexParameteri = (GLADglTexParameteri)get_proc_addr("glTexParameteri");
    glGenerateMipmap = (GLADglGenerateMipmap)get_proc_addr("glGenerateMipmap");
    
    glEnable = (GLADglEnable)get_proc_addr("glEnable");
    glDisable = (GLADglDisable)get_proc_addr("glDisable");
    glCullFace = (GLADglCullFace)get_proc_addr("glCullFace");
    glFrontFace = (GLADglFrontFace)get_proc_addr("glFrontFace");
    glDepthFunc = (GLADglDepthFunc)get_proc_addr("glDepthFunc");
    glBlendFunc = (GLADglBlendFunc)get_proc_addr("glBlendFunc");
    glClear = (GLADglClear)get_proc_addr("glClear");
    glClearColor = (GLADglClearColor)get_proc_addr("glClearColor");
    glViewport = (GLADglViewport)get_proc_addr("glViewport");
    
    glGetString = (GLADglGetString)get_proc_addr("glGetString");
    glGetIntegerv = (GLADglGetIntegerv)get_proc_addr("glGetIntegerv");
    glGetError = (GLADglGetError)get_proc_addr("glGetError");
    glDrawArrays = (GLADglDrawArrays)get_proc_addr("glDrawArrays");
    glDrawElements = (GLADglDrawElements)get_proc_addr("glDrawElements");
    
    // Verify critical functions loaded
    if (!glGenBuffers || !glBindBuffer || !glBufferData ||
        !glGenVertexArrays || !glBindVertexArray ||
        !glCreateShader || !glCreateProgram ||
        !glUseProgram || !glGenTextures ||
        !glEnable || !glClear || !glDrawElements) {
        return 0;
    }
    
    // Get OpenGL version
    const char* version_str = (const char*)glGetString(GL_VERSION);
    if (version_str) {
        GLVersion.major = version_str[0] - '0';
        GLVersion.minor = version_str[2] - '0';
    }
    
    return 1;
}
