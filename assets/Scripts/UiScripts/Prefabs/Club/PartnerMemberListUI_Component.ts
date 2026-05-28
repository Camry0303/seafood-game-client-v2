import { _decorator, Node, EditBox, Event, Prefab, instantiate } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { Gateway } from "../../../Types/typing";
import { GetPartnerMemberListParams } from "../../../Types/gateway/requested/club";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { PartnerMemberListItem_Component } from "./PartnerMemberListItem_Component";
const { ccclass, menu } = _decorator;

@ccclass("PartnerMemberListUI_Component")
@menu("Hidden/PartnerMemberListUI_Component")
export class PartnerMemberListUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _conditionEditbox: EditBox = null;
  private _tableContentNode: Node = null;

  // 合伙人数据
  private _partnerData: Gateway.Returned.ClubPlayer.ClubPlayer = null;

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

    // 设置添加合伙人成员按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/AddPartnerMemberBtn",
      0,
      "onOpenAddPartnerMember",
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
   * 设置合伙人数据
   * @param data
   */
  public setPartnerData(data: Gateway.Returned.ClubPlayer.ClubPlayer) {
    if (!data) {
      return;
    }
    this._partnerData = data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/PartnerMemberListItem",
    );
    const node = instantiate(prefab);
    const component = node.addComponent(PartnerMemberListItem_Component);
    this._tableContentNode.addChild(node);
    component.setData(data, false);
  }

  /**
   * 搜索事件
   * @param event
   */
  private onSearch(event: Event) {
    if (!this._partnerData) {
      CommonDailogHandler.showBubbleMessage("合伙人数据丢失");
      return;
    }

    let params: GetPartnerMemberListParams = {
      belong_partner_id: this._partnerData.player_id,
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

    ClubEvents.getPartnerMemberList(params);
  }

  /**
   * 获取全部事件
   * @param event
   */
  private onGetAll(event: Event) {
    if (!this._partnerData) {
      CommonDailogHandler.showBubbleMessage("合伙人数据丢失");
      return;
    }
    this._conditionEditbox.string = "";
    let params: GetPartnerMemberListParams = {
      belong_partner_id: this._partnerData.player_id,
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getPartnerMemberList(params);
  }

  /**
   * 打开添加合伙人成员界面
   * @param event
   */
  private onOpenAddPartnerMember(event: Event) {
    if (!this._partnerData) {
      CommonDailogHandler.showBubbleMessage("合伙人数据丢失");
      return;
    }

    CommonDailogHandler.showDialogMiniKeyboard(
      "AddPartnerMemberToggle",
      6,
      (value: string) => {
        // 添加合伙人成员
        const player_id = parseInt(value, 10);
        ClubEvents.addPartnerMember({
          belong_partner_id: this._partnerData.player_id,
          player_id,
        });
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

    const datalist = data.data;
    const nickname_or_id = this._conditionEditbox.string.trim();

    if (!nickname_or_id) {
      datalist.unshift(); // 添加合伙人数据
    }

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/PartnerMemberListItem",
    );

    // 渲染玩家列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(PartnerMemberListItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }

  /**
   * 刷新数据
   */
  public reloadData() {
    if (!this._partnerData) {
      CommonDailogHandler.showBubbleMessage("合伙人数据丢失");
      return;
    }

    this._conditionEditbox.string = "";
    let params: GetPartnerMemberListParams = {
      belong_partner_id: this._partnerData.player_id,
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getPartnerMemberList(params);
  }
}
