import { _decorator, Label, Node, Sprite } from "cc";
import { Logger } from "../../../Utils/Logger";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { CLUB_PLAYER_ROLE } from "../../../Enums";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
const { ccclass, menu } = _decorator;

@ccclass("MemberManagementItem_Component")
@menu("Hidden/MemberManagementItem_Component")
export class MemberManagementItem_Component extends ComponentController {
  private _roleAdminMarkNode: Node = null; // 管理员标记
  private _roleSubAdminMarkNode: Node = null; // 副管理员标记
  private _rolePartnerMarkNode: Node = null; // 合伙人标记

  private _avatarSprite: Sprite = null;

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

    // 获取管理员标记
    this._roleAdminMarkNode = this.getNode("Avatar/RoleAdmin");
    // 获取副管理员标记
    this._roleSubAdminMarkNode = this.getNode("Avatar/RoleSubAdmin");
    // 获取合伙人标记
    this._rolePartnerMarkNode = this.getNode("Avatar/RolePartner");

    // 获取头像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Avatar/Mask/AvatarSprite",
      Sprite,
    );

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

    // 根据玩家角色显示不同的标记
    this._roleAdminMarkNode.active = data.role === CLUB_PLAYER_ROLE.ADMIN;
    this._roleSubAdminMarkNode.active =
      data.role === CLUB_PLAYER_ROLE.SUB_ADMIN;
    this._rolePartnerMarkNode.active = data.role === CLUB_PLAYER_ROLE.PARTNER;

    // 根据玩家角色显示不同的操作按钮
    this._optionsNode.active = data.role >= CLUB_PLAYER_ROLE.PARTNER;
    if (this._optionsNode.active) {
      this.setButtonClickEvent(
        "Options/AddScoreBtn",
        0,
        "onAddScoreBtnClick",
        this.getClassName(),
      );
      this.setButtonClickEvent(
        "Options/SubScoreBtn",
        0,
        "onSubScoreBtnClick",
        this.getClassName(),
      );
    }

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

    // 设置头像
    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(data.avatar);
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._data;
  }

  /**
   * 更新分数
   * @param club_score
   */
  public updateClubScore(club_score: number) {
    // 更新分数
    this._data.club_score = club_score;
    this._totalScoreLabel.string = club_score.toString() || "0";
  }

  /**
   * 添加分数按钮点击事件
   * @param event
   */
  private onAddScoreBtnClick(event: Event) {
    // 添加分数
    Logger.log(`onAddScoreBtnClick`);
    CommonDailogHandler.showDialogMiniKeyboard(
      "AddScoreToggle",
      6,
      (value: string) => {
        // 添加分数
        const score = parseInt(value, 10);
        const params = {
          player_id: this._data.player_id,
          score,
        };
        ClubEvents.changeClubPlayerScore(params);
      },
    );
  }

  /**
   * 减少分数按钮点击事件
   * @param event
   */
  private onSubScoreBtnClick(event: Event) {
    // 减少分数
    Logger.log(`onSubScoreBtnClick`);
    CommonDailogHandler.showDialogMiniKeyboard(
      "SubScoreToggle",
      6,
      (value: string) => {
        // 添加分数
        const score = -parseInt(value, 10);
        const params = {
          player_id: this._data.player_id,
          score,
        };
        ClubEvents.changeClubPlayerScore(params);
      },
    );
  }
}
