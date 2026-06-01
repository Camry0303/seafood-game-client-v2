import { _decorator, Label, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { Gateway } from "../../../Types/gateway";

const { ccclass, menu } = _decorator;

@ccclass("MemberScoreRankListItem_Component")
@menu("Hidden/MemberScoreRankListItem_Component")
export class MemberScoreRankListItem_Component extends ComponentController {
  private _rankLabel: Label = null;

  private _nicknameLabel: Label = null;

  private _idLabel: Label = null;

  private _tdbyLabel: Label = null; // 前天分数标签

  private _ydayLabel: Label = null; // 昨天分数标签

  private _tdayLabel: Label = null; // 今天分数标签

  private _totalScoreLabel: Label = null; // 总分数标签

  private _data: Gateway.Returned.ClubPlayer.ClubPlayerScoreRank = null; // 数据

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 排行
    [, this._rankLabel] = this.getNodeComponent("Rank", Label);

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
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: Gateway.Returned.ClubPlayer.ClubPlayerScoreRank) {
    this._data = data;

    this.setButtonClickEvent(
      "Options/DeleteBtn",
      0,
      "onOpenDeleteConfirm",
      this.getClassName(),
    );
    this.setButtonClickEvent(
      "Options/DetailsBtn",
      0,
      "onOpenDetails",
      this.getClassName(),
    );

    // 设置排名
    this._rankLabel.string = data.rank.toString();

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
}
