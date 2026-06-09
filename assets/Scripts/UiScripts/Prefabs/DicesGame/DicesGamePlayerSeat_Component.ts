import { _decorator, Label, Node, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
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
  private _bankerTagNode: Node = null;

  // 座位数据
  private _seatData: any = null;

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
    this._bankerTagNode = this.getNode("IsBanker");
  }

  /**
   * 设置数据
   * @param seatData
   */
  public async setData(seatData: any) {
    if (seatData === null) {
      this._seatData = null;
      this.node.active = false;
      return;
    } else {
      this._nicknameLabel.string = this._seatData?.player.nickname;
      this._scoreLabel.string = `${this._seatData?.player.score}`;
      // 是否庄家
      this._bankerTagNode.active = this._seatData?.isBanker;
      // 渲染头像
      this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
        this._seatData?.player.avatar,
      );
      this.node.active = true;
      this._seatData = seatData;
    }
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
  public updataScore(seatData: any) {
    this._scoreLabel.string = `${seatData?.player.score}`;
    this._seatData = seatData;
  }
}
