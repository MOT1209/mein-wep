#ifndef GLAD_GL_H_
#define GLAD_GL_H_

#include <stddef.h>
#include <stdint.h>

#ifndef GLAD_API_CALL
#define GLAD_API_CALL
#endif

#ifndef GLAD_API_PTR
#define GLAD_API_PTR
#endif

struct GLVersion { int major; int minor; };

// OpenGL core types
typedef unsigned int GLenum;
typedef unsigned char GLboolean;
typedef unsigned int GLbitfield;
typedef signed char GLbyte;
typedef short GLshort;
typedef int GLint;
typedef int GLsizei;
typedef uint8_t GLubyte;
typedef uint16_t GLushort;
typedef unsigned int GLuint;
typedef float GLfloat;
typedef float GLclampf;
typedef double GLdouble;
typedef double GLclampd;
typedef void GLvoid;
typedef int64_t GLint64;
typedef uint64_t GLuint64;
typedef struct __GLsync* GLsync;

// Constants
#define GL_FALSE 0
#define GL_TRUE 1
#define GL_NONE 0
#define GL_ZERO 0
#define GL_ONE 1
#define GL_NO_ERROR 0
#define GL_NONE 0
#define GL_VERSION 0x1F02
#define GL_EXTENSIONS 0x1F03
#define GL_RENDERER 0x1F01
#define GL_VENDOR 0x1F00
#define GL_DEPTH_BUFFER_BIT 0x00000100
#define GL_STENCIL_BUFFER_BIT 0x00000400
#define GL_COLOR_BUFFER_BIT 0x00004000
#define GL_TRIANGLES 0x0004
#define GL_TRIANGLE_STRIP 0x0005
#define GL_TRIANGLE_FAN 0x0006
#define GL_LINES 0x0001
#define GL_LINE_STRIP 0x0003
#define GL_POINTS 0x0000
#define GL_FLOAT 0x1406
#define GL_INT 0x1404
#define GL_UNSIGNED_INT 0x1405
#define GL_UNSIGNED_BYTE 0x1401
#define GL_BYTE 0x1400
#define GL_SHORT 0x1402
#define GL_UNSIGNED_SHORT 0x1403
#define GL_BOOL 0x8B56
#define GL_VEC2 0x8B50
#define GL_VEC3 0x8B51
#define GL_VEC4 0x8B52
#define GL_MAT4 0x8B5C
#define GL_SAMPLER_2D 0x8B5E
#define GL_SAMPLER_2D_ARRAY 0x8DC1
#define GL_TEXTURE_2D 0x0DE1
#define GL_TEXTURE_2D_ARRAY 0x8C1A
#define GL_TEXTURE_3D 0x806F
#define GL_TEXTURE0 0x84C0
#define GL_TEXTURE_MIN_FILTER 0x2801
#define GL_TEXTURE_MAG_FILTER 0x2800
#define GL_TEXTURE_WRAP_S 0x2802
#define GL_TEXTURE_WRAP_T 0x2803
#define GL_TEXTURE_WRAP_R 0x8072
#define GL_CLAMP_TO_EDGE 0x812F
#define GL_REPEAT 0x2901
#define GL_NEAREST 0x2600
#define GL_LINEAR 0x2601
#define GL_NEAREST_MIPMAP_NEAREST 0x2700
#define GL_LINEAR_MIPMAP_LINEAR 0x2708
#define GL_RGBA 0x1908
#define GL_RGB 0x1907
#define GL_RGBA8 0x8058
#define GL_RGB8 0x8051
#define GL_DEPTH_COMPONENT 0x1902
#define GL_DEPTH_COMPONENT24 0x81A6
#define GL_DEPTH_COMPONENT32 0x81A7
#define GL_DEPTH24_STENCIL8 0x88F0
#define GL_FRAGMENT_SHADER 0x8B30
#define GL_VERTEX_SHADER 0x8B31
#define GL_COMPILE_STATUS 0x8B81
#define GL_LINK_STATUS 0x8B82
#define GL_INFO_LOG_LENGTH 0x8B84
#define GL_CULL_FACE 0x0B44
#define GL_BACK 0x0405
#define GL_FRONT 0x0404
#define GL_FRONT_AND_BACK 0x0408
#define GL_CCW 0x0901
#define GL_CW 0x0900
#define GL_DEPTH_TEST 0x0B71
#define GL_LEQUAL 0x0203
#define GL_LESS 0x0201
#define GL_EQUAL 0x0202
#define GL_ALWAYS 0x0207
#define GL_BLEND 0x0BE2
#define GL_SRC_ALPHA 0x0302
#define GL_ONE_MINUS_SRC_ALPHA 0x0303
#define GL_ARRAY_BUFFER 0x8892
#define GL_ELEMENT_ARRAY_BUFFER 0x8893
#define GL_STATIC_DRAW 0x88E4
#define GL_DYNAMIC_DRAW 0x88E8
#define GL_STREAM_DRAW 0x88E0
#define GL_FRAGMENT_SHADER 0x8B30
#define GL_VERTEX_SHADER 0x8B31
#define GL_VERTEX_ARRAY_BINDING 0x85B5
#define GL_RGBA32F 0x8814
#define GL_RGB32F 0x8815
#define GL_R32F 0x822E
#define GL_R8 0x8229
#define GL_RG8 0x822B
#define GL_RGB16F 0x881B
#define GL_RGBA16F 0x881A
#define GL_TEXTURE_MAX_LEVEL 0x813D
#define GL_TEXTURE_BASE_LEVEL 0x813C
#define GL_GENERATE_MIPMAP 0x8191
#define GL_NEAREST_MIPMAP_LINEAR 0x2702
#define GL_LINEAR_MIPMAP_NEAREST 0x2701
#define GL_DECR 0x1E03
#define GL_INCR 0x1E02
#define GL_KEEP 0x1E00
#define GL_REPLACE 0x1E01
#define GL_STENCIL_TEST 0x0B90
#define GL_SCISSOR_TEST 0x0C11
#define GL_STREAM_READ 0x88E1
#define GL_STREAM_COPY 0x88E2
#define GL_DYNAMIC_READ 0x88E9
#define GL_DYNAMIC_COPY 0x88EA
#define GL_STATIC_READ 0x88E5
#define GL_STATIC_COPY 0x88E6
#define GL_UNSIGNED_SHORT_5_6_5 0x8363
#define GL_UNSIGNED_SHORT_4_4_4_4 0x8033
#define GL_UNSIGNED_SHORT_5_5_5_1 0x8034
#define GL_RGB5 0x8050
#define GL_RGBA4 0x8056
#define GL_LINE 0x1B01
#define GL_FILL 0x1B02
#define GL_POLYGON_MODE 0x0B40
#define GL_LINE_SMOOTH 0x0B20
#define GL_NICEST 0x1102
#define GL_FASTEST 0x1101
#define GL_DONT_CARE 0x1100
#define GL_PACK_ALIGNMENT 0x0D05
#define GL_UNPACK_ALIGNMENT 0x0CF5

// Function pointer types
typedef void (GLAD_API_PTR *GLADglGenBuffers)(GLsizei n, GLuint *buffers);
typedef void (GLAD_API_PTR *GLADglDeleteBuffers)(GLsizei n, const GLuint *buffers);
typedef void (GLAD_API_PTR *GLADglBindBuffer)(GLenum target, GLuint buffer);
typedef void (GLAD_API_PTR *GLADglBufferData)(GLenum target, GLsizeiptr size, const void *data, GLenum usage);
typedef void (GLAD_API_PTR *GLADglBufferSubData)(GLenum target, GLintptr offset, GLsizeiptr size, const void *data);

typedef void (GLAD_API_PTR *GLADglGenVertexArrays)(GLsizei n, GLuint *arrays);
typedef void (GLAD_API_PTR *GLADglDeleteVertexArrays)(GLsizei n, const GLuint *arrays);
typedef void (GLAD_API_PTR *GLADglBindVertexArray)(GLuint array);
typedef void (GLAD_API_PTR *GLADglVertexAttribPointer)(GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride, const void *pointer);
typedef void (GLAD_API_PTR *GLADglVertexAttribIPointer)(GLuint index, GLint size, GLenum type, GLsizei stride, const void *pointer);
typedef void (GLAD_API_PTR *GLADglEnableVertexAttribArray)(GLuint index);
typedef void (GLAD_API_PTR *GLADglDisableVertexAttribArray)(GLuint index);

typedef GLuint (GLAD_API_PTR *GLADglCreateShader)(GLenum type);
typedef void (GLAD_API_PTR *GLADglShaderSource)(GLuint shader, GLsizei count, const GLchar *const *string, const GLint *length);
typedef void (GLAD_API_PTR *GLADglCompileShader)(GLuint shader);
typedef void (GLAD_API_PTR *GLADglGetShaderiv)(GLuint shader, GLenum pname, GLint *params);
typedef void (GLAD_API_PTR *GLADglGetShaderInfoLog)(GLuint shader, GLsizei bufSize, GLsizei *length, GLchar *infoLog);
typedef void (GLAD_API_PTR *GLADglDeleteShader)(GLuint shader);
typedef GLuint (GLAD_API_PTR *GLADglCreateProgram)(void);
typedef void (GLAD_API_PTR *GLADglAttachShader)(GLuint program, GLuint shader);
typedef void (GLAD_API_PTR *GLADglLinkProgram)(GLuint program);
typedef void (GLAD_API_PTR *GLADglGetProgramiv)(GLuint program, GLenum pname, GLint *params);
typedef void (GLAD_API_PTR *GLADglGetProgramInfoLog)(GLuint program, GLsizei bufSize, GLsizei *length, GLchar *infoLog);
typedef void (GLAD_API_PTR *GLADglUseProgram)(GLuint program);
typedef void (GLAD_API_PTR *GLADglDeleteProgram)(GLuint program);

typedef GLint (GLAD_API_PTR *GLADglGetUniformLocation)(GLuint program, const GLchar *name);
typedef void (GLAD_API_PTR *GLADglUniform1i)(GLint location, GLint v0);
typedef void (GLAD_API_PTR *GLADglUniform1f)(GLint location, GLfloat v0);
typedef void (GLAD_API_PTR *GLADglUniform3f)(GLint location, GLfloat v0, GLfloat v1, GLfloat v2);
typedef void (GLAD_API_PTR *GLADglUniformMatrix4fv)(GLint location, GLsizei count, GLboolean transpose, const GLfloat *value);
typedef void (GLAD_API_PTR *GLADglUniform4f)(GLint location, GLfloat v0, GLfloat v1, GLfloat v2, GLfloat v3);

typedef void (GLAD_API_PTR *GLADglGenTextures)(GLsizei n, GLuint *textures);
typedef void (GLAD_API_PTR *GLADglDeleteTextures)(GLsizei n, const GLuint *textures);
typedef void (GLAD_API_PTR *GLADglActiveTexture)(GLenum texture);
typedef void (GLAD_API_PTR *GLADglBindTexture)(GLenum target, GLuint texture);
typedef void (GLAD_API_PTR *GLADglTexImage2D)(GLenum target, GLint level, GLint internalformat, GLsizei width, GLsizei height, GLint border, GLenum format, GLenum type, const void *pixels);
typedef void (GLAD_API_PTR *GLADglTexImage3D)(GLenum target, GLint level, GLint internalformat, GLsizei width, GLsizei height, GLsizei depth, GLint border, GLenum format, GLenum type, const void *pixels);
typedef void (GLAD_API_PTR *GLADglTexSubImage3D)(GLenum target, GLint level, GLint xoffset, GLint yoffset, GLint zoffset, GLsizei width, GLsizei height, GLsizei depth, GLenum format, GLenum type, const void *pixels);
typedef void (GLAD_API_PTR *GLADglTexStorage3D)(GLenum target, GLsizei levels, GLenum internalformat, GLsizei width, GLsizei height, GLsizei depth);
typedef void (GLAD_API_PTR *GLADglTexParameteri)(GLenum target, GLenum pname, GLint param);
typedef void (GLAD_API_PTR *GLADglTexParameterf)(GLenum target, GLenum pname, GLfloat param);
typedef void (GLAD_API_PTR *GLADglGenerateMipmap)(GLenum target);

typedef void (GLAD_API_PTR *GLADglEnable)(GLenum cap);
typedef void (GLAD_API_PTR *GLADglDisable)(GLenum cap);
typedef void (GLAD_API_PTR *GLADglCullFace)(GLenum mode);
typedef void (GLAD_API_PTR *GLADglFrontFace)(GLenum mode);
typedef void (GLAD_API_PTR *GLADglDepthFunc)(GLenum func);
typedef void (GLAD_API_PTR *GLADglBlendFunc)(GLenum sfactor, GLenum dfactor);
typedef void (GLAD_API_PTR *GLADglClear)(GLbitfield mask);
typedef void (GLAD_API_PTR *GLADglClearColor)(GLfloat red, GLfloat green, GLfloat blue, GLfloat alpha);
typedef void (GLAD_API_PTR *GLADglViewport)(GLint x, GLint y, GLsizei width, GLsizei height);

typedef const GLubyte* (GLAD_API_PTR *GLADglGetString)(GLenum name);
typedef void (GLAD_API_PTR *GLADglGetIntegerv)(GLenum pname, GLint *data);
typedef GLenum (GLAD_API_PTR *GLADglGetError)(void);
typedef void (GLAD_API_PTR *GLADglDrawArrays)(GLenum mode, GLint first, GLsizei count);
typedef void (GLAD_API_PTR *GLADglDrawElements)(GLenum mode, GLsizei count, GLenum type, const void *indices);

// Function pointer declarations
extern GLADglGenBuffers glGenBuffers;
extern GLADglDeleteBuffers glDeleteBuffers;
extern GLADglBindBuffer glBindBuffer;
extern GLADglBufferData glBufferData;
extern GLADglBufferSubData glBufferSubData;

extern GLADglGenVertexArrays glGenVertexArrays;
extern GLADglDeleteVertexArrays glDeleteVertexArrays;
extern GLADglBindVertexArray glBindVertexArray;
extern GLADglVertexAttribPointer glVertexAttribPointer;
extern GLADglVertexAttribIPointer glVertexAttribIPointer;
extern GLADglEnableVertexAttribArray glEnableVertexAttribArray;
extern GLADglDisableVertexAttribArray glDisableVertexAttribArray;

extern GLADglCreateShader glCreateShader;
extern GLADglShaderSource glShaderSource;
extern GLADglCompileShader glCompileShader;
extern GLADglGetShaderiv glGetShaderiv;
extern GLADglGetShaderInfoLog glGetShaderInfoLog;
extern GLADglDeleteShader glDeleteShader;
extern GLADglCreateProgram glCreateProgram;
extern GLADglAttachShader glAttachShader;
extern GLADglLinkProgram glLinkProgram;
extern GLADglGetProgramiv glGetProgramiv;
extern GLADglGetProgramInfoLog glGetProgramInfoLog;
extern GLADglUseProgram glUseProgram;
extern GLADglDeleteProgram glDeleteProgram;

extern GLADglGetUniformLocation glGetUniformLocation;
extern GLADglUniform1i glUniform1i;
extern GLADglUniform1f glUniform1f;
extern GLADglUniform3f glUniform3f;
extern GLADglUniformMatrix4fv glUniformMatrix4fv;

extern GLADglGenTextures glGenTextures;
extern GLADglDeleteTextures glDeleteTextures;
extern GLADglActiveTexture glActiveTexture;
extern GLADglBindTexture glBindTexture;
extern GLADglTexImage2D glTexImage2D;
extern GLADglTexImage3D glTexImage3D;
extern GLADglTexSubImage3D glTexSubImage3D;
extern GLADglTexStorage3D glTexStorage3D;
extern GLADglTexParameteri glTexParameteri;
extern GLADglGenerateMipmap glGenerateMipmap;

extern GLADglEnable glEnable;
extern GLADglDisable glDisable;
extern GLADglCullFace glCullFace;
extern GLADglFrontFace glFrontFace;
extern GLADglDepthFunc glDepthFunc;
extern GLADglBlendFunc glBlendFunc;
extern GLADglClear glClear;
extern GLADglClearColor glClearColor;
extern GLADglViewport glViewport;

extern GLADglGetString glGetString;
extern GLADglGetIntegerv glGetIntegerv;
extern GLADglGetError glGetError;
extern GLADglDrawArrays glDrawArrays;
extern GLADglDrawElements glDrawElements;

// Init function (loads all function pointers from GLFW)
extern struct GLVersion GLVersion;
int gladLoadGL(void* (*get_proc_addr)(const char *name));

// Convenience types used in OpenGL functions
typedef ptrdiff_t GLsizeiptr;
typedef ptrdiff_t GLintptr;
typedef char GLchar;

#endif // GLAD_GL_H_
