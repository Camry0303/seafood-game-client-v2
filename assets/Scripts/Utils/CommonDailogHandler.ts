import { Node } from "cc";
import { ComponentManager } from "../Runtime/ComponentManager";
import { UI } from "../Types/ui";
import { BubbleMessageUI_Component } from "../UiScripts/Prefabs/Common/BubbleMessageUI_Component";
import {
  CircleLoadingUI_Component,
  WAITING_TYPE,
} from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import { DialogConfirmUI_Component } from "../UiScripts/Prefabs/Dialog/DialogConfirmUI_Component";
import { DialogInputUI_Component } from "../UiScripts/Prefabs/Dialog/DialogInputUI_Component";
import { DialogMessageUI_Component } from "../UiScripts/Prefabs/Dialog/DialogMessageUI_Component";
import { DialogMiniKeyboardUI_Component } from "../UiScripts/Prefabs/Dialog/DialogMiniKeyboardUI_Component";
import { DialogMsgCallbackUI_Component } from "../UiScripts/Prefabs/Dialog/DialogMsgCallbackUI_Component";

/**
 *
 */
export default class CommonDailogHandler {
  /**
   * 显示气泡消息
   * @param message
   */
  public static showBubbleMessage(message: string, callback?: Function) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<BubbleMessageUI_Component>(
        "BubbleMessageUI",
        "Prefabs",
        "Common/BubbleMessageUI",
        BubbleMessageUI_Component,
      );
    // 播放气泡弹窗动效
    uiComponent.playBubbleMessageUI(message, callback);
  }

  /**
   * 显示加载动画
   * @param callback
   */
  public static showCircleLoading(waiting: WAITING_TYPE, callback?: Function) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<CircleLoadingUI_Component>(
        "CircleLoadingUI",
        "Prefabs",
        "Common/CircleLoadingUI",
        CircleLoadingUI_Component,
      );
    uiComponent.show(waiting, callback);
  }

  /**
   * 隐藏加载动画
   * @param callback
   */
  public static hideCircleLoading(waiting: WAITING_TYPE, callback?: Function) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<CircleLoadingUI_Component>(
        "CircleLoadingUI",
        "Prefabs",
        "Common/CircleLoadingUI",
        CircleLoadingUI_Component,
      );
    uiComponent.hide(waiting, callback);
  }

  /**
   * 显示对话框消息
   * @param message
   * @param callback
   */
  public static showDialogMessage(message: string, callback?: Function) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<DialogMessageUI_Component>(
        "DialogMessageUI",
        "Prefabs",
        "Dialog/DialogMessageUI",
        DialogMessageUI_Component,
      );
    uiComponent.setMessage(message, callback);
  }

  /**
   * 显示有回调的对话框消息
   * @param message
   * @param callback
   */
  public static showDialogMsgCallback(
    props: UI.MsgCallbackProperty,
    callback: Function,
  ) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<DialogMsgCallbackUI_Component>(
        "DialogMsgCallbackUI",
        "Prefabs",
        "Dialog/DialogMsgCallbackUI",
        DialogMsgCallbackUI_Component,
      );
    uiComponent.setMessage(props, callback);
  }

  /**
   * 显示输入对话框
   * @param props
   * @param callback
   */
  public static showDialogInput(props: UI.InputProperty, callback?: Function) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<DialogInputUI_Component>(
        "DialogInputUI",
        "Prefabs",
        "Dialog/DialogInputUI",
        DialogInputUI_Component,
      );
    uiComponent.setInputProperty(props, callback);
  }

  /**
   * 显示确认对话框
   * @param message
   * @param confirmCallback
   * @param cancelCallback
   */
  public static showDialogConfirm(
    message: string,
    confirmCallback: Function,
    cancelCallback: Function,
  ) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<DialogConfirmUI_Component>(
        "DialogConfirmUI",
        "Prefabs",
        "Dialog/DialogConfirmUI",
        DialogConfirmUI_Component,
      );
    uiComponent.setDialogConfirm(message, confirmCallback, cancelCallback);
  }

  /**
   * 显示小键盘对话框
   * @param numDigits
   * @param callback
   * @param parentNode
   */
  public static showDialogMiniKeyboard(
    numDigits: 2 | 4 | 6,
    callback: Function,
    parentNode?: Node,
  ) {
    const [, uiComponent] =
      ComponentManager.Instance.renderUiNode<DialogMiniKeyboardUI_Component>(
        "DialogMiniKeyboardUI",
        "Prefabs",
        "Dialog/DialogMiniKeyboardUI",
        DialogMiniKeyboardUI_Component,
        true,
        parentNode ? parentNode : null,
      );
    uiComponent.setDialogMiniKeyboard(
      "InvitePlayerToggle",
      numDigits,
      callback,
    );
  }
}
