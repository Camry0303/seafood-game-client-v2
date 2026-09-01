import { Logger } from "../../../Utils/Logger";
import { _decorator, Button, EditBox, Label, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../Common/CircleLoadingUI_Component";
import HttpApiServices from "../../../Utils/HttpApiServices";
import { RESPONE_RESULT } from "../../../Enums";
import moment from "moment";
import { Gateway } from "../../../Types/typing";
import CryptoUtils from "../../../Utils/CryptoUtils";
import { GlobalData } from "../../../Runtime/GlobalData";
const { ccclass, menu } = _decorator;

@ccclass("BindPhoneUI_Component")
@menu("Hidden/BindPhoneUI_Component")
export class BindPhoneUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _phoneNumberEditBox: EditBox = null;

  private _verificationCodeEditBox: EditBox = null;

  private _getCodeBtn: Button = null;

  private _passwordEditBox: EditBox = null;

  start() {}

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

    // 设置取消按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Options/ButtonPanel/CancelBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置绑定按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Options/ButtonPanel/OkBtn",
      0,
      "onBindBtnClick",
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
      const data = await HttpApiServices.sendSms(phoneNumber, "bind");
      if (data.code === RESPONE_RESULT.SUCCESS) {
        CommonDailogHandler.showBubbleMessage("短信验证码发送成功！");
        // 此处可添加倒计时逻辑
        ComponentManager.Instance.setDataToStorage(
          "lastSendCodeTime",
          moment().unix(),
        );
        this.setCountDown(60);
      } else {
        CommonDailogHandler.showBubbleMessage(`发送失败！${data.msg}`);
        CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SEND_CODE);
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("接口请求错误！");
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SEND_CODE);
    } finally {
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.SEND_CODE);
    }
  }

  /**
   * 绑定按钮点击事件
   * @param event
   */
  private async onBindBtnClick(event: Event) {
    try {
      Logger.log(`点击了绑定按钮`);
      const phoneNumber = this._phoneNumberEditBox.string;
      const verificationCode = this._verificationCodeEditBox.string;
      const password = this._passwordEditBox.string;
      if (phoneNumber.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入手机号！");
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

      // 调用绑定接口
      CommonDailogHandler.showCircleLoading(WAITING_TYPE.BINDING_PHONE);
      const params: Gateway.Requested.Authorization.BindPhoneParams = {
        id: GlobalData.Instance.getCurrentPlayerInfo()?.id,
        phone_number: phoneNumber,
        code: verificationCode,
        password: CryptoUtils.desEncryptPassword(password),
        time: moment().unix(),
        sign: "",
      };
      const result = await HttpApiServices.bindPhone(params);
      if (result.code === RESPONE_RESULT.SUCCESS) {
        CommonDailogHandler.showBubbleMessage("绑定手机成功！");
        // 关闭绑定手机界面并销毁
        this.close();
      } else {
        CommonDailogHandler.showBubbleMessage(`绑定手机失败！${result.msg}`);
        CommonDailogHandler.hideCircleLoading(WAITING_TYPE.BINDING_PHONE);
      }
    } catch (error) {
      CommonDailogHandler.showBubbleMessage("接口请求错误！" + error);
      CommonDailogHandler.hideCircleLoading(WAITING_TYPE.BINDING_PHONE);
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
