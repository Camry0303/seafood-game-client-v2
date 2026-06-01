import {
  _decorator,
  Node,
  EditBox,
  Event,
  Prefab,
  instantiate,
  Label,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { Gateway } from "../../../Types/typing";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GetMyMemberListParams } from "../../../Types/gateway/requested/clubPlayer";
import { MyMemberListItem_Component } from "./MyMemberListItem_Component";
const { ccclass, menu } = _decorator;

@ccclass("MyMemberListUI_Component")
@menu("Hidden/MyMemberListUI_Component")
export class MyMemberListUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _conditionEditbox: EditBox = null;
  private _tableContentNode: Node = null;
  private _countLabel: Label = null;

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

    // 设置添加合伙人按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/InviteBtn",
      0,
      "onInviteMember",
      this.getClassName(),
    );

    // 获取成员数量标签
    [, this._countLabel] = this.getNodeComponent(
      "MainView/Content/Count",
      Label,
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
    let params: GetMyMemberListParams = {
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

    ClubEvents.getMyMemberList(params);
  }

  /**
   * 获取全部事件
   * @param event
   */
  private onGetAll(event: Event) {
    this._conditionEditbox.string = "";
    let params: GetMyMemberListParams = {
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getMyMemberList(params);
  }

  /**
   * 打开邀请玩家界面
   * @param event
   */
  private onInviteMember(event: Event) {
    CommonDailogHandler.showDialogMiniKeyboard(
      "InvitePlayerToggle",
      6,
      (value: string) => {
        // 邀请玩家
        const player_id = parseInt(value, 10);
        ClubEvents.invitePlayerToClub(player_id);
      },
    );
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
    this._countLabel.string = `当前拥有成员：${data.total}`;

    const datalist = data.data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/MyMemberListItem",
    );

    // 渲染玩家列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(MyMemberListItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }

  /**
   * 刷新数据
   */
  public reloadData() {
    this._conditionEditbox.string = "";
    let params: GetMyMemberListParams = {
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getMyMemberList(params);
  }
}
