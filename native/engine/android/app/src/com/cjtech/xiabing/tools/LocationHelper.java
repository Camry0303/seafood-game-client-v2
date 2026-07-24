package com.cjtech.xiabing.tools;

// LocationHelper.java

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import  androidx.core.app.ActivityCompat;

import java.util.List;

// 定位助手
public class LocationHelper {
    private static final int LOCATION_UPDATE_MIN_TIME = 10000; // 10秒
    private static final int LOCATION_UPDATE_MIN_DISTANCE = 10; // 10米

    private final Context context;
    private LocationManager locationManager;
    private LocationListener locationListener;

    public interface LocationCallback {
        void onLocationReceived(double latitude, double longitude);
        void onLocationError(String error);
    }

    public LocationHelper(Context context) {
        this.context = context;
        locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    }

    // 检查定位权限
    public boolean hasLocationPermission() {
        return ActivityCompat.checkSelfPermission(context,
                Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    // 获取最后一次已知位置
    public Location getLastKnownLocation() {
        if (!hasLocationPermission()) return null;

        Location bestLocation = null;
        float bestAccuracy = Float.MAX_VALUE;

        // 检查所有可用的位置提供器
        List<String> providers = locationManager.getProviders(true);
        for (String provider : providers) {
            try {
                Location location = locationManager.getLastKnownLocation(provider);
                if (location != null && location.hasAccuracy()) {
                    // 选择精度最高的位置
                    if (location.getAccuracy() < bestAccuracy) {
                        bestLocation = location;
                        bestAccuracy = location.getAccuracy();
                    }
                }
            } catch (SecurityException ignored) {}
        }
        return bestLocation;
    }

    // 开始监听位置更新
    public void startLocationUpdates(LocationCallback callback) {
        if (!hasLocationPermission()) {
            callback.onLocationError("Location permission not granted");
            return;
        }

        locationListener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location != null) {
                    callback.onLocationReceived(location.getLatitude(), location.getLongitude());
                }
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {}

            @Override
            public void onProviderEnabled(String provider) {}

            @Override
            public void onProviderDisabled(String provider) {
                callback.onLocationError("Location provider disabled: " + provider);
            }
        };

        try {
            // 请求GPS位置更新
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,
                        LOCATION_UPDATE_MIN_TIME, LOCATION_UPDATE_MIN_DISTANCE,
                        locationListener, Looper.getMainLooper());
            }

            // 请求网络位置更新
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,
                        LOCATION_UPDATE_MIN_TIME, LOCATION_UPDATE_MIN_DISTANCE,
                        locationListener, Looper.getMainLooper());
            }
        } catch (SecurityException e) {
            callback.onLocationError("SecurityException: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            callback.onLocationError("IllegalArgumentException: " + e.getMessage());
        }
    }

    // 停止位置更新
    public void stopLocationUpdates() {
        if (locationListener != null) {
            try {
                locationManager.removeUpdates(locationListener);
            } catch (SecurityException e) {
                // 忽略安全异常
            }
            locationListener = null;
        }
    }
}
