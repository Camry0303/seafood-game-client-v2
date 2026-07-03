import { _decorator, Color, Label, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameSettlementItem_Component")
@menu("Hidden/DicesGameSettlementItem_Component")
export class DicesGameSettlementItem_Component extends ComponentController {
  // 头像图片精灵
  private _avatarSprite: Sprite = null;
  // 昵称
  private _nicknameLabel: Label = null;
  // 结算分数
  private _settlementScoreLabel: Label = null;

  // 数据
  private _data: Gateway.Returned.Games.DicesGame.PlayerSettlementData = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Mask/AvatarSprite",
      Sprite,
    );

    [, this._nicknameLabel] = this.getNodeComponent(
      "BaseInfo/NickNameLabel",
      Label,
    );

    [, this._settlementScoreLabel] = this.getNodeComponent(
      "BaseInfo/ScoreLabel",
      Label,
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(
    data: Gateway.Returned.Games.DicesGame.PlayerSettlementData,
  ) {
    this._data = data;
    this._nicknameLabel.string = data.nickname;
    this._settlementScoreLabel.string = data.settlement_score.toString();
    this._settlementScoreLabel.color =
      data.settlement_score <= 0 ? new Color("#47F747") : new Color("#FF0000");
    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(data.avatar);
  }
}
