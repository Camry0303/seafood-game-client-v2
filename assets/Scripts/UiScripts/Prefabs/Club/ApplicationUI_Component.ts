import { _decorator, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import { Pagenation } from "../../../Types/gateway/returned/common";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

@ccclass("ApplicationUI_Component")
@menu("Hidden/ApplicationUI_Component")
export class ApplicationUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _tableContentNode: Node = null;

  start() {
    // ClubEvents.
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 获取表格内容节点
    this._tableContentNode = this.getNode(
      "MainView/Content/ScrollView/view/content",
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

    this._tableContentNode.removeAllChildren();
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
   * 渲染未审核的申请列表
   * @param data
   */
  public renderUnreviewedApplicationList(
    data: Pagenation<
      Gateway.Returned.ClubPlayerApplication.ClubPlayerApplication[]
    >,
  ) {
    this._tableContentNode.removeAllChildren();

    // TODO - 渲染申请列表
  }
}
