import { _decorator, Node, Label, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameReviewItem_Component")
@menu("Hidden/DicesGameReviewItem_Component")
export class DicesGameReviewItem_Component extends ComponentController {
  // 头像图片精灵
  private _avatarSprite: Sprite = null;
  // 是否庄家
  private _isDealerNode: Node = null;
  // 昵称
  private _nicknameLabel: Label = null;
  // 大赢家
  private _bigWinnerNode: Node = null;
  // 富豪
  private _richNode: Node = null;
  // 房间ID
  private _roomIdLabel: Label = null;
  // 玩家数量
  private _playerCountLabel: Label = null;
  // 局数
  private _roundsLabel: Label = null;
  // 结算分数
  private _totalScoreLabel: Label = null;
  // 分数列表
  private _scoreListLabel: Label = null;

  // 数据
  private _data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    [, this._avatarSprite] = this.getNodeComponent(
      "content/Avatar/Avatar/Mask/AvatarSprite",
      Sprite,
    );

    this._isDealerNode = this.getNode("content/Avatar/Avatar/IsDealer");

    [, this._nicknameLabel] = this.getNodeComponent(
      "content/Nickname/Label",
      Label,
    );

    this._bigWinnerNode = this.getNode("content/Nickname/BigWinner");

    this._richNode = this.getNode("content/Nickname/Rich");

    [, this._roomIdLabel] = this.getNodeComponent("content/RoomId", Label);

    [, this._playerCountLabel] = this.getNodeComponent(
      "content/PlayerCount",
      Label,
    );

    [, this._roundsLabel] = this.getNodeComponent("content/Rounds", Label);

    [, this._totalScoreLabel] = this.getNodeComponent(
      "content/TotalScore",
      Label,
    );

    [, this._scoreListLabel] = this.getNodeComponent(
      "ScrollView/view/content/ScoreList/Label",
      Label,
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(
    data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement,
  ) {
    this._data = data;

    this._nicknameLabel.string = data.nickname;
    this._bigWinnerNode.active =
      data.is_big_winner && data.is_big_winner !== data.is_rich;
    this._richNode.active = data.is_rich && data.is_big_winner !== data.is_rich;
    this._roomIdLabel.string = data.room_id.toString();
    this._playerCountLabel.string = data.player_count.toString();
    this._roundsLabel.string = data.rounds.toString();
    this._totalScoreLabel.string = data.total_score.toString();
    let scoreListLabel = "";
    for (let i = 0; i < data.score_list.length; i++) {
      const scoreValue = data.score_list[i];
      const score = `第${i + 1}局：${scoreValue < 0 ? "-" : "+"}${Math.abs(scoreValue)}    `;
      scoreListLabel += score;
    }
    this._scoreListLabel.string = scoreListLabel;
    this._isDealerNode.active = data.is_dealer;
    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(data.avatar);
  }
}
