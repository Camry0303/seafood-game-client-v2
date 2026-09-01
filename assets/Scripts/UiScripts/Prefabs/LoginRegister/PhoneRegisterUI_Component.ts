import { Logger } from "../../../Utils/Logger";
import { _decorator, Event, EditBox, Button, Label, Sprite } from "cc";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { RESPONE_RESULT } from "../../../Enums";
import HttpApiServices from "../../../Utils/HttpApiServices";
import moment from "moment";
import { Gateway } from "../../../Types/typing";
import SocketManager from "../../../Network/SocketIo/SocketManager";
import CryptoUtils from "../../../Utils/CryptoUtils";
import { PhoneLoginUI_Component } from "./PhoneLoginUI_Component";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../Common/CircleLoadingUI_Component";
import { getSpriteFrameFromBase64 } from "../../../Utils/RemoteSpriteFrameLoader";

const { ccclass, menu } = _decorator;

@ccclass("PhoneRegisterUI_Component")
@menu("Hidden/PhoneRegisterUI_Component")
export class PhoneRegisterUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _phoneNumberEditBox: EditBox = null;

  private _captchaEditBox: EditBox = null;

  private _captchaSprite: Sprite = null;

  private _captchaToken: string = "";

  private _verificationCodeEditBox: EditBox = null;

  private _getCodeBtn: Button = null;

  private _passwordEditBox: EditBox = null;

  private _repeatPasswordEditBox: EditBox = null;

  start() {
    this.getCaptcha();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 手机号码输入框
    [, this._phoneNumberEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/PhoneNumber/Value",
      EditBox,
    );
    this._phoneNumberEditBox.maxLength = 11;
    this._phoneNumberEditBox.inputMode = EditBox.InputMode.PHONE_NUMBER;
    this._phoneNumberEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

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

    // 短信验证码输入框
    [, this._verificationCodeEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/VerificationCode/Value",
      EditBox,
    );
    this._verificationCodeEditBox.maxLength = 4;
    this._verificationCodeEditBox.inputMode = EditBox.InputMode.NUMERIC;
    this._verificationCodeEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

    // 设置获取短信验证码按钮点击事件
    [, this._getCodeBtn] = this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/VerificationCode/GetCodeBtn",
      0,
      "onGetCodeBtnClick",
      this.getClassName(),
    );

    // 登录密码输入框
    [, this._passwordEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Password/Value",
      EditBox,
    );
    this._passwordEditBox.maxLength = 8;
    this._passwordEditBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    this._passwordEditBox.inputFlag = EditBox.InputFlag.PASSWORD;

    // 重复密码输入框
    [, this._repeatPasswordEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/RepeatPassword/Value",
      EditBox,
    );
    this._repeatPasswordEditBox.maxLength = 8;
    this._repeatPasswordEditBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    this._repeatPasswordEditBox.inputFlag = EditBox.InputFlag.PASSWORD;

    // 设置取消按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Options/ButtonPanel/CancelBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置注册按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Options/ButtonPanel/OkBtn",
      0,
      "onRegisterBtnClick",
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

    // 初始化获取短信验证码按钮
    this.initGetCodeBtn();
  }

  /**
   * 验证码图片点击事件
   */
  private onCaptchaClick(event: Event) {
    // 获取验证码图片
    this.getCaptcha();
  }

  /**
   * 获取短信验证码按钮点击事件
   */
  private async onGetCodeBtnClick(event: Event) {
    try {
      Logger.log(`获取短信验证码`);
      const phoneNumber = this._phoneNumberEditBox.string;
      if (phoneNumber.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入手机号！");
        return;
      }

      CommonDailogHandler.showCircleLoading(WAITING_TYPE.SEND_CODE);
      const data = await HttpApiServices.sendSms(phoneNumber, "register");
      if (data.code === RESPONE_RESULT.SUCCESS) {
        CommonDailogHandler.showBubbleMessage("验证码发送成功！");
        // 此处可添加倒计时逻辑
        ComponentManager.Instance.setDataToStorage(
          "lastSendCodeTime",
          moment().unix(),
        );
        this.setCountDown(60);
      } else {
        CommonDailogHandler.showBubbleMessage(`发送失败！${data.msg}`);
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("接口请求错误！");
    } finally {
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SEND_CODE);
    }
  }

  /**
   * 注册按钮点击事件
   */
  private async onRegisterBtnClick(event: Event) {
    try {
      Logger.log(`点击了注册按钮`);
      const phoneNumber = this._phoneNumberEditBox.string;
      const captcha = this._captchaEditBox.string;
      const verificationCode = this._verificationCodeEditBox.string;
      const password = this._passwordEditBox.string;
      const repeatPassword = this._repeatPasswordEditBox.string;

      if (phoneNumber.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入手机号！");
        return;
      }

      if (captcha.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入验证码！");
        return;
      }

      if (verificationCode.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入短信验证码！");
        return;
      }

      if (password.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入密码！");
        return;
      }

      if (repeatPassword.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请再次输入密码！");
        return;
      }

      if (password !== repeatPassword) {
        CommonDailogHandler.showBubbleMessage("两次输入的密码不一致！");
        return;
      }

      // 调用手机注册接口
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.REGIST_PHONE);
      const params: Gateway.Requested.Authorization.PhoneRegisterParams = {
        phone_number: phoneNumber,
        captcha: captcha,
        captcha_token: this._captchaToken,
        code: verificationCode,
        password: CryptoUtils.desEncryptPassword(password),
        time: moment().unix(),
        sign: "",
      };
      const result = await HttpApiServices.registerByPhone(params);
      if (result.code === RESPONE_RESULT.SUCCESS) {
        CommonDailogHandler.showBubbleMessage("注册成功！");
        // 注册成功，拿到token，保存到本地，并且登录网关服务器建立长连接
        ComponentManager.Instance.setDataToStorage("token", result.data.token);
        // 关闭手机登录界面并销毁
        const [phoneLoginUiNode, phoneLoginUiComponent] =
          ComponentManager.Instance.getNodeComponent(
            "PhoneLoginUI",
            PhoneLoginUI_Component,
          );
        phoneLoginUiComponent?.close();

        // 关闭手机注册界面并销毁
        this.close();

        CommonDailogHandler.hideCircleLoading(WAITING_TYPE.REGIST_PHONE);

        // 连接网关服务器，进行登录
        SocketManager.Instance.connect();
      } else {
        CommonDailogHandler.showBubbleMessage(`注册失败！${result.msg}`);
        CommonDailogHandler.hideCircleLoading(WAITING_TYPE.REGIST_PHONE);
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("接口请求错误！");
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.REGIST_PHONE);
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
    Logger.log("获取验证码图片");
    try {
      const result = await HttpApiServices.getCaptcha();
      if (result.code === RESPONE_RESULT.SUCCESS) {
        this._captchaToken = result.data.captcha_token;
        const spriteFrame = await getSpriteFrameFromBase64(
          result.data.captcha_image,
        );
        spriteFrame && (this._captchaSprite.spriteFrame = spriteFrame);
      } else {
        CommonDailogHandler.showBubbleMessage(
          `获取验证码图片失败！${result.msg}`,
        );
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage(
        `获取验证码图片失败！${error?.response?.data?.msg || error.message || "未知错误!"}`,
      );
    }
  }

  /**
   * 按钮倒计时
   * @param repeat
   */
  private setCountDown(repeat: number) {
    Logger.log(`按钮开始倒计时逻辑`);

    const btnSprite = this._getCodeBtn.node.getComponent(Sprite);
    const labelNode = this._getCodeBtn.node.getChildByName("Label");
    const label = labelNode ? labelNode.getComponent(Label) : null;

    btnSprite && (btnSprite.enabled = false);
    this._getCodeBtn.interactable = false;
    this._getCodeBtn.unscheduleAllCallbacks();
    const timerStart = moment().unix();
    this._getCodeBtn.schedule(
      () => {
        let timeLeft = Math.ceil(repeat - (moment().unix() - timerStart));
        label && (label.string = String(timeLeft));

        if (timeLeft <= 0) {
          btnSprite && (btnSprite.enabled = true);
          this._getCodeBtn.interactable = true;
          label && (label.string = "");
          ComponentManager.Instance.deleteDataFromStorage("lastSendCodeTime");
        }
      },
      1,
      repeat - 1,
      0,
    );
  }

  /**
   * 初始化发送短信验证码按钮
   * @returns
   */
  private initGetCodeBtn() {
    // 初始化是否按钮倒计时
    const lastSendCodeTime =
      ComponentManager.Instance.getDataFromStorage("lastSendCodeTime");
    if (!lastSendCodeTime) {
      return;
    }
    const now = moment().unix();
    const repeat = 60 - (now - lastSendCodeTime);

    if (repeat > 0) {
      this.setCountDown(repeat);
    } else {
      ComponentManager.Instance.deleteDataFromStorage("lastSendCodeTime");
    }
  }
}
