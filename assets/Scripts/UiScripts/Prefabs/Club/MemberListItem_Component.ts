import { _decorator, Event, Label, Node, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { CLUB_PLAYER_ROLE } from "../../../Enums";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import { MemberListUI_Component } from "./MemberListUI_Component";
const { ccclass, menu } = _decorator;

@ccclass("MemberListItem_Component")
@menu("Hidden/MemberListItem_Component")
export class MemberListItem_Component extends ComponentController {
  private _roleAdminMarkNode: Node = null; // 管理员标记
  private _roleSubAdminMarkNode: Node = null; // 副管理员标记
  private _rolePartnerMarkNode: Node = null; // 合伙人标记

  private _checkedMark: Node = null;

  private _avatarSprite: Sprite = null;

  private _nicknameLabel: Label = null;

  private _idLabel: Label = null;

  private _parentComponent: MemberListUI_Component = null;

  private _data: Gateway.Returned.ClubPlayer.ClubPlayer = null; // 数据

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取管理员标记
    this._roleAdminMarkNode = this.getNode("RoleAdmin");
    // 获取副管理员标记
    this._roleSubAdminMarkNode = this.getNode("RoleSubAdmin");
    // 获取合伙人标记
    this._rolePartnerMarkNode = this.getNode("RolePartner");

    // 获取头像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Mask/AvatarSprite",
      Sprite,
    );

    // 获取昵称标签
    [, this._nicknameLabel] = this.getNodeComponent("Nickname", Label);

    // 获取ID标签
    [, this._idLabel] = this.getNodeComponent("ID", Label);

    // 获取选中标记
    this._checkedMark = this.getNode("CheckedMark");

    // 设置点击事件
    this.setButtonClickEvent(
      "Background",
      0,
      "onCheckedBtnClicks",
      this.getClassName(),
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(
    data: Gateway.Returned.ClubPlayer.ClubPlayer,
    parent_component: MemberListUI_Component,
  ) {
    this._data = data;
    this._parentComponent = parent_component;

    // 根据玩家角色显示不同的标记
    this._roleAdminMarkNode.active = data.role === CLUB_PLAYER_ROLE.ADMIN;
    this._roleSubAdminMarkNode.active =
      data.role === CLUB_PLAYER_ROLE.SUB_ADMIN;
    this._rolePartnerMarkNode.active = data.role === CLUB_PLAYER_ROLE.PARTNER;

    // 设置昵称
    this._nicknameLabel.string = data.nickname;

    // 设置ID
    this._idLabel.string = data.player_id.toString();

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
   * 设置选中状态
   * @param checked
   */
  public setChecked(checked: boolean) {
    this._checkedMark.active = checked;
  }

  /**
   * 选中按钮点击事件
   * @param event
   */
  private onCheckedBtnClicks(event: Event) {
    this._parentComponent.setCheckedMemberNode(this.node);
  }

  /**
   * 处理降职结果
   */
  public onDemote(player_id: number) {
    if (this._data.player_id === player_id) {
      this._data.role = CLUB_PLAYER_ROLE.MEMBER;
      this._roleAdminMarkNode.active = false;
      this._roleSubAdminMarkNode.active = false;
      this._rolePartnerMarkNode.active = false;
    }
  }
}
