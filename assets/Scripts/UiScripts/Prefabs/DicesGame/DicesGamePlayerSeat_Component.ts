import {
  _decorator,
  Label,
  Node,
  Sprite,
  tween,
  Tween,
  UIOpacity,
  Vec3,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/typing";
import { DICES_GAME_SEAT_STATUS } from "../../../Enums/Events/DicesGame";
const { ccclass, menu } = _decorator;

@ccclass("DicesGamePlayerSeat_Component")
@menu("Hidden/DicesGamePlayerSeat_Component")
export class DicesGamePlayerSeat_Component extends ComponentController {
  // 头像精灵
  private _avatarSprite: Sprite = null;
  // 昵称标签
  private _nicknameLabel: Label = null;
  // 分数标签
  private _scoreLabel: Label = null;
  // 庄家标记
  private _dealerTagNode: Node = null;
  // 飘分节点
  private _scoreBubbleNode: Node = null;
  // 飘分标签
  private _scoreBubbleLabel: Label = null;
  // 飘分动画
  private _scoreBubbleTween: Tween = null;

  // 座位数据
  private _seatData: Gateway.Returned.Games.DicesGame.GameSeatData = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取节点组件
    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Mask/AvatarSprite",
      Sprite,
    );
    // 获取昵称标签
    [, this._nicknameLabel] = this.getNodeComponent("Nickname", Label);
    // 获取分数标签
    [, this._scoreLabel] = this.getNodeComponent("Score", Label);
    // 获取庄家标记
    this._dealerTagNode = this.getNode("IsDealer");
    // 获取飘分节点和标签
    [this._scoreBubbleNode, this._scoreBubbleLabel] = this.getNodeComponent(
      "ScoreBubble",
      Label,
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: Gateway.Returned.Games.DicesGame.GameSeatData) {
    this.node.active = true;

    if (data === null) {
      this.node.active = false;
      // 赋值
      this._seatData = data;
      return;
    } else if (data.status !== DICES_GAME_SEAT_STATUS.EMPTY) {
      this.node.active = true;
      this._nicknameLabel.string = data.player.nickname;
      this._scoreLabel.string = `${data.player.score}`;
      // 是否庄家
      this._dealerTagNode.active = data.is_dealer;
      // 渲染头像
      data.player.avatar !== this._seatData?.player?.avatar &&
        (this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
          data.player.avatar,
        ));
      // 赋值
      this._seatData = data;
      return;
    } else if (data.status === DICES_GAME_SEAT_STATUS.EMPTY && data.is_dealer) {
      this._dealerTagNode.active = true;
      this.node.active = true;
      // 赋值
      this._seatData = data;
    } else {
      this._dealerTagNode.active = false;
      this.node.active = false;
      // 赋值
      this._seatData = data;
    }
    // 清除昵称
    this._nicknameLabel.string = "";
    // 清除分数
    this._scoreLabel.string = "";
    // 清除渲染头像
    this._avatarSprite.spriteFrame = null;
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._seatData;
  }

  /**
   * 更新分数
   * @param seatData
   */
  public updateScore(data: number) {
    this._scoreLabel.string = `${data}`;
    const player = this._seatData.player;
    player && (player.score = data);
  }

  /**
   * 播放飘分动画
   * @param score
   */
  public playScoreBubble(score: number) {
    // 飘分动画
    const [scoreBubbleNode, scoreBubbleOpacity] = this.getNodeComponent(
      "ScoreBubble",
      UIOpacity,
    );
    scoreBubbleNode.setPosition(0, -45, 0);
    if (this._scoreBubbleTween) {
      this._scoreBubbleTween.stop();
    } else {
      this._scoreBubbleTween = tween(scoreBubbleNode)
        .parallel(
          tween(scoreBubbleOpacity)
            .to(0, { opacity: 255 })
            .delay(0.75)
            .to(0, { opacity: 0 }),
          tween(scoreBubbleNode).to(0.5, {
            position: new Vec3(0, 0, 0),
          }),
        )
        .call(() => {
          // 停止当前动画
          this._scoreBubbleTween.stop();
        });
    }

    scoreBubbleOpacity.opacity = 0;
    scoreBubbleNode.setPosition(0, -45, 0);
    // 设置飘分分数（负数已自带符号，使用绝对值避免双负号）
    this._scoreBubbleLabel.string =
      score < 0 ? "-" + Math.abs(score).toString() : "+" + score.toString();

    this._scoreBubbleTween.start();
  }

  /**
   * 结算分数
   * @param data
   */
  public settleScore(
    data: Gateway.Returned.Games.DicesGame.PlayerSettlementData,
  ) {
    // 更新分数
    this.updateScore(data.score);
    // 播放飘分动画
    this.playScoreBubble(data.settlement_score);
  }
}
