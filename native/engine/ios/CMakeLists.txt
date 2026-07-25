cmake_minimum_required(VERSION 3.8)

set(CMAKE_SYSTEM_NAME iOS)
set(APP_NAME "seafood-game-client-v2"  CACHE STRING "Project Name")

project(${APP_NAME} CXX)

set(CC_PROJECT_DIR ${CMAKE_CURRENT_LIST_DIR})
set(CC_UI_RESOURCES)
set(CC_PROJ_SOURCES)
set(CC_ASSET_FILES)
set(CC_COMMON_SOURCES)
set(CC_ALL_SOURCES)

include(${CC_PROJECT_DIR}/../common/CMakeLists.txt)
set(EXECUTABLE_NAME ${APP_NAME}-mobile)

cc_ios_before_target(${EXECUTABLE_NAME})
add_executable(${EXECUTABLE_NAME} ${CC_ALL_SOURCES})
cc_ios_after_target(${EXECUTABLE_NAME})

# ===== 微信 SDK 接入 =====
# 头文件路径：AppDelegate 用 #import "WechatSDK/WXApi.h"，需把 WechatSDK 的父目录加入搜索路径
target_include_directories(${EXECUTABLE_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR})
# 微信静态库
target_link_libraries(${EXECUTABLE_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR}/WechatSDK/libWeChatSDK.a)

# 微信 SDK 依赖的系统库 / 框架
find_library(SYS_CONFIG_LIB SystemConfiguration)
find_library(CORE_TELEPHONY_LIB CoreTelephony)
find_library(SECURITY_LIB Security)
find_library(WEBKIT_LIB WebKit)
find_library(CFNETWORK_LIB CFNetwork)
target_link_libraries(${EXECUTABLE_NAME} PRIVATE
    ${SYS_CONFIG_LIB}
    ${CORE_TELEPHONY_LIB}
    ${SECURITY_LIB}
    ${WEBKIT_LIB}
    ${CFNETWORK_LIB}
    sqlite3
    z
    CoreLocation)

# 微信要求 -ObjC -all_load；用 $(inherited) 保留引擎原有 flag，避免覆盖
set_target_properties(${EXECUTABLE_NAME} PROPERTIES
    XCODE_ATTRIBUTE_OTHER_LDFLAGS "$(inherited) -ObjC -all_load")
