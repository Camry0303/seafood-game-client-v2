import { _decorator, Label } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
const { ccclass, menu } = _decorator;

@ccclass("DialogMessageUI_Component")
@menu("Hidden/DialogMessageUI_Component")
export class DialogMessageUI_Component extends ComponentController {
  public bubbleWindow: BubbleWindow = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this.bubbleWindow = this.node.addComponent(BubbleWindow);

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
   * 关闭弹窗
   */
  public close() {
    this.bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 设置消息
   * @param message
   * @param callback
   */
  public setMessage(message: string, callback?: Function) {
    const [messageNode, messageLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MessageLabel",
      Label,
    );
    messageLabel.string = message;
  }
}
