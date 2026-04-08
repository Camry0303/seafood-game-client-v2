import { _decorator, sys, Event, Toggle, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { SoundsManager } from "../../../Runtime/SoundsManager";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { AgreementUI_Component } from "./AgreementUI_Component";
import { PhoneLoginUI_Component } from "./PhoneLoginUI_Component";
import SocketManager from "../../../Network/SocketIo/SocketManager";
import WeChatLoginService from "../../../Utils/WeChatLoginService";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("LoginRegisterMainUI_Component")
@menu("Hidden/LoginRegisterMainUI_Component")
export class LoginRegisterMainUI_Component extends ComponentController {
  private _isAgreeToggleNode: Node = null;
  private _isAgreeToggle: Toggle = null;

  start() {
    if (sys.isNative) {
      SoundsManager.Instance.playMusic("bgm_00");
    } else {
      this.scheduleOnce(() => {
        SoundsManager.Instance.playMusic("bgm_00");
      }, 1);
    }

    // 判断是否有token，如果有，尝试自动登录
    const token = ComponentManager.Instance.getDataFromStorage(
      "token",
    ) as string;
    if (token?.trim().length > 0) {
      console.log("有token，尝试自动登录");
      // 连接网关服务器，进行登录
      SocketManager.Instance.connect();
    } else {
      console.log("没有token，请手动登录");
    }
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 设置微信登录按钮点击事件
    this.setButtonClickEvent(
      "ButtonPanel/ButtonBar/WechatLoginBtn",
      0,
      "onLoginWeChatBtnClick",
      this.getClassName(),
    );

    // 设置手机登录按钮点击事件
    this.setButtonClickEvent(
      "ButtonPanel/ButtonBar/PhoneLoginBtn",
      0,
      "onPhoneLoginBtnClick",
      this.getClassName(),
    );

    // 设置协议按钮点击事件
    [this._isAgreeToggleNode, this._isAgreeToggle] = this.setToggleClickEvent(
      "ButtonPanel/Agreement/Toggle",
      0,
      "onAgreementToggleClick",
      this.getClassName(),
    );

    // 设置协议详情按钮点击事件
    this.setButtonClickEvent(
      "ButtonPanel/Agreement/AgreementDetailBtn",
      0,
      "onAgreementDetailBtnClick",
      this.getClassName(),
    );

    // 初始化协议按钮状态
    this.initIsAgree();
  }

  /**
   * 微信登录按钮点击事件
   */
  private onLoginWeChatBtnClick(event: Event) {
    console.log("微信登录按钮点击事件");
    const isAgree = this._isAgreeToggle.isChecked;

    if (!isAgree) {
      console.log("请先认真阅读并同意协议！");
      CommonDailogHandler.showBubbleMessage("请先认真阅读并同意协议！");
      return;
    } else {
      // 调用微信登陆工具
      console.log("微信登陆逻辑");
      WeChatLoginService.Login();
    }
  }

  /**
   * 手机登录按钮点击事件
   */
  private onPhoneLoginBtnClick(event: Event) {
    console.log("手机登录按钮点击事件");
    const isAgree = this._isAgreeToggle.isChecked;

    if (!isAgree) {
      console.log("请先认真阅读并同意协议！");
      CommonDailogHandler.showBubbleMessage("请先认真阅读并同意协议！");
      return;
    } else {
      // 挂载手机登录界面
      ComponentManager.Instance.renderUiNode<PhoneLoginUI_Component>(
        "PhoneLoginUI",
        "Prefabs",
        "LoginRegister/PhoneLoginUI",
        PhoneLoginUI_Component,
        true,
        this.node,
      );
      console.log("打开手机登录界面UI");
    }
  }

  /**
   * 同意协议按钮点击事件
   */
  private onAgreementToggleClick(event: Event) {
    const agree = !this._isAgreeToggle.isChecked;
    // console.log("协议按钮点击事件", agree);
    ComponentManager.Instance.setDataToStorage("isAgree", agree);
  }

  /**
   * 协议详情按钮点击事件
   */
  private onAgreementDetailBtnClick(event: Event) {
    console.log("协议详情按钮点击事件");
    // 挂载协议详情界面
    ComponentManager.Instance.renderUiNode<AgreementUI_Component>(
      "AgreementUI",
      "Prefabs",
      "LoginRegister/AgreementUI",
      AgreementUI_Component,
      true,
      this.node,
    );
  }

  /**
   * 初始化协议按钮状态
   */
  private initIsAgree() {
    let agree = true;
    const agreeString = ComponentManager.Instance.getDataFromStorage("isAgree");
    if (agreeString) {
      agree = JSON.parse(agreeString);
    }
    // 设置协议按钮状态
    this._isAgreeToggle.isChecked = agree;
  }
}
