/****************************************************************************
 Copyright (c) 2015-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
package com.cocos.game;

import static com.cocos.lib.GlobalObject.getContext;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.IntentFilter;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.cjtech.xiabing.tools.BatteryHelper;
import com.cjtech.xiabing.tools.BatteryReceiver;
import com.cjtech.xiabing.tools.LocationHelper;
import com.cocos.lib.CocosHelper;
import com.cocos.lib.CocosJavascriptJavaBridge;
import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;

import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import android.content.pm.PackageManager;
import android.location.Location;
import android.Manifest;

public class AppActivity extends CocosActivity {
    // 添加静态实例引用
    private static AppActivity instance;

    // 微信appId
    private static final String appId = "wx8fec0cd047c3178b";

    // 签名域名
    private static final String signDomain = "csw.sign.sumjay.com";

    // 电池信息监听类
    private static BatteryReceiver batteryReceiver = null;

    // 是否监听电池信息
    private static Boolean isBatteryMonitoring = false;

    // 定位权限
    private static final int LOCATION_PERMISSION_CODE = 1001;

    // 定位助手
    private static LocationHelper locationHelper;


    // 微信OpenAPI访问入口
    public static IWXAPI api;

    // 获取当前活动实例（替代 getInstance()）
    public static AppActivity getActivityInstance() {
        return instance;
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.shared().init(this);

        // 保存当前实例
        instance = this;

        // 实例化定位助手
        locationHelper = new LocationHelper(this);

        // 初始化api入口
        api = WXAPIFactory.createWXAPI(this,appId);
        // 将应用的appId注册到微信
        api.registerApp(appId);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.shared().onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.shared().onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }
        SDKWrapper.shared().onDestroy();
        if(batteryReceiver != null){
            unregisterReceiver(batteryReceiver);
        }
        if(locationHelper !=null){
            locationHelper.stopLocationUpdates();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.shared().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.shared().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.shared().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.shared().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.shared().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.shared().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.shared().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.shared().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.shared().onStart();
        super.onStart();
    }

    @Override
    public void onLowMemory() {
        SDKWrapper.shared().onLowMemory();
        super.onLowMemory();
    }

    // 进入微信登录接口
    public static void wxLogin(){
        System.out.println("AppActivity: Enter the wxLogin");
        // 向微信服务器请求code
        requestAccessCode();
    }

    // 获取微信登录第一步的accessCode
    public static void requestAccessCode(){
        final SendAuth.Req req = new SendAuth.Req();
        req.scope = "snsapi_userinfo";
        req.state = "request_userinfo";
        System.out.println("AppActivity: req is " + req);
        //利用微信api发送请求
        api.sendReq(req);
        System.out.println("AppActivity: 发送请求完毕");
        System.out.println("AppActivity: In AppActivity api is " + api);
    }

    // 返回AccessCode到JSB中
    public static void returnAccessCode(String accessCode){
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                CocosJavascriptJavaBridge.evalString("NativeAPI.receiveAccessCode('"+accessCode+"')");
            }
        });
    }

    // 通知JSB微信授权失败信息
    public static  void wechatAuthFailed(String msg){
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                CocosJavascriptJavaBridge.evalString("NativeAPI.notifyWxAuthFailed('"+msg+"')");
            }
        });
    }

    // 获取签名域名
    public static String getSignDomain(){
        System.out.println("AppActivity: getSignDomain---> signDomain is " + signDomain);
        return signDomain;
    }

    // 主动获取电量信息
    public static String getBatteryInfo(){
        float batteryLevel = BatteryHelper.getBatteryLevel(getContext());
        int batteryState = BatteryHelper.getBatteryStatus(getContext());
        return batteryLevel+","+batteryState;
    }

    // 开始监听电池变化
    public static void startBatteryMonitoring() {
        if (isBatteryMonitoring) return;

        Context context = getContext();
        batteryReceiver = new BatteryReceiver();
        IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        context.registerReceiver(batteryReceiver, filter);
        isBatteryMonitoring = true;
        System.out.println("AppActivity: startBatteryMonitoring---> Battery monitoring started");
    }

    // 停止监听电池变化
    public static void stopBatteryMonitoring() {
        if (!isBatteryMonitoring || batteryReceiver == null) return;

        Context context = getContext();
        context.unregisterReceiver(batteryReceiver);
        batteryReceiver = null;
        isBatteryMonitoring = false;
        System.out.println("BatteryMonitor: startBatteryMonitoring---> Battery monitoring stopped");
    }

    // 请求定位权限方法
    public static void requestLocationPermission() {
        if (locationHelper == null) return;
        if (!locationHelper.hasLocationPermission()) {
            // 使用 getActivityInstance() 替代 getInstance()
            ActivityCompat.requestPermissions(
                    getActivityInstance(),
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, // 修正权限名称
                    LOCATION_PERMISSION_CODE
            );
        }
    }

    // 权限请求结果回调
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // 权限已授予，可以发送事件到TS层
                CocosHelper.runOnGameThread(new Runnable() {
                    @Override
                    public void run() {
                        CocosJavascriptJavaBridge.evalString("NativeAPI.onLocationPermissionIsGranted('{\"isGranted\":true,\"system\":\"ANDROID\"}')");
                    }
                });
            } else {
                // 权限被拒绝
                CocosHelper.runOnGameThread(new Runnable() {
                    @Override
                    public void run() {
                        CocosJavascriptJavaBridge.evalString("NativeAPI.onLocationPermissionIsGranted('{\"isGranted\":false,\"system\":\"ANDROID\"}')");
                    }
                });
            }
        }
    }

    // 获取最后位置（供TS调用）
    public static String getLastLocation() {
        if (locationHelper == null || !locationHelper.hasLocationPermission()) {
            return "{\"error\":\"Permission denied or helper not initialized\"}";
        }

        Location location = locationHelper.getLastKnownLocation();
        if (location != null) {
            return "{\"latitude\":" + location.getLatitude() +
                    ",\"longitude\":" + location.getLongitude() + "}";
        }
        return "{\"error\":\"Location unavailable\"}";
    }

    // 开始监听位置更新（供TS调用）
    public static void startLocationUpdates() {
        if (locationHelper != null) {
            locationHelper.startLocationUpdates(new LocationHelper.LocationCallback() {
                @Override
                public void onLocationReceived(double latitude, double longitude) {
                    // 发送事件到TS层
                    CocosHelper.runOnGameThread(new Runnable() {
                        @Override
                        public void run() {
                            CocosJavascriptJavaBridge.evalString("NativeAPI.onLocationUpdate('{ \" +\n" +
                                    "\"latitude: \" "+ latitude +" \", \" +\n" +
                                    "\"longitude: \" "+ longitude +" \" }')");
                        }
                    });
                }

                @Override
                public void onLocationError(String error) {
                    CocosHelper.runOnGameThread(new Runnable() {
                        @Override
                        public void run() {
                            CocosJavascriptJavaBridge.evalString("NativeAPI.onLocationUpdate('{error:\"location_error\"}')");
                        }
                    });
                }
            });
        }
    }

    // 停止位置更新（供TS调用）
    public static void stopLocationUpdates() {
        if (locationHelper != null) {
            locationHelper.stopLocationUpdates();
        }
    }
}