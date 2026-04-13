import { _decorator } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("ShareUI_Component")
@menu("Hidden/ShareUI_Component")
export class ShareUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 设置分享朋友圈按钮点击时间
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/MainContent/ShareFriendCircle/ShareFriendCircleBtn",
      0,
      "onShareFriendCircleBtnClick",
      this.getClassName(),
    );

    // 设置分享微信朋友按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/ScrollView/view/content/MainContent/ShareWeChatFriend/ShareWeChatFriendBtn",
      0,
      "onShareWeChatFriendBtnClick",
      this.getClassName(),
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
   * 分享朋友圈按钮点击事件
   * @param event
   */
  private onShareFriendCircleBtnClick(event: Event) {
    CommonDailogHandler.showBubbleMessage("敬请期待");
  }

  /**
   * 分享微信朋友按钮点击事件
   * @param event
   */
  private onShareWeChatFriendBtnClick(event: Event) {
    CommonDailogHandler.showBubbleMessage("敬请期待");
  }
}
