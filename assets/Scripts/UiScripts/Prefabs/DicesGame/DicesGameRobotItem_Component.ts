import { _decorator, Label, Node, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

/**
 * 机器人列表项组件
 */
@ccclass("DicesGameRobotItem_Component")
@menu("Hidden/DicesGameRobotItem_Component")
export class DicesGameRobotItem_Component extends ComponentController {
  // 头像图像精灵
  private _avatarSprite: Sprite = null;

  // 昵称标签
  private _nickNameLabel: Label = null;

  // ID 标签
  private _idLabel: Label = null;

  // 机器人数据
  private _robotData: Gateway.Returned.Games.DicesGame.GamePlayerData = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取头像图像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "DicesGameRobotItem/Avatar/Mask/AvatarSprite",
      Sprite,
    );
    // 获取昵称标签
    [, this._nickNameLabel] = this.getNodeComponent(
      "DicesGameRobotItem/Nickname",
      Label,
    );
    // 获取 ID 标签
    [, this._idLabel] = this.getNodeComponent("DicesGameRobotItem/ID", Label);
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: Gateway.Returned.Games.DicesGame.GamePlayerData) {
    this._robotData = data;
    this.render();
  }

  /**
   * 渲染
   */
  public async render() {
    if (!this._robotData) {
      return;
    }
    // 渲染头像（bot_ 前缀头像走远程热更域名加载，失败回退默认）
    if (this._avatarSprite) {
      getAvatarSpriteFrame(this._robotData.avatar).then((spriteFrame) => {
        if (spriteFrame) {
          this._avatarSprite.spriteFrame = spriteFrame;
        }
      });
    }
    // 渲染昵称
    if (this._nickNameLabel) {
      this._nickNameLabel.string = this._robotData.nickname;
    }
    // 渲染玩家 ID
    if (this._idLabel) {
      this._idLabel.string = this._robotData.player_id.toString();
    }
  }
}
