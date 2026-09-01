import { _decorator, Button, Label, Node, Sprite } from "cc";
import { Logger } from "../../../Utils/Logger";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
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

  // 退出按钮
  private _quitBtn: Button = null;

  // 机器人数据
  private _robotData: Gateway.Returned.Games.DicesGame.RoomRobotData = null;

  start() {
    this.render();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取头像图像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Avatar/Mask/AvatarSprite",
      Sprite,
    );
    // 获取昵称标签
    [, this._nickNameLabel] = this.getNodeComponent("Nickname", Label);
    // 获取 ID 标签
    [, this._idLabel] = this.getNodeComponent("ID", Label);

    // 获取退出按钮
    const [, quitBtn] = this.getNodeComponent("Options/QuitBtn", Button);
    this._quitBtn = quitBtn;

    // 设置退出按钮点击事件
    this.setButtonClickEvent(
      "Options/QuitBtn",
      0,
      "onQuitBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: Gateway.Returned.Games.DicesGame.RoomRobotData) {
    this._robotData = data;
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

  /**
   * 设置退出按钮是否可点击
   * 游戏已开始（非等待阶段）时不可退出，按钮置灰不可点。
   * @param interactable
   */
  public setQuitBtnInteractable(interactable: boolean) {
    if (this._quitBtn) {
      this._quitBtn.interactable = interactable;
    }
  }

  /**
   * 退出按钮点击事件
   * @param event
   */
  private onQuitBtnClick(event: Event) {
    Logger.log(`onQuitBtnClick--->`, this._robotData);
    if (!this._robotData) {
      return;
    }
    DicesGameEvents.removeRobotFromRoom({
      room_id: this._robotData.room_id,
      player_id: this._robotData.player_id,
    });
  }
}
