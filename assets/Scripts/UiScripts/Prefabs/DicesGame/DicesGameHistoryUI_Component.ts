import { _decorator } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameHistoryUI_Component")
@menu("Hidden/DicesGameHistoryUI_Component")
export class DicesGameHistoryUI_Component extends ComponentController {
  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 关闭弹窗
   */
  public close() {
    ComponentManager.Instance.destroyNode(this.node);
  }
}
