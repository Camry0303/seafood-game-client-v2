import { _decorator, EditBox, Label, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import BubbleWindow from "../../../Common/BubbleWindow";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";

const { ccclass, menu } = _decorator;

@ccclass("PlayerInfoEditUI_Component")
@menu("Hidden/PlayerInfoEditUI_Component")
export class PlayerInfoEditUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;
  private _avatarSprite: Sprite = null;
  private _nicknameEditBox: EditBox = null;
  private _idLabel: Label = null;
  private _phoneNumberLabel: Label = null;
  private _editOrSaveBtnLabel: Label = null;

  async start() {
    // 初始化玩家信息编辑界面数据
    this._nicknameEditBox.enabled = false;
    this._editOrSaveBtnLabel.string = "编辑";

    // TODO - 从玩家数据中获取并显示玩家信息
    this._idLabel.string = "123456";
    this._phoneNumberLabel.string = "13800138000";
    // TODO - 显示玩家头像
    const spriteFrame = await getAvatarSpriteFrame(
      "https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83erEia7Tic6IL9wDRqtefBNt7qZ0s69WwV4BM3IzicxKlArCbYUUIT3L2VtMlWFjbwghlOgg47nd7dicYw/132",
    );
    this._avatarSprite.spriteFrame = spriteFrame;
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());

    [, this._avatarSprite] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/Avatar/Mask/AvatarSprite",
      Sprite,
    );

    [, this._nicknameEditBox] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/BaseInfo/Nickname/Value",
      EditBox,
    );

    [, this._idLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/BaseInfo/ID/Value",
      Label,
    );

    [, this._phoneNumberLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/BaseInfo/PhoneNumber/Value",
      Label,
    );

    [, this._editOrSaveBtnLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Form/BaseInfo/Nickname/EditOrSaveButton",
      Label,
    );

    // 设置编辑/保存按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/Form/BaseInfo/Nickname/EditOrSaveButton",
      0,
      "onEditOrSaveBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 编辑或保存按钮点击事件
   */
  private onEditOrSaveBtnClick() {
    console.log("onEditOrSaveBtnClick");
    if (this._nicknameEditBox.enabled) {
      // 当前处于编辑状态，切换到保存状态
      this._nicknameEditBox.enabled = false;
      this._editOrSaveBtnLabel.string = "编辑";
      // TODO - 保存修改后的昵称
      const nickname = this._nicknameEditBox.string;
      console.log(`保存修改后的昵称: ${nickname}`);
    } else {
      // 当前处于保存状态，切换到编辑状态
      this._nicknameEditBox.enabled = true;
      this._nicknameEditBox.setFocus();
      this._editOrSaveBtnLabel.string = "保存";
    }
  }

  /**
   * 关闭弹窗
   */
  public close() {
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }
}
