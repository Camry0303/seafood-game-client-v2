import { _decorator, instantiate, Node, Prefab } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { Gateway } from "../../../Types/gateway";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameReviewItem_Component } from "./DicesGameReviewItem_Component";

const { ccclass, menu } = _decorator;

@ccclass("DicesGameReviewUI_Component")
@menu("Hidden/DicesGameReviewUI_Component")
export class DicesGameReviewUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  // 表格内容节点
  private _tableContentNode: Node = null;

  // 结算数据
  private _data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement[] = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取表格内容节点
    this._tableContentNode = this.getNode(
      "MainView/Content/TableScrollView/view/content",
    );

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

    // // 设置蒙版关闭按钮点击事件
    // this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
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
   * 设置数据
   * @param data
   */
  public setData(data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement[]) {
    this._data = data;
    this._tableContentNode.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Common/DicesGameReviewItem",
    );

    // 渲染表格内容
    this._data.forEach((item) => {
      const node: Node = instantiate(prefab);
      const component = node.addComponent(DicesGameReviewItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }
}
