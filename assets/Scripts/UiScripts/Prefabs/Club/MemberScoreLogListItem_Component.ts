import { _decorator, Color, Label, Node, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { CLUB_PLAYER_ROLE } from "../../../Enums";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import moment from "moment";
const { ccclass, menu } = _decorator;

@ccclass("MemberScoreLogListItem_Component")
@menu("Hidden/MemberScoreLogListItem_Component")
export class MemberScoreLogListItem_Component extends ComponentController {
  private _playerAvatarSprite: Sprite = null;

  private _playerNicknameLabel: Label = null;

  private _playerIdLabel: Label = null;

  private _modifierAvatarSprite: Sprite = null;

  private _modifierNicknameLabel: Label = null;

  private _modifierPlayerIdLabel: Label = null;

  private _type: Label = null;

  private _changedScore: Label = null;

  private _createdTime: Label = null;

  private _data: Gateway.Returned.ClubPlayer.ClubPlayerScoreLog = null; // 数据

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取头像精灵
    [, this._playerAvatarSprite] = this.getNodeComponent(
      "Player/Avatar/Mask/AvatarSprite",
      Sprite,
    );

    // 获取昵称标签
    [, this._playerNicknameLabel] = this.getNodeComponent(
      "Player/BaseInfo/Nickname/Label",
      Label,
    );

    // 获取ID标签
    [, this._playerIdLabel] = this.getNodeComponent(
      "Player/BaseInfo/ID/Label",
      Label,
    );

    // 获取操作人头像精灵
    [, this._modifierAvatarSprite] = this.getNodeComponent(
      "Modifier/Avatar/Mask/AvatarSprite",
      Sprite,
    );

    // 获取操作人昵称标签
    [, this._modifierNicknameLabel] = this.getNodeComponent(
      "Modifier/BaseInfo/Nickname/Label",
      Label,
    );

    // 获取操作人ID标签
    [, this._modifierPlayerIdLabel] = this.getNodeComponent(
      "Modifier/BaseInfo/ID/Label",
      Label,
    );

    // 获取类型标签
    [, this._type] = this.getNodeComponent("Type", Label);

    // 获取分数变化标签
    [, this._changedScore] = this.getNodeComponent("ChangedScore", Label);

    // 获取创建时间标签
    [, this._createdTime] = this.getNodeComponent("CreatedTime", Label);
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: Gateway.Returned.ClubPlayer.ClubPlayerScoreLog) {
    this._data = data;

    // 设置昵称
    this._playerNicknameLabel.string = data.nickname;

    // 设置ID
    this._playerIdLabel.string = data.player_id.toString();

    // 设置操作人昵称
    this._modifierNicknameLabel.string = data.modifier_nickname;

    // 设置操作人ID
    this._modifierPlayerIdLabel.string = data.modifier_id.toString();

    // 设置头像
    this._playerAvatarSprite.spriteFrame = await getAvatarSpriteFrame(
      data.avatar,
    );

    // 设置操作人头像
    this._modifierAvatarSprite.spriteFrame = await getAvatarSpriteFrame(
      data.modifier_avatar,
    );

    // 设置类型
    this._type.string = data.type === 0 ? "下分" : "上分";

    // 设置分数变化
    this._changedScore.string = data.changed_score.toString();
    this._changedScore.color =
      data.type === 0 ? new Color("#47F747") : new Color("#FF0000");

    // 设置创建时间
    this._createdTime.string = moment(data.created_time).format(
      "MM-DD HH:mm:ss",
    );
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._data;
  }
}
