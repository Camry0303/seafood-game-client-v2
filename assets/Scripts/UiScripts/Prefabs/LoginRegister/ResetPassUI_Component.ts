import { _decorator, Button, EditBox, Event, Label } from "cc";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ComponentController } from "../../../Common/ComponentController";
import HttpApiServices from "../../../Utils/HttpApiServices";
import moment from "moment";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { WAITING_TYPE } from "../Common/CircleLoadingUI_Component";
import { RESPONE_RESULT } from "../../../Enums";
const { ccclass, menu } = _decorator;

@ccclass("ResetPassUI_Component")
@menu("Hidden/ResetPassUI_Component")
export class ResetPassUI_Component extends ComponentController {
  public bubbleWindow: BubbleWindow = null;

  private _phoneNumberEditBox: EditBox = null;

  private _passwordEditBox: EditBox = null;

  private _repeatPasswordEditBox: EditBox = null;

  private _verificationCodeEditBox: EditBox = null;

  private _sendCodeBtn: Button = null;
  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this.bubbleWindow = this.node.addComponent(BubbleWindow);

    // 手机号码输入框
    [, this._phoneNumberEditBox] = this.getNodeComponent(
      "MainView/Content/Form/PhoneNumber/EditBox",
      EditBox,
    );
    this._phoneNumberEditBox.maxLength = 11;
    this._phoneNumberEditBox.inputMode = EditBox.InputMode.PHONE_NUMBER;
    this._phoneNumberEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

    // 登录密码输入框
    [, this._passwordEditBox] = this.getNodeComponent(
      "MainView/Content/Form/Password/EditBox",
      EditBox,
    );
    this._passwordEditBox.maxLength = 8;
    this._passwordEditBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    this._passwordEditBox.inputFlag = EditBox.InputFlag.PASSWORD;

    // 重复密码输入框
    [, this._repeatPasswordEditBox] = this.getNodeComponent(
      "MainView/Content/Form/RepeatPassword/EditBox",
      EditBox,
    );
    this._repeatPasswordEditBox.maxLength = 8;
    this._repeatPasswordEditBox.inputMode = EditBox.InputMode.SINGLE_LINE;
    this._repeatPasswordEditBox.inputFlag = EditBox.InputFlag.PASSWORD;

    // 验证码输入框
    [, this._verificationCodeEditBox] = this.getNodeComponent(
      "MainView/Content/Form/VerificationCode/EditBox",
      EditBox,
    );
    this._verificationCodeEditBox.maxLength = 4;
    this._verificationCodeEditBox.inputMode = EditBox.InputMode.NUMERIC;
    this._verificationCodeEditBox.inputFlag = EditBox.InputFlag.DEFAULT;

    // 设置发送短信按钮点击事件
    [, this._sendCodeBtn] = this.setButtonClickEvent(
      "MainView/Content/Form/VerificationCode/SendCodeBtn",
      0,
      "onSendCodeBtnClick",
      this.getClassName(),
    );

    // 设置重置密码按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/Form/ButtonPanel/ResetBtn",
      0,
      "onResetBtnClick",
      this.getClassName(),
    );

    // 设置返回按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/Form/ButtonPanel/BackBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());

    // 初始化发送按钮
    this.initSendBtn();
  }

  /**
   * 发送验证码按钮点击事件
   */
  private async onSendCodeBtnClick(event: Event) {
    try {
      console.log(`发送验证码`);
      const phoneNumber = this._phoneNumberEditBox.string;
      if (phoneNumber.trim() === "") {
        CommonDailogHandler.showBubbleMessage("请输入手机号！");
        return;
      }

      CommonDailogHandler.showCircleLoading(WAITING_TYPE.SEND_CODE);
      const data = await HttpApiServices.sendSms(phoneNumber, "reset");
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
   * 确定重置按钮点击事件
   */
  private onResetBtnClick(event: Event) {
    console.log(`点击了重置确定按钮`);
    const phoneNumber = this._phoneNumberEditBox.string;
    const password = this._passwordEditBox.string;
    const repeatPassword = this._repeatPasswordEditBox.string;
    const _verificationCodeEditBox = this._verificationCodeEditBox.string;
    if (phoneNumber.trim() === "") {
      CommonDailogHandler.showBubbleMessage("请输入手机号！");
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

    if (_verificationCodeEditBox.trim() === "") {
      CommonDailogHandler.showBubbleMessage("请输入验证码！");
      return;
    }

    // TODO - 调用重置密码接口
    console.log(`处理重置密码逻辑！`);
  }
  /**
   * 关闭弹窗
   */
  public close() {
    this.bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 按钮倒计时
   * @param repeat
   */
  private setCountDown(repeat: number) {
    console.log(`按钮开始倒计时逻辑`);

    this._sendCodeBtn.interactable = false;
    this._sendCodeBtn.unscheduleAllCallbacks();
    const timerStart = moment().unix();
    this._sendCodeBtn.schedule(
      () => {
        let timeLeft = Math.ceil(repeat - (moment().unix() - timerStart));
        this._sendCodeBtn.node
          .getChildByName("Label")
          .getComponent(Label).string = String(timeLeft);
        if (timeLeft <= 0) {
          this._sendCodeBtn.interactable = true;
          this._sendCodeBtn.node
            .getChildByName("Label")
            .getComponent(Label).string = "发送";
          ComponentManager.Instance.deleteDataFromStorage("lastSendCodeTime");
        }
      },
      1,
      repeat - 1,
      0,
    );
  }

  /**
   * 初始化发送验证码按钮
   * @returns
   */
  private initSendBtn() {
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
