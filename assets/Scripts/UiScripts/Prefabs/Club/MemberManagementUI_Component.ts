import { _decorator, Node, EditBox, Event, Prefab, instantiate } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { MemberManagementItem_Component } from "./MemberManagementItem_Component";
import { Gateway } from "../../../Types/typing";
import { GetMemberManagementListParams } from "../../../Types/gateway/requested/club";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
const { ccclass, menu } = _decorator;

@ccclass("MemberManagementUI_Component")
@menu("Hidden/MemberManagementUI_Component")
export class MemberManagementUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _conditionEditbox: EditBox = null;
  private _tableContentNode: Node = null;

  // 成员列表数据
  private _data: Gateway.Returned.Common.Pagenation<
    Gateway.Returned.ClubPlayer.ClubPlayer[]
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
    // 搜索
    console.log(`onSearch--->`);
    let params: GetMemberManagementListParams = {
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

    ClubEvents.getMemberManagementList(params);
  }

  /**
   * 获取全部事件
   * @param event
   */
  private onGetAll(event: Event) {
    // 获取全部
    console.log(`onGetAll--->`);
    this._conditionEditbox.string = "";
    let params: GetMemberManagementListParams = {
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getMemberManagementList(params);
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(
    data: Gateway.Returned.Common.Pagenation<
      Gateway.Returned.ClubPlayer.ClubPlayer[]
    >,
  ) {
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

  /**
   * 更新玩家积分
   * @param player_id
   * @param club_score
   */
  public updateClubPlayerScore(player_id: number, club_score: number) {
    const itemNodes = this._tableContentNode.children;
    for (let i = 0; i < itemNodes.length; i++) {
      const itemNode = itemNodes[i];
      const component = itemNode.getComponent(MemberManagementItem_Component);
      if (component.getData()?.player_id === player_id) {
        component.updateClubScore(club_score);
        break;
      }
    }
  }
}
