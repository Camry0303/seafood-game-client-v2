import {
  _decorator,
  Node,
  EditBox,
  Event,
  Prefab,
  instantiate,
  Label,
  Toggle,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { MemberScoreLogListItem_Component } from "./MemberScoreLogListItem_Component";
import { Gateway } from "../../../Types/typing";
import { GetClubPlayerScoreLogListParams } from "../../../Types/gateway/requested/club";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import Constants from "../../../Common/Constants";
const { ccclass, menu } = _decorator;

@ccclass("MemberScoreLogListUI_Component")
@menu("Hidden/MemberScoreLogListUI_Component")
export class MemberScoreLogListUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _typeComboxLabel: Label = null;
  private _typeComboxItemsNode: Node = null;
  private _typeValue: number = -1;
  private _conditionEditbox: EditBox = null;
  private _tableContentNode: Node = null;

  // 成员列表数据
  private _data: Gateway.Returned.Common.Pagenation<
    Gateway.Returned.ClubPlayer.ClubPlayerScoreLog[]
  > = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 类型Label
    [, this._typeComboxLabel] = this.getNodeComponent(
      "MainView/Content/SearchBar/TypeComboBox/Selected/Label",
      Label,
    );

    // 类型下拉菜单节点
    this._typeComboxItemsNode = this.getNode(
      "MainView/Content/SearchBar/TypeComboBox/Items",
    );

    // 设置类型下拉选项按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/SearchBar/TypeComboBox/Button",
      0,
      "onTypeComboxBtnClick",
      this.getClassName(),
    );

    // 设置类型下拉选项按钮点击事件
    this.setToggleContainerCheckEvent(
      "MainView/Content/SearchBar/TypeComboBox/Items/Content/ScrollView/view/content",
      0,
      "onTypeToggleCheck",
      this.getClassName(),
    );

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
   * 类型下拉选项按钮点击事件
   * @param event
   */
  private onTypeComboxBtnClick(event: Event) {
    const mainContainerNode = this.getNode("MainView/Content");
    const itemsContainerNode = this.getNode(
      "MainView/Content/SearchBar/TypeComboBox",
    );
    // 将下拉菜单移到根节点下，保持世界坐标不变
    const worldPos = this._typeComboxItemsNode.getWorldPosition();
    const currentIsActive = this._typeComboxItemsNode.active;
    if (currentIsActive) {
      this._typeComboxItemsNode.active = false;
      this._typeComboxItemsNode.setParent(itemsContainerNode);
      this._typeComboxItemsNode.setWorldPosition(worldPos);
      // 确保在根节点中也是最后一个子节点
      this._typeComboxItemsNode.setSiblingIndex(
        itemsContainerNode.children.length - 1,
      );
    } else {
      this._typeComboxItemsNode.active = true;
      this._typeComboxItemsNode.setParent(mainContainerNode);
      this._typeComboxItemsNode.setWorldPosition(worldPos);
      // 确保在根节点中也是最后一个子节点
      this._typeComboxItemsNode.setSiblingIndex(
        mainContainerNode.children.length - 1,
      );
    }
  }

  /**
   * 类型选项点击事件
   * @param event
   */
  private onTypeToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const nodeList = toggle.node.parent.children;
    const index = nodeList.indexOf(toggle.node);
    const option = Constants.SCORE_TYPE_OPTIONS.find(
      (item) => item.id === index - 1,
    );
    if (!option) return;
    this._typeComboxLabel.string = option.label;
    const value = option.value;
    this._typeValue = value;
    this.onTypeComboxBtnClick(event);
  }

  /**
   * 搜索事件
   * @param event
   */
  private onSearch(event: Event) {
    let params: GetClubPlayerScoreLogListParams = {
      current: 1,
      pageSize: 1000,
    };

    const nickname_or_id = this._conditionEditbox.string.trim();
    if (nickname_or_id) {
      params = {
        ...params,
        nickname_or_id,
      };
    }
    if (this._typeValue !== -1) {
      params = {
        ...params,
        type: this._typeValue,
      };
    }

    ClubEvents.getClubPlayerScoreLogList(params);
  }

  /**
   * 获取全部事件
   * @param event
   */
  private onGetAll(event: Event) {
    this._typeValue = -1;
    this._conditionEditbox.string = "";
    let params: GetClubPlayerScoreLogListParams = {
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getClubPlayerScoreLogList(params);
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(
    data: Gateway.Returned.Common.Pagenation<
      Gateway.Returned.ClubPlayer.ClubPlayerScoreLog[]
    >,
  ) {
    this._data = data;
    this._tableContentNode.removeAllChildren();

    const datalist = data.data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/MemberScoreLogListItem",
    );

    // 渲染列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(MemberScoreLogListItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }
}
