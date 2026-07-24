package com.cjtech.xiabing.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

import com.cocos.game.AppActivity;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler {
    // 微信appId
    private static final String appId = "wx8fec0cd047c3178b";

    // 微信OpenAPI访问入口
    private IWXAPI api;

    // 微信发送的请求将回调该方法
    private void regToWx(){
        api = WXAPIFactory.createWXAPI(this,appId,true);
        api.registerApp(appId);
        System.out.println("###############");
        System.out.println("WXEntryActivity: In wxEntryActivity api is " + api);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        System.out.println("WXEntryActivity: enter the wxEntryActivity");
        regToWx();
        //这句话很关键
        try {
            api.handleIntent(getIntent(), this);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        System.out.println("WXEntryActivity: intent is " + intent);
        setIntent(intent);
        api.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq baseReq) {
    }

    // 向微信发送的请求的响应信息回调该方法
    @Override
    public void onResp(BaseResp baseResp) {
        System.out.println("WXEntryActivity: Enter the onResp");
        System.out.println("WXEntryActivity: api is " + api);
        if(baseResp.errCode == BaseResp.ErrCode.ERR_OK){
            String code = ((SendAuth.Resp) baseResp).code;
            System.out.println("WXEntryActivity: accessCode is "+code);
            // 调用JSB函数返回微信AccessCode
            AppActivity.returnAccessCode(code);
        }
        else if (baseResp.errCode == BaseResp.ErrCode.ERR_USER_CANCEL){
            System.out.println("WXEntryActivity: 微信授权失败！用户取消!");
            AppActivity.wechatAuthFailed("微信授权失败！用户取消!");
        }
        else if(baseResp.errCode == BaseResp.ErrCode.ERR_AUTH_DENIED){
            System.out.println("WXEntryActivity: 微信授权失败！用户拒绝!");
            AppActivity.wechatAuthFailed("微信授权失败！用户拒绝!");
        }
        else{
            System.out.println("WXEntryActivity: 微信授权失败！其它错误!");
            AppActivity.wechatAuthFailed("微信授权失败！其它错误!");
        }
        this.finish();
    }
}
