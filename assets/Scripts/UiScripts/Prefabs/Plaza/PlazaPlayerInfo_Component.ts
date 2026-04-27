import { _decorator, Event, Label, native, Sprite, sys } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/typing";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { PlayerInfoEditUI_Component } from "./PlayerInfoEditUI_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
const { ccclass, menu } = _decorator;

@ccclass("PlazaPlayerInfo_Component")
@menu("Hidden/PlazaPlayerInfo_Component")
export class PlazaPlayerInfo_Component extends ComponentController {
  // 玩家id
  private _idLabel: Label = null;
  // 玩家昵称
  private _nicknameLabel: Label = null;
  // 玩家头像
  private _avatarSprite: Sprite = null;
  // 房卡数量
  private _roomCardLabel: Label = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    [, this._idLabel] = this.getNodeComponent("BaseInfo/ID/Label", Label);

    [, this._nicknameLabel] = this.getNodeComponent(
      "BaseInfo/Nickname/Label",
      Label,
    );

    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Mask/AvatarSprite",
      Sprite,
    );

    [, this._roomCardLabel] = this.getNodeComponent("RoomCard/Value", Label);

    // 设置头像按钮点击事件
    this.setButtonClickEvent("Avatar", 0, "onAvatarClick", this.getClassName());

    // 设置信息按钮点击事件
    this.setButtonClickEvent(
      "BaseInfo",
      0,
      "onBaseInfoButtonClick",
      this.getClassName(),
    );

    // 设置房卡按钮点击事件
    this.setButtonClickEvent(
      "RoomCard",
      0,
      "onRoomCardBtnClick",
      this.getClassName(),
    );

    // 设置头像按钮点击事件
    this.setButtonClickEvent("Avatar", 0, "onAvatarClick", this.getClassName());
  }

  /**
   * 头像点击事件
   * @param event
   */
  private onAvatarClick(event: Event) {
    this.openInfoEditDialog();
  }

  /**
   * 信息按钮点击事件
   * @param event
   */
  private onBaseInfoButtonClick(event: Event) {
    this.openInfoEditDialog();
  }

  /**
   * 打开信息编辑对话框
   */
  private openInfoEditDialog() {
    const [node, component] =
      ComponentManager.Instance.renderUiNode<PlayerInfoEditUI_Component>(
        "PlayerInfoEditUI",
        "Prefabs",
        "Plaza/PlayerInfoEditUI",
        PlayerInfoEditUI_Component,
      );
    component.setPlayerInformation(GlobalData.Instance.getCurrentPlayerInfo());
  }

  /**
   * 房卡按钮点击事件
   * @param event
   */
  private onRoomCardBtnClick(event: Event) {
    CommonDailogHandler.showBubbleMessage("敬请期待");
  }

  /**
   * 设置当前玩家信息
   * @param player
   */
  public async setPlayerInformation(player: Gateway.Returned.Player.Player) {
    console.log(`<PlayerInfo_Component> setPlayerInformation called!`);
    this._idLabel.string = `ID:${String(player?.id) || ""}`;
    this._nicknameLabel.string = player?.nickname || "";
    this._roomCardLabel.string = player?.room_card.toString() || "";
    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
      player?.avatar || "custom_avatar_32",
    );
  }
}
