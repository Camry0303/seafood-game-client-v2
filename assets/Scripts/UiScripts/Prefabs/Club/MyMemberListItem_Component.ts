import { _decorator, Label, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { Gateway } from "../../../Types/gateway";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { PartnerMemberListUI_Component } from "./PartnerMemberListUI_Component";
const { ccclass, menu } = _decorator;

@ccclass("MyMemberListItem_Component")
@menu("Hidden/MyMemberListItem_Component")
export class MyMemberListItem_Component extends ComponentController {
  private _nicknameLabel: Label = null;

  private _idLabel: Label = null;

  private _tdbyLabel: Label = null; // 前天分数标签

  private _ydayLabel: Label = null; // 昨天分数标签

  private _tdayLabel: Label = null; // 今天分数标签

  private _totalScoreLabel: Label = null; // 总分数标签

  private _optionsNode: Node = null;

  private _data: Gateway.Returned.ClubPlayer.ClubPlayer = null; // 数据

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取昵称标签
    [, this._nicknameLabel] = this.getNodeComponent("Nickname", Label);

    // 获取ID标签
    [, this._idLabel] = this.getNodeComponent("ID", Label);

    // 获取前天分数标签
    [, this._tdbyLabel] = this.getNodeComponent("TdbyScore", Label);

    // 获取昨天分数标签
    [, this._ydayLabel] = this.getNodeComponent("YdayScore", Label);

    // 获取今天分数标签
    [, this._tdayLabel] = this.getNodeComponent("TdayScore", Label);

    // 获取总分数标签
    [, this._totalScoreLabel] = this.getNodeComponent("TotalScore", Label);

    // 获取操作节点
    this._optionsNode = this.getNode("Options");
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: Gateway.Returned.ClubPlayer.ClubPlayer) {
    this._data = data;

    this.setButtonClickEvent(
      "Options/DeleteBtn",
      0,
      "onOpenDeleteConfirm",
      this.getClassName(),
    );

    // 设置昵称
    this._nicknameLabel.string = data.nickname;

    // 设置ID
    this._idLabel.string = data.player_id.toString();

    // 设置前天分数
    this._tdbyLabel.string = data.tdby_settlement_score.toString() || "0";

    // 设置昨天分数
    this._ydayLabel.string = data.yday_settlement_score.toString() || "0";

    // 设置今天分数
    this._tdayLabel.string = data.tday_settlement_score.toString() || "0";

    // 设置总分数
    this._totalScoreLabel.string = data.club_score.toString() || "0";
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._data;
  }

  /**
   * 打开删除确认弹窗
   * @param event
   */
  private onOpenDeleteConfirm(event: Event) {
    CommonDailogHandler.showSmallDialogConfirm(
      "删除合伙人成员",
      this.onDeletePartner.bind(this),
      () => {},
    );
  }

  /**
   * 删除合伙人成员事件
   * @param event
   */
  private onDeletePartner(event: Event) {
    const player_id = this._data.player_id;
    // 删除合伙人
    ClubEvents.deletePartnerMember({ player_id });
  }
}
