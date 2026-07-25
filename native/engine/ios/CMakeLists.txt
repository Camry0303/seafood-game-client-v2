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

# 修正 RES_DIR：Cocos 可能传入相对项目根的路径(如 "build/ios")，而 common/CMakeLists.txt 通过 include() 按源目录解析，
# 会找不到 build/ios/proj/cfg.cmake（COCOS_X_PATH 由此注入）。统一转成基于项目根(CMAKE_BINARY_DIR 上三级)的绝对路径并写回 cache。
if(DEFINED RES_DIR AND NOT IS_ABSOLUTE(RES_DIR))
    get_filename_component(_res_dir_abs "${RES_DIR}" ABSOLUTE BASE_DIR "${CMAKE_BINARY_DIR}/../../..")
    set(RES_DIR "${_res_dir_abs}" CACHE STRING "Resource directory" FORCE)
endif()

include(${CC_PROJECT_DIR}/../common/CMakeLists.txt)
set(EXECUTABLE_NAME ${APP_NAME}-mobile)

cc_ios_before_target(${EXECUTABLE_NAME})
add_executable(${EXECUTABLE_NAME} ${CC_ALL_SOURCES})
cc_ios_after_target(${EXECUTABLE_NAME})

# 显式将自定义原生源文件加入编译：Cocos 默认只收集模板预置文件(AppDelegate/ViewController/main)，
# 不会自动包含用户新增的 .mm，需在 CMake 里手动 target_sources，否则链接报 Undefined symbol。
target_sources(${EXECUTABLE_NAME} PRIVATE
    ${CMAKE_CURRENT_LIST_DIR}/BatteryMonitor.mm
    ${CMAKE_CURRENT_LIST_DIR}/LocationService.mm)

# ===== 微信 SDK 接入 =====
# 头文件路径：AppDelegate 用 #import "WechatSDK/WXApi.h"，需把 WechatSDK 的父目录加入搜索路径
target_include_directories(${EXECUTABLE_NAME} PRIVATE ${CMAKE_CURRENT_LIST_DIR})
# 微信静态库（与引擎一致使用 plain 签名，避免 keyword/plain 混用报错）
target_link_libraries(${EXECUTABLE_NAME} ${CMAKE_CURRENT_LIST_DIR}/WechatSDK/libWeChatSDK.a)

# 微信 SDK 依赖的系统库 / 框架
find_library(SYS_CONFIG_LIB SystemConfiguration)
find_library(CORE_TELEPHONY_LIB CoreTelephony)
find_library(SECURITY_LIB Security)
find_library(WEBKIT_LIB WebKit)
find_library(CFNETWORK_LIB CFNetwork)
find_library(CORELOCATION_LIB CoreLocation)
target_link_libraries(${EXECUTABLE_NAME}
    ${SYS_CONFIG_LIB}
    ${CORE_TELEPHONY_LIB}
    ${SECURITY_LIB}
    ${WEBKIT_LIB}
    ${CFNETWORK_LIB}
    ${CORELOCATION_LIB}
    sqlite3
    z)

# 微信要求 -ObjC -all_load；用 $(inherited) 保留引擎原有 flag，避免覆盖
set_target_properties(${EXECUTABLE_NAME} PROPERTIES
    XCODE_ATTRIBUTE_OTHER_LDFLAGS "$(inherited) -ObjC -all_load")
