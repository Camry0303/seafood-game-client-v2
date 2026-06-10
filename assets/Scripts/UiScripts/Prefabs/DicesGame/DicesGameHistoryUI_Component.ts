import { _decorator, instantiate, Node, Prefab, SpriteAtlas } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameHistoryItem_Component } from "./DicesGameHistoryItem_Component";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameHistoryUI_Component")
@menu("Hidden/DicesGameHistoryUI_Component")
export class DicesGameHistoryUI_Component extends ComponentController {
  // 结果数据列表容器
  private _contentNode: Node = null;

  // 结果数据
  private _resultData: any = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._contentNode = this.getNode(
      "MainView/Content/ScrollView/view/content",
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 关闭弹窗
   */
  public close() {
    ComponentManager.Instance.destroyNode(this.node);
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: any) {
    this._resultData = data;

    this._contentNode.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameHistoryItem",
    );

    for (let i = 0; i < data.length; i++) {
      const item = instantiate(prefab);
      const component = item.addComponent(DicesGameHistoryItem_Component);
      this._contentNode.addChild(item);
      component.setData(item);
    }
  }
}
