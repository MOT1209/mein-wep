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

# GLFW (window + input)
find_package(glfw3 REQUIRED)

# OpenGL
if(KC_USE_OPENGL)
    find_package(OpenGL REQUIRED)
    add_compile_definitions(KC_OPENGL)
endif()

# GLM (math)
find_package(glm REQUIRED)
if(NOT glm_FOUND)
    # Fallback: include glm directly if not found
    message(STATUS "GLM not found via find_package, checking for local copy...")
    if(EXISTS ${CMAKE_SOURCE_DIR}/libs/glm/glm.hpp)
        add_library(glm INTERFACE)
        target_include_directories(glm INTERFACE ${CMAKE_SOURCE_DIR}/libs)
    else()
        message(FATAL_ERROR "GLM not found. Install glm or add it to libs/")
    endif()
endif()

# stb_image (not used directly yet, but included for future)
add_library(stb_image INTERFACE)
target_include_directories(stb_image INTERFACE ${CMAKE_SOURCE_DIR}/libs/stb)

# JSON (nlohmann) - optional, only needed for JSON block loading
find_package(nlohmann_json QUIET)
if(NOT nlohmann_json_FOUND)
    message(STATUS "nlohmann_json not found, using built-in block registry")
    add_compile_definitions(NO_JSON)
endif()

# GLAD (OpenGL loader)
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
    glm::glm
    stb_image
    glad
)

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
