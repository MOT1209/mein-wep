#include "core/types.h"
#include <cmath>

float Vec3f::length() const {
    return std::sqrt(x*x + y*y + z*z);
}

Vec3f Vec3f::normalized() const {
    float len = length();
    if (len < 0.0001f) return {0, 0, 0};
    return {x/len, y/len, z/len};
}
