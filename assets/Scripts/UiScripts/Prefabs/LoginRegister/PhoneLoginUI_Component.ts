import { __private, _decorator, Event, EditBox, Button, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { Gateway } from "../../../Types/typing";
import moment from "moment";
import HttpApiServices from "../../../Utils/HttpApiServices";
import { RESPONE_RESULT } from "../../../Enums";
import CryptoUtils from "../../../Utils/CryptoUtils";
import SocketManager from "../../../Network/SocketIo/SocketManager";
import { ResetPassUI_Component } from "./ResetPassUI_Component";
import { PhoneRegisterUI_Component } from "./PhoneRegisterUI_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../Common/CircleLoadingUI_Component";
import { getSpriteFrameFromBase64 } from "../../../Utils/RemoteSpriteFrameLoader";
const { ccclass, menu } = _decorator;

@ccclass("PhoneLoginUI_Component")
@menu("Hidden/PhoneLoginUI_Component")
export class PhoneLoginUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _phoneNumberEditBox: EditBox = null;

  private _passwordEditBox: EditBox = null;

  private _captchaEditBox: EditBox = null;

  private _captchaSprite: Sprite = null;

  private _captchaToken: string = "";

  start() {
    this.getCaptcha();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node.addComponent(BubbleWindow);

    // 手机号码输入框
    [, this._phoneNumberEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/PhoneNumber/Value",
      EditBox,
    );
    this._phoneNumberEditBox.maxLength = 11;
    this._phoneNumberEditBox.inputMode = EditBox.InputMode.PHONE_NUMBER;
    this._phoneNumberEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

    // 登录密码输入框
    [, this._passwordEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Password/Value",
      EditBox,
    );
    this._passwordEditBox.maxLength = 8;
    this._passwordEditBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    this._passwordEditBox.inputFlag = EditBox.InputFlag.PASSWORD;

    // 验证码输入框
    [, this._captchaEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/CaptchaCode/Value",
      EditBox,
    );
    this._captchaEditBox.maxLength = 4;
    this._captchaEditBox.inputMode = EditBox.InputMode.NUMERIC;
    this._captchaEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

    // 验证码图片精灵
    [, this._captchaSprite] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/CaptchaCode/Captcha",
      Sprite,
    );

    // 设置验证码图片点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/CaptchaCode/Captcha",
      0,
      "onCaptchaClick",
      this.getClassName(),
    );

    // 设置注册账号按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Other/LinkButtonPanel/ToRegisterBtn",
      0,
      "onToRegisterBtnClick",
      this.getClassName(),
    );

    // 设置忘记密码按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Other/LinkButtonPanel/ToResetPasswordBtn",
      0,
      "onToResetPasswordBtnClick",
      this.getClassName(),
    );

    // 设置取消按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Options/ButtonPanel/CancelBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置登录按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Options/ButtonPanel/OkBtn",
      0,
      "onLoginBtnClick",
      this.getClassName(),
    );

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 验证码图片点击事件
   */
  private onCaptchaClick(event: Event) {
    // 获取验证码图片
    this.getCaptcha();
  }

  /**
   * 注册账号按钮点击事件
   */
  private onToRegisterBtnClick(event: Event) {
    console.log("打开注册界面UI");
    // // 挂载注册界面
    // ComponentManager.Instance.renderUiNode<PhoneRegisterUI_Component>(
    //   "PhoneRegisterUI",
    //   "Prefabs",
    //   "LoginRegister/PhoneRegisterUI",
    //   PhoneRegisterUI_Component,
    //   true,
    //   this.node,
    // );
  }

  /**
   * 忘记密码按钮点击事件
   */
  private onToResetPasswordBtnClick(event: Event) {
    console.log("打开忘记密码界面UI");
    // // 挂载忘记密码界面
    // ComponentManager.Instance.renderUiNode<ResetPassUI_Component>(
    //   "ResetPassUI",
    //   "Prefabs",
    //   "LoginRegister/ResetPassUI",
    //   ResetPassUI_Component,
    //   true,
    //   this.node,
    // );
  }

  /**
   * 登录按钮点击事件
   */
  private async onLoginBtnClick(event: Event) {
    try {
      console.log("点击了登录按钮");
      const phoneNumber = this._phoneNumberEditBox.string;
      const password = this._passwordEditBox.string;

      if (phoneNumber.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入手机号！");
        return;
      }

      if (password.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入密码！");
        return;
      }

      if (this._captchaEditBox.string.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入验证码！");
        return;
      }

      // 调用登录接口
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.PHONE_AUTH);
      const params: Gateway.Requested.Authorization.PhoneLoginParams = {
        phone_number: phoneNumber,
        password: CryptoUtils.desEncryptPassword(password),
        captcha: this._captchaEditBox.string,
        captcha_token: this._captchaToken,
        time: moment().unix(),
        sign: "",
      };
      const result = await HttpApiServices.loginByPhone(params);
      if (result.code === RESPONE_RESULT.SUCCESS) {
        // 登录成功，拿到token，保存到本地，并且登录网关服务器建立长连接
        ComponentManager.Instance.setDataToStorage("token", result.data.token);
        this.close();
        // 连接网关服务器，进行登录
        SocketManager.Instance.connect();
      } else {
        CommonDailogHandler.showBubbleMessage(`登录失败！${result.msg}`);
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("接口请求错误！");
    } finally {
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.PHONE_AUTH);
    }
  }

  /**
   * 关闭弹窗
   */
  public close() {
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 获取验证码图片
   */
  private async getCaptcha() {
    // 获取验证码图片逻辑
    console.log("获取验证码图片");
    try {
      const result = await HttpApiServices.getCaptcha();
      if (result.code === RESPONE_RESULT.SUCCESS) {
        this._captchaToken = result.data.captcha_token;
        const spriteFrame = await getSpriteFrameFromBase64(
          `data:image/png;base64,${result.data.captcha_image}`,
        );
        spriteFrame && (this._captchaSprite.spriteFrame = spriteFrame);
      } else {
        CommonDailogHandler.showBubbleMessage(
          `获取验证码图片失败！${result.msg}`,
        );
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("获取验证码图片失败！");
    }
  }
}
