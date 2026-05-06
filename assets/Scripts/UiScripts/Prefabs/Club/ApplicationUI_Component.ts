import { _decorator, instantiate, Node, Prefab } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import { Pagenation } from "../../../Types/gateway/returned/common";
import { Gateway } from "../../../Types/gateway";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { ApplicationItem_Component } from "./ApplicationItem_Component";
const { ccclass, menu } = _decorator;

@ccclass("ApplicationUI_Component")
@menu("Hidden/ApplicationUI_Component")
export class ApplicationUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _tableContentNode: Node = null;

  private _data: Pagenation<
    Gateway.Returned.ClubPlayerApplication.ClubPlayerApplication[]
  > = null;

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
    this._data = data;
    this._tableContentNode.removeAllChildren();

    const datalist = data.data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/ApplicationItem",
    );

    // 渲染申请列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(ApplicationItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }

  /**
   * 设置已审核
   */
  public setReviewed(): number {
    const nodes = this._tableContentNode.children;
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      const component = node.getComponent(ApplicationItem_Component);
      if (component.isWaitingResult) {
        const club_id = component.setReviewed();
        return club_id;
      }
    }
  }
}
