cmake_minimum_required(VERSION 3.20)
project(KingCraft VERSION 0.1.0 LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ============================================================
# OPTIONS
# ============================================================
option(KC_USE_OPENGL "Use OpenGL backend" ON)
option(KC_USE_VULKAN "Use Vulkan backend" OFF)

# ============================================================
# DEPENDENCIES
# ============================================================

# Local dependency paths (from setup_and_run.bat)
set(KC_DEPS_DIR "${CMAKE_SOURCE_DIR}/deps")

# GLFW (window + input)
if(EXISTS ${KC_DEPS_DIR}/glfw/include/GLFW/glfw3.h)
    # Use local prebuilt GLFW
    message(STATUS "Using local GLFW from ${KC_DEPS_DIR}/glfw")
    set(GLFW_INCLUDE_DIR "${KC_DEPS_DIR}/glfw/include")
    
    # Find the GLFW lib
    file(GLOB GLFW_LIBRARY "${KC_DEPS_DIR}/glfw/lib-mingw-w64/libglfw3dll.a")
    if(NOT GLFW_LIBRARY)
        file(GLOB GLFW_LIBRARY "${KC_DEPS_DIR}/glfw/lib/*.a")
    endif()
    if(NOT GLFW_LIBRARY)
        file(GLOB GLFW_LIBRARY "${KC_DEPS_DIR}/glfw/lib-vc2022/glfw3.lib")
    endif()
    
    if(GLFW_LIBRARY)
        add_library(glfw UNKNOWN IMPORTED)
        set_target_properties(glfw PROPERTIES
            IMPORTED_LOCATION "${GLFW_LIBRARY}"
            INTERFACE_INCLUDE_DIRECTORIES "${GLFW_INCLUDE_DIR}"
        )
        message(STATUS "GLFW library: ${GLFW_LIBRARY}")
    else()
        message(FATAL_ERROR "GLFW library not found in ${KC_DEPS_DIR}/glfw")
    endif()
else()
    # Try system GLFW
    find_package(glfw3 QUIET)
    if(NOT glfw3_FOUND)
        find_package(PkgConfig QUIET)
        if(PKG_CONFIG_FOUND)
            pkg_check_modules(GLFW glfw3)
        endif()
    endif()
    if(NOT glfw3_FOUND AND NOT GLFW_FOUND)
        message(FATAL_ERROR "GLFW not found. Run setup_and_run.bat or install glfw3")
    endif()
endif()

# OpenGL
if(KC_USE_OPENGL)
    find_package(OpenGL REQUIRED)
    add_compile_definitions(KC_OPENGL)
endif()

# GLM (header-only)
if(EXISTS ${KC_DEPS_DIR}/glm/glm/glm.hpp)
    message(STATUS "Using local GLM from ${KC_DEPS_DIR}/glm")
    add_library(glm INTERFACE)
    target_include_directories(glm INTERFACE ${KC_DEPS_DIR}/glm)
    set(GLM_FOUND TRUE)
else()
    find_package(glm QUIET)
    if(NOT glm_FOUND)
        # Fallback: check libs/glm
        if(EXISTS ${CMAKE_SOURCE_DIR}/libs/glm/glm/glm.hpp)
            message(STATUS "Using GLM from libs/glm")
            add_library(glm INTERFACE)
            target_include_directories(glm INTERFACE ${CMAKE_SOURCE_DIR}/libs)
        else()
            message(FATAL_ERROR "GLM not found. Run setup_and_run.bat or install glm")
        endif()
    endif()
endif()

# stb_image
add_library(stb_image INTERFACE)
target_include_directories(stb_image INTERFACE ${CMAKE_SOURCE_DIR}/libs/stb)

# JSON (nlohmann) - optional
find_package(nlohmann_json QUIET)
if(NOT nlohmann_json_FOUND)
    message(STATUS "nlohmann_json not found, using built-in block registry")
    add_compile_definitions(NO_JSON)
endif()

# GLAD (OpenGL loader — hybrid: system + runtime)
add_library(glad ${CMAKE_SOURCE_DIR}/libs/glad/src/glad.c)
target_include_directories(glad PUBLIC ${CMAKE_SOURCE_DIR}/libs/glad/include)

# ============================================================
# SOURCES
# ============================================================
set(CORE_SRC
    src/core/types.cpp
)

set(WORLD_SRC
    src/world/block_registry.cpp
    src/world/chunk.cpp
    src/world/world_gen.cpp
    src/world/mesh_gen.cpp
)

set(RENDER_SRC
    src/render/renderer_opengl.cpp
    src/render/shader.cpp
)

set(GAME_SRC
    src/game/game.cpp
    src/game/player.cpp
    src/game/items.cpp
    src/game/crafting.cpp
)

set(ECS_SRC
    src/ecs/ecs.cpp
)

set(AI_SRC
    src/ai/ai_system.cpp
)

set(ENTITY_SRC
    src/entities/item_entity.cpp
)

set(MAIN_SRC
    src/main.cpp
)

# ============================================================
# EXECUTABLE
# ============================================================
add_executable(KingCraft
    ${CORE_SRC}
    ${WORLD_SRC}
    ${RENDER_SRC}
    ${GAME_SRC}
    ${ECS_SRC}
    ${AI_SRC}
    ${ENTITY_SRC}
    ${MAIN_SRC}
)

target_include_directories(KingCraft PRIVATE
    ${CMAKE_SOURCE_DIR}/src
    ${CMAKE_SOURCE_DIR}/libs
    ${CMAKE_SOURCE_DIR}/libs/glad/include
)

target_link_libraries(KingCraft PRIVATE
    glfw
    ${OPENGL_LIBRARIES}
    glm
    stb_image
    glad
    ${GLFW_EXTRA_LIBS}
)

if(WIN32 AND MINGW)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,--allow-multiple-definition")
endif()

if(nlohmann_json_FOUND)
    target_link_libraries(KingCraft PRIVATE nlohmann_json::nlohmann_json)
endif()

# ============================================================
# COPY ASSETS TO BUILD DIR
# ============================================================
file(COPY ${CMAKE_SOURCE_DIR}/shaders DESTINATION ${CMAKE_BINARY_DIR})

# ============================================================
# INSTALL
# ============================================================
install(TARGETS KingCraft DESTINATION bin)
