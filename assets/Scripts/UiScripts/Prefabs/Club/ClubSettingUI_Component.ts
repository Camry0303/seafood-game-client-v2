import {
  _decorator,
  ToggleContainer,
  Node,
  Event,
  Toggle,
  EditBox,
  Label,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { CLUB_PLAYER_ROLE } from "../../../Enums";
import { GlobalData } from "../../../Runtime/GlobalData";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("ClubSettingUI_Component")
@menu("Hidden/ClubSettingUI_Component")
export class ClubSettingUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _menuToggleContainer: ToggleContainer = null;

  private _manageContent: Node = null;
  private _transferClubEditbox: EditBox = null;
  private _setSubAdminEditbox: EditBox = null;

  private _changeNameContent: Node = null;
  private _currentClubNameLabel: Label = null;
  private _changeNameEditbox: EditBox = null;

  private _announcementContent: Node = null;
  private _announcementEditbox: EditBox = null;

  private _quitContent: Node = null;
  private _dissolveContent: Node = null;

  start() {
    this.init();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    [, this._menuToggleContainer] = this.getNodeComponent(
      "MainView/Content/MainContent/Menu",
      ToggleContainer,
    );

    // 设置切换菜单按钮点击事件
    this.setToggleContainerCheckEvent(
      "MainView/Content/MainContent/Menu",
      0,
      "onMenuToggleCheck",
      this.getClassName(),
    );

    this._manageContent = this.getNode(
      "MainView/Content/MainContent/Content/ManageContent",
    );
    this._changeNameContent = this.getNode(
      "MainView/Content/MainContent/Content/ChangeNameContent",
    );
    this._announcementContent = this.getNode(
      "MainView/Content/MainContent/Content/AnnouncementContent",
    );
    this._quitContent = this.getNode(
      "MainView/Content/MainContent/Content/QuitContent",
    );
    this._dissolveContent = this.getNode(
      "MainView/Content/MainContent/Content/DissolveContent",
    );

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
   * 关闭弹窗
   */
  public close() {
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 设置切换菜单按钮点击事件
   * @param event
   */
  private onMenuToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const contentNodeName = toggle.node.name.replace("Toggle", "Content");
    console.log(`contentNodeName--->`, contentNodeName);
    this._manageContent.active = this._manageContent.name === contentNodeName;
    this._changeNameContent.active =
      this._changeNameContent.name === contentNodeName;
    this._announcementContent.active =
      this._announcementContent.name === contentNodeName;
    this._quitContent.active = this._quitContent.name === contentNodeName;
    this._dissolveContent.active =
      this._dissolveContent.name === contentNodeName;
  }

  /**
   * 初始化
   */
  private init() {
    // TODO - 根据当前用户权限初始化菜单(只有管理员才有管理、修改名称、公告、解散权限)
    const role =
      GlobalData.Instance.getCurrentClubPlayerInfo()?.role ??
      CLUB_PLAYER_ROLE.ADMIN;
    const toggles = this._menuToggleContainer.toggleItems;
    toggles.forEach((toggle: Toggle) => {
      if (toggle.node.name === "QuitToggle") {
        toggle.node.active = role > 0;
      } else {
        toggle.node.active = role === 0;
      }
    });
    const activedToggle = toggles.find((toggle: Toggle) => toggle.node.active);
    if (activedToggle) {
      activedToggle.setIsCheckedWithoutNotify(true);
      this._menuToggleContainer.notifyToggleCheck(activedToggle);
    }

    if (role === 0) {
      this.initManageContent();
      this.initChangeNameContent();
      this.initAnnouncementContent();
      this.initDissolveContent();
    } else {
      this.initQuitContent();
    }
  }

  //#region 管理选项
  /**
   * 初始化管理选项内容
   */
  private initManageContent() {
    [, this._transferClubEditbox] = this.getNodeComponent(
      "MainView/Content/MainContent/Content/ManageContent/MainView/TransferClub/Value",
      EditBox,
    );
    this._transferClubEditbox.maxLength = 6;
    this._transferClubEditbox.inputMode = EditBox.InputMode.NUMERIC;
    this._transferClubEditbox.inputFlag = EditBox.InputFlag.DEFAULT;

    [, this._setSubAdminEditbox] = this.getNodeComponent(
      "MainView/Content/MainContent/Content/ManageContent/MainView/SetSubAdmin/Value",
      EditBox,
    );
    this._setSubAdminEditbox.maxLength = 6;
    this._setSubAdminEditbox.inputMode = EditBox.InputMode.NUMERIC;
    this._setSubAdminEditbox.inputFlag = EditBox.InputFlag.DEFAULT;

    this.setButtonClickEvent(
      "MainView/Content/MainContent/Content/ManageContent/MainView/TransferClub/ComfrimBtn",
      0,
      "onTransferClubBtnClick",
      this.getClassName(),
    );
    this.setButtonClickEvent(
      "MainView/Content/MainContent/Content/ManageContent/MainView/SetSubAdmin/ComfrimBtn",
      0,
      "onSetSubAdminBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 确认转让俱乐部按钮点击事件
   * @param event
   */
  private onTransferClubBtnClick(event: Event) {
    try {
      const inputstring = this._transferClubEditbox.string;
      if (inputstring.trim()) {
        const player_id = parseInt(inputstring);
        console.log(`onTransferClubBtnClick player_id--->`, player_id);
      } else {
        throw new Error("请输入玩家ID");
      }
    } catch (error) {
      const e = error as Error;
      CommonDailogHandler.showBubbleMessage(e.message);
    }
  }

  /**
   * 确认设置副管理员按钮点击事件
   * @param event
   */
  private onSetSubAdminBtnClick(event: Event) {
    try {
      const inputstring = this._setSubAdminEditbox.string;
      if (inputstring.trim()) {
        const player_id = parseInt(inputstring);
        console.log(`onSetSubAdminBtnClick player_id--->`, player_id);
      } else {
        throw new Error("请输入玩家ID");
      }
    } catch (error) {
      const e = error as Error;
      CommonDailogHandler.showBubbleMessage(e.message);
    }
  }
  //#endregion

  //#region 修改名称
  /**
   * 初始化修改名称内容
   */
  private initChangeNameContent() {
    [, this._currentClubNameLabel] = this.getNodeComponent(
      "MainView/Content/MainContent/Content/ChangeNameContent/MainView/Current/Value",
      Label,
    );
    this._currentClubNameLabel.string = "当前俱乐部名称";

    [, this._changeNameEditbox] = this.getNodeComponent(
      "MainView/Content/MainContent/Content/ChangeNameContent/MainView/ClubName/Value",
      EditBox,
    );

    this._changeNameEditbox.maxLength = 8;
    this._changeNameEditbox.inputMode = EditBox.InputMode.ANY;
    this._changeNameEditbox.inputFlag = EditBox.InputFlag.DEFAULT;

    this.setButtonClickEvent(
      "MainView/Content/MainContent/Content/ChangeNameContent/MainView/ClubName/ComfrimBtn",
      0,
      "onChangeNameBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 确认修改名称按钮点击事件
   * @param event
   */
  private onChangeNameBtnClick(event: Event) {
    console.log(`onChangeNameBtnClick--->`);
    try {
      const inputstring = this._changeNameEditbox.string;
      if (inputstring.trim()) {
        console.log(`onChangeNameBtnClick inputstring--->`, inputstring);
      } else {
        throw new Error("请输入俱乐部名称");
      }
    } catch (error) {
      const e = error as Error;
      CommonDailogHandler.showBubbleMessage(e.message);
    }
  }
  //#endregion

  //#region 公告
  /**
   * 初始化公告内容
   */
  private initAnnouncementContent() {
    [, this._announcementEditbox] = this.getNodeComponent(
      "MainView/Content/MainContent/Content/AnnouncementContent/MainView/Announcement/Value",
      EditBox,
    );
    this._announcementEditbox.maxLength = 50;
    this._announcementEditbox.inputMode = EditBox.InputMode.ANY;
    this._announcementEditbox.inputFlag = EditBox.InputFlag.DEFAULT;
    // TODO - 初始化公告内容
    this._announcementEditbox.string = "公告内容";

    this.setButtonClickEvent(
      "MainView/Content/MainContent/Content/AnnouncementContent/MainView/Announcement/ComfrimBtn",
      0,
      "onAnnouncementBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 确认修改公告按钮点击事件
   * @param event
   */
  private onAnnouncementBtnClick(event: Event) {
    const inputstring = this._announcementEditbox.string.trim();
    console.log(`onAnnouncementBtnClick inputstring--->`, inputstring);
  }
  //#endregion

  //#region 退出
  /**
   * 初始化退出内容
   */
  private initQuitContent() {
    this.setButtonClickEvent(
      "MainView/Content/MainContent/Content/QuitContent/MainView/QuitBtn",
      0,
      "onQuitBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 退出按钮点击事件
   * @param event
   */
  private onQuitBtnClick(event: Event) {
    console.log(`onQuitBtnClick--->`);
  }
  //#endregion

  //#region 解散
  /**
   * 初始化解散内容
   */
  private initDissolveContent() {
    this.setButtonClickEvent(
      "MainView/Content/MainContent/Content/DissolveContent/MainView/DissolveBtn",
      0,
      "onDissolveBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 解散按钮点击事件
   * @param event
   */
  private onDissolveBtnClick(event: Event) {
    console.log(`onDissolveBtnClick--->`);
  }
  //#endregion
}
