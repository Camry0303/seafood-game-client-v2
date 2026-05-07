import { _decorator, Node, EditBox, Event, Prefab, instantiate } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { MemberManagementItem_Component } from "./MemberManagementItem_Component";
const { ccclass, menu } = _decorator;

@ccclass("MemberManagementUI_Component")
@menu("Hidden/MemberManagementUI_Component")
export class MemberManagementUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _conditionEditbox: EditBox = null;
  private _tableContentNode: Node = null;

  // TODO - 成员列表数据
  private _data: any[] = [];

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 获取条件输入框
    [, this._conditionEditbox] = this.getNodeComponent(
      "MainView/Content/SearchBar/Options/Condition",
      EditBox,
    );

    // 获取表格内容节点
    this._tableContentNode = this.getNode(
      "MainView/Content/TableScrollView/view/content",
    );

    // 设置搜索按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/SearchBar/Options/SearchBtn",
      0,
      "onSearch",
      this.getClassName(),
    );

    // 设置获取全部按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/SearchBar/Options/GetAllBtn",
      0,
      "onGetAll",
      this.getClassName(),
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
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 搜索事件
   * @param event
   */
  private onSearch(event: Event) {
    // TODO - 搜索
    console.log(`onSearch--->`);
  }

  /**
   * 获取全部事件
   * @param event
   */
  private onGetAll(event: Event) {
    // TODO - 获取全部
    console.log(`onGetAll--->`);
  }

  /**
   * 设置数据
   * @param data
   * TODO - 数据类型
   */
  public setData(data: any) {
    this._data = data;
    this._tableContentNode.removeAllChildren();

    const datalist = data.data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/MemberManagementItem",
    );

    // 渲染玩家列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(MemberManagementItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }
}
