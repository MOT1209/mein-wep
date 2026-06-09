#include "glad/gl.h"

// GLFW function pointer loader forward declaration
typedef struct GLFWwindow GLFWwindow;
typedef void (*GLFWglproc)(void);
extern GLFWglproc glfwGetProcAddress(const char* procname);

// =============================================
// GL 1.2+ function pointer definitions
// (GL 1.0/1.1 functions are provided by opengl32.dll directly)
// =============================================

// Buffer objects (GL 1.5)
GLADglGenBuffers glGenBuffers = NULL;
GLADglDeleteBuffers glDeleteBuffers = NULL;
GLADglBindBuffer glBindBuffer = NULL;
GLADglBufferData glBufferData = NULL;
GLADglBufferSubData glBufferSubData = NULL;

// Vertex Array Objects (GL 3.0)
GLADglGenVertexArrays glGenVertexArrays = NULL;
GLADglDeleteVertexArrays glDeleteVertexArrays = NULL;
GLADglBindVertexArray glBindVertexArray = NULL;
GLADglVertexAttribPointer glVertexAttribPointer = NULL;
GLADglVertexAttribIPointer glVertexAttribIPointer = NULL;
GLADglEnableVertexAttribArray glEnableVertexAttribArray = NULL;
GLADglDisableVertexAttribArray glDisableVertexAttribArray = NULL;

// Shader functions (GL 2.0)
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

// Uniform functions (GL 2.0)
GLADglGetUniformLocation glGetUniformLocation = NULL;
GLADglUniform1i glUniform1i = NULL;
GLADglUniform1f glUniform1f = NULL;
GLADglUniform3f glUniform3f = NULL;
GLADglUniformMatrix4fv glUniformMatrix4fv = NULL;

// Texture functions (GL 1.2+)
GLADglActiveTexture glActiveTexture = NULL;
GLADglTexImage3D glTexImage3D = NULL;
GLADglTexSubImage3D glTexSubImage3D = NULL;
GLADglTexStorage3D glTexStorage3D = NULL;
GLADglGenerateMipmap glGenerateMipmap = NULL;

int gladLoadGL(GLADgetproc get_proc_addr) {
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
    
    glActiveTexture = (GLADglActiveTexture)get_proc_addr("glActiveTexture");
    glTexImage3D = (GLADglTexImage3D)get_proc_addr("glTexImage3D");
    glTexSubImage3D = (GLADglTexSubImage3D)get_proc_addr("glTexSubImage3D");
    glTexStorage3D = (GLADglTexStorage3D)get_proc_addr("glTexStorage3D");
    glGenerateMipmap = (GLADglGenerateMipmap)get_proc_addr("glGenerateMipmap");
    
    // Verify critical functions loaded
    if (!glGenBuffers || !glBindBuffer || !glBufferData ||
        !glGenVertexArrays || !glBindVertexArray ||
        !glCreateShader || !glCreateProgram ||
        !glUseProgram || !glActiveTexture) {
        return 0;
    }
    
    return 1;
}
