import { _decorator, Label, Node, Sprite } from "cc";
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
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: Gateway.Returned.Games.DicesGame.GameSeatData) {
    this.node.active = true;

    if (data === null) {
      this._seatData = null;
      this.node.active = false;
      return;
    } else if (data.status !== DICES_GAME_SEAT_STATUS.EMPTY) {
      this.node.active = true;
      this._nicknameLabel.string = data.player.nickname;
      this._scoreLabel.string = `${data?.player.score}`;
      // 是否庄家
      this._dealerTagNode.active = data.is_dealer;
      // 渲染头像
      data.player.avatar !== this._seatData?.player?.avatar &&
        (this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
          data.player.avatar,
        ));
      return;
    } else if (data.status === DICES_GAME_SEAT_STATUS.EMPTY && data.is_dealer) {
      this._dealerTagNode.active = true;
      this.node.active = true;
    } else {
      this._dealerTagNode.active = false;
      this.node.active = false;
    }
    // 清除昵称
    this._nicknameLabel.string = "";
    // 清除分数
    this._scoreLabel.string = "";
    // 清除渲染头像
    this._avatarSprite.spriteFrame = null;

    // 赋值
    this._seatData = data;
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
}
