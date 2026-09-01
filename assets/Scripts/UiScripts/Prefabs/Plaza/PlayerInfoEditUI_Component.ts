import { _decorator, EditBox, Label, Sprite } from "cc";
import { Logger } from "../../../Utils/Logger";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import BubbleWindow from "../../../Common/BubbleWindow";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
import { GlobalData } from "../../../Runtime/GlobalData";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import PlazaEvents from "../../../Network/SocketIo/PlazaEvents";

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
    Logger.log("onEditOrSaveBtnClick");
    if (this._nicknameEditBox.enabled) {
      // 当前处于编辑状态，切换到保存状态
      this._nicknameEditBox.enabled = false;
      this._editOrSaveBtnLabel.string = "编辑";
      const nickname = this._nicknameEditBox.string;
      if (
        nickname.trim() &&
        nickname !== GlobalData.Instance.getCurrentPlayerInfo()?.nickname
      ) {
        // 发送修改昵称请求
        PlazaEvents.changeNickname(nickname);
      } else {
        CommonDailogHandler.showBubbleMessage(`没有任何修改`);
      }
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

  /**
   * 设置当前玩家信息
   * @param player
   */
  public async setPlayerInformation(player: Gateway.Returned.Player.Player) {
    Logger.log(`<PlayerInfo_Component> setPlayerInformation called!`);
    this._idLabel.string = `${String(player?.id) || ""}`;
    this._nicknameEditBox.string = player?.nickname || "";
    this._phoneNumberLabel.string = player?.phone_number || "未绑定";
    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(player?.avatar);
  }
}
