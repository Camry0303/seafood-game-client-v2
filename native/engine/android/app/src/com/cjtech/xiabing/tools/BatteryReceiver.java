package com.cjtech.xiabing.tools;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;

import com.cocos.lib.CocosHelper;
import com.cocos.lib.CocosJavascriptJavaBridge;

public class BatteryReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
//        super.onReceive(context, intent); // 调用父类方法
        // 获取电量
        int level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        float batteryPct = level / (float) scale;

        int batteryStatus = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1);

        int cocosBatteryStatus = -1;
        switch (batteryStatus) {
            case BatteryManager.BATTERY_STATUS_CHARGING:
                // 处理充电状态
                cocosBatteryStatus = 2;
                break;
            case BatteryManager.BATTERY_STATUS_DISCHARGING:
            case BatteryManager.BATTERY_STATUS_NOT_CHARGING:
                // 处理放电状态
                // 处理未充电状态
                cocosBatteryStatus = 1;
                break;
            case BatteryManager.BATTERY_STATUS_FULL:
                // 处理已充满状态
                cocosBatteryStatus = 3;
                break;
            case BatteryManager.BATTERY_STATUS_UNKNOWN:
                // 处理未知状态
                cocosBatteryStatus = 0;
                break;
            default:  // -1 或其他值
                // 无效状态处理
                break;
        }

//        System.out.println("BatteryReceiver: In BatteryReceiver batteryPct is " + batteryPct);
//        System.out.println("BatteryReceiver: In BatteryReceiver cocosBatteryStatus is " + cocosBatteryStatus);
        // 通知UI
        int finalCocosBatteryStatus = cocosBatteryStatus;
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                CocosJavascriptJavaBridge.evalString("NativeAPI.receiveBatteryInfo('"+batteryPct+"','"+ finalCocosBatteryStatus +"')");
            }
        });
    }
}
