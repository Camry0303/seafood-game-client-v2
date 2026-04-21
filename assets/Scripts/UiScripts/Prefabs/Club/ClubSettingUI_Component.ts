import { _decorator, ToggleContainer } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
const { ccclass, menu } = _decorator;

@ccclass("ClubSettingUI_Component")
@menu("Hidden/ClubSettingUI_Component")
export class ClubSettingUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _menuToggleContainer: ToggleContainer = null;

  private _currentContent: Node = null;

  private _manageContent: Node = null;
  private _changeNameContent: Node = null;
  private _announcementContent: Node = null;
  private _quiteContent: Node = null;
  private _dissolveContent: Node = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

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
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }
}
