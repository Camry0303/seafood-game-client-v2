import { _decorator, instantiate, Node, Prefab } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameRobotItem_Component } from "./DicesGameRobotItem_Component";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

/**
 * 机器人列表面板组件
 */
@ccclass("DicesGameRobotUI_Component")
@menu("Hidden/DicesGameRobotUI_Component")
export class DicesGameRobotUI_Component extends ComponentController {
  // 机器人列表容器
  private _robotItemContainer: Node = null;

  // 机器人列表数据
  private _robotDataList: Gateway.Returned.Games.DicesGame.GamePlayerData[] =
    null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取机器人列表容器
    this._robotItemContainer = this.getNode(
      "MainView/Content/TableScrollView/view/content",
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
  public setData(
    data: Gateway.Returned.Games.DicesGame.GamePlayerData[],
  ) {
    this._robotDataList = data;

    // 清空列表项
    this._robotItemContainer.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameRobotItem",
    );

    for (let i = 0; i < data.length; i++) {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameRobotItem_Component);
      node.name = `${data[i].player_id}`;
      this._robotItemContainer.addChild(node);
      component.setData(data[i]);
    }
  }
}
