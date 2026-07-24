package com.cjtech.xiabing.tools;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;

public class BatteryHelper {
    // 获取当前电量（0-1）
    public static float getBatteryLevel(Context context) {
        IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        Intent batteryStatus = context.registerReceiver(null, filter);
        assert batteryStatus != null;
        int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1);
        return (float) (level / (float) scale);
    }

    // 获取电池状态
    public static int getBatteryStatus(Context context) {
        IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        Intent intent = context.registerReceiver(null, filter);
        assert intent != null;
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
        return cocosBatteryStatus;
    }
}
