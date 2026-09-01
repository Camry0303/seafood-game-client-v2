import { Logger } from "../../../Utils/Logger";
import {
  _decorator,
  Button,
  EditBox,
  Event,
  instantiate,
  Label,
  Node,
  Prefab,
  Sprite,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import { Gateway } from "../../../Types/gateway";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { MemberListItem_Component } from "./MemberListItem_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GetMemberListParams } from "../../../Types/gateway/requested/clubPlayer";
const { ccclass, menu } = _decorator;

@ccclass("MemberListUI_Component")
@menu("Hidden/MemberListUI_Component")
export class MemberListUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _countLabel: Label = null;
  private _conditionEditbox: EditBox = null;
  private _tableContentNode: Node = null;
  private _deleteMemberBtn: Button = null;

  private _checkedMemberNode: Node = null;

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

    // 获取计数标签
    [, this._countLabel] = this.getNodeComponent(
      "MainView/Content/SearchBar/Count/Value",
      Label,
    );

    // 获取条件输入框
    [, this._conditionEditbox] = this.getNodeComponent(
      "MainView/Content/SearchBar/Options/Condition",
      EditBox,
    );

    // 获取表格内容节点
    this._tableContentNode = this.getNode(
      "MainView/Content/ScrollView/view/content",
    );

    // 设置搜索按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/SearchBar/Options/SearchBtn",
      0,
      "onSearch",
      this.getClassName(),
    );

    // 获取删除成员按钮
    [, this._deleteMemberBtn] = this.getNodeComponent(
      "MainView/Content/BottomBar/DeleteMemberBtn",
      Button,
    );
    // 删除成员按钮权限
    this._deleteMemberBtn.interactable =
      GlobalData.Instance.getCurrentClubPlayerInfo().role <= 1;
    this._deleteMemberBtn.getComponent(Sprite).grayscale =
      !this._deleteMemberBtn.interactable;
    if (this._deleteMemberBtn.interactable) {
      // 设置删除成员按钮点击事件
      this.setButtonClickEvent(
        "MainView/Content/BottomBar/DeleteMemberBtn",
        0,
        "onOpenDemoteOrDeleteConfirm",
        this.getClassName(),
      );
    }

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
    let params: GetMemberListParams = {
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

    ClubEvents.getMemberList(params);
  }

  /**
   * 获取全部事件
   * @param event
   */
  private onGetAll(event: Event) {
    this._conditionEditbox.string = "";
    let params: GetMemberListParams = {
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getMemberList(params);
  }

  private onOpenDemoteOrDeleteConfirm(event: Event) {
    if (this._checkedMemberNode) {
      CommonDailogHandler.showSmallDialogConfirm(
        "删除成员",
        this.onDemoteOrDeleteMember.bind(this),
        () => {},
      );
    } else {
      return;
    }
  }

  /**
   * 降职或删除成员事件
   * @param event
   * @returns
   */
  private onDemoteOrDeleteMember(event: Event) {
    Logger.log(`onDemoteOrDeleteMember--->`);
    if (this._checkedMemberNode) {
      const player_id = this._checkedMemberNode
        .getComponent(MemberListItem_Component)
        .getData()?.player_id;
      ClubEvents.demoteOrDeleteMember({ player_id });
    } else {
      return;
    }
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
    this._checkedMemberNode = null;
    this._tableContentNode.removeAllChildren();
    this._countLabel.string = `${data.total}/5000`;

    const datalist = data.data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/MemberListItem",
    );

    // 渲染玩家列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(MemberListItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item, this);
    });
  }

  /**
   * 设置选中成员节点
   * @param node
   */
  public setCheckedMemberNode(node: Node) {
    if (this._checkedMemberNode) {
      this._checkedMemberNode
        .getComponent(MemberListItem_Component)
        .setChecked(false);
    }
    this._checkedMemberNode = node;
    this._checkedMemberNode
      .getComponent(MemberListItem_Component)
      .setChecked(true);
  }

  /**
   * 处理降职或删除成员结果
   * @param player_id
   * @param type
   */
  public onDemoteOrDeleteMemberResult(
    player_id: number,
    type: "demote" | "delete",
  ) {
    if (type === "demote") {
      this._checkedMemberNode
        .getComponent(MemberListItem_Component)
        .onDemoteResult(player_id);
      this._checkedMemberNode
        .getComponent(MemberListItem_Component)
        .setChecked(false);
      this._checkedMemberNode = null;
    } else {
      this._tableContentNode.removeChild(this._checkedMemberNode);
      this._checkedMemberNode = null;
    }
  }
}
