import { _decorator, Button, Label, Sprite, Node, Event } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

@ccclass("ClubToggle_Component")
@menu("Hidden/ClubToggle_Component")
export class ClubToggle_Component extends ComponentController {
  private _avatarSprite: Sprite = null;
  private _clubName: Label = null;
  private _clubID: Label = null;

  private _avatarSpriteChecked: Sprite = null;
  private _clubNameChecked: Label = null;
  private _clubIDChecked: Label = null;

  private _applicationBtnNode: Node = null;
  private _applicationBtnButton: Button = null;

  // TODO - 完善类型
  private _clubData: Gateway.Returned.Club.Club = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Mask/AvatarSprite",
      Sprite,
    );
    [, this._clubName] = this.getNodeComponent("BaseInfo/ClubName", Label);
    [, this._clubID] = this.getNodeComponent("BaseInfo/ClubID", Label);

    [, this._avatarSpriteChecked] = this.getNodeComponent(
      "Checkmark/Avatar/Mask/AvatarSprite",
      Sprite,
    );
    [, this._clubNameChecked] = this.getNodeComponent(
      "Checkmark/BaseInfo/ClubName",
      Label,
    );
    [, this._clubIDChecked] = this.getNodeComponent(
      "Checkmark/BaseInfo/ClubID",
      Label,
    );

    [this._applicationBtnNode, this._applicationBtnButton] =
      this.getNodeComponent("ApplicationBtn", Button);
  }

  /**
   * 设置数据
   * @param clubData
   */
  public async setData(clubData: Gateway.Returned.Club.Club) {
    this._clubData = clubData;
    const avatarSprite = await getAvatarSpriteFrame(clubData.owner_avatar);

    this._avatarSprite.spriteFrame = avatarSprite;
    this._clubName.string = clubData.club_name;
    this._clubID.string = clubData.club_id.toString();

    this._avatarSpriteChecked.spriteFrame = avatarSprite;
    this._clubNameChecked.string = clubData.club_name;
    this._clubIDChecked.string = clubData.club_id.toString();

    // 是否有申请
    if (clubData.has_hint) {
      this._applicationBtnNode.active = true;
      // 设置申请按钮点击事件
      this.setButtonClickEvent(
        "ApplicationBtn",
        0,
        "onApplicationBtnClick",
        this.getClassName(),
      );
    } else {
      this._applicationBtnNode.active = false;
    }
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._clubData;
  }

  /**
   * 点击申请按钮事件
   * @param event
   */
  private onApplicationBtnClick(event: Event) {
    // 打开并且获取俱乐部申请列表
    console.log(`onApplicationBtnClick--->`, this._clubData);
  }
}
