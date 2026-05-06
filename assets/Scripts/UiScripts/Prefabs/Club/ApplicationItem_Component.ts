import { _decorator, Label, Sprite, Node, Event } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ClubPlayerApplication } from "../../../Types/gateway/returned/clubPlayerApplication";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
const { ccclass, menu } = _decorator;

@ccclass("ApplicationItem_Component")
@menu("Hidden/ApplicationItem_Component")
export class ApplicationItem_Component extends ComponentController {
  private _avatarSprite: Sprite = null;

  private _nicknameLabel: Label = null;

  private _idLabel: Label = null;

  private _optionsNode: Node = null;

  private _reviewStatusLabel: Label = null; // 审核状态

  private _data: ClubPlayerApplication = null; // 数据

  /**
   * 是否正在等待审核结果
   */
  public isWaitingResult: boolean = false;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取头像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "Avatar/Mask/AvatarSprite",
      Sprite,
    );

    // 获取昵称标签
    [, this._nicknameLabel] = this.getNodeComponent("BaseInfo/Nickname", Label);

    // 获取ID标签
    [, this._idLabel] = this.getNodeComponent("BaseInfo/ID", Label);

    // 获取选项节点
    this._optionsNode = this.getNode("Options");

    // 获取审核状态标签
    [, this._reviewStatusLabel] = this.getNodeComponent("ReviewStatus", Label);

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: ClubPlayerApplication) {
    this._data = data;

    this._nicknameLabel.string = data.applicant_nickname;
    this._idLabel.string = data.applicant_id.toString();

    this._optionsNode.active = data.review_status === 0 ? true : false; // 如果审核状态为0，则显示选项按钮

    this._reviewStatusLabel.node.active =
      data.review_status !== 0 ? true : false; // 如果审核状态不为0，则显示审核状态标签

    const statusText =
      data.review_status === 1
        ? "已通过"
        : data.review_status === 2
          ? "不通过"
          : "";
    this._reviewStatusLabel.string = statusText;

    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
      data.applicant_avatar,
    );

    if (data.review_status === 0) {
      this.setButtonClickEvent(
        "Options/CancelBtn",
        0,
        "onCancelBtnClick",
        this.getClassName(),
      );
      this.setButtonClickEvent(
        "Options/OKBtn",
        0,
        "onOKBtnClick",
        this.getClassName(),
      );
    }
  }

  /**
   * 取消按钮点击事件
   * @param event
   */
  private onCancelBtnClick(event: Event) {
    this._data.review_status = 2;
    this.isWaitingResult = true;
    ClubEvents.reviewClubPlayerApplication(
      this._data.id,
      this._data.review_status,
      this._data.type,
    );
  }

  /**
   * 确定按钮点击事件
   * @param event
   */
  private onOKBtnClick(event: Event) {
    this._data.review_status = 1;
    this.isWaitingResult = true;
    ClubEvents.reviewClubPlayerApplication(
      this._data.id,
      this._data.review_status,
      this._data.type,
    );
  }

  /**
   * 设置已审核
   */
  public setReviewed() {
    this._optionsNode.active = false;

    const statusText =
      this._data.review_status === 1
        ? "已通过"
        : this._data.review_status === 2
          ? "不通过"
          : "";

    this._reviewStatusLabel.string = statusText;

    this._reviewStatusLabel.node.active = true;

    this.isWaitingResult = false;

    return this._data.club_id;
  }
}
