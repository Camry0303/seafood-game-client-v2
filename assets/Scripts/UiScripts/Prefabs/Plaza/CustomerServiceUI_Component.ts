import { _decorator, Label, Sprite } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { GlobalData } from "../../../Runtime/GlobalData";
const { ccclass, menu } = _decorator;

@ccclass("CustomerServiceUI_Component")
@menu("Hidden/CustomerServiceUI_Component")
export class CustomerServiceUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _customerServiceQRCodeSprite: Sprite = null; // 客服二维码精灵

  private _customerServiceLabel: Label = null; // 客服联系方式标签

  start() {
    this.initCustomerServiceInfo();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 获取客服二维码精灵组件
    [, this._customerServiceQRCodeSprite] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/CustomerServiceQRCode/Sprite",
      Sprite,
    );

    // 获取客服联系方式标签组件
    [, this._customerServiceLabel] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/CustomerServiceLabel",
      Label,
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
   * 初始化客服信息
   */
  private initCustomerServiceInfo() {
    const customerService = GlobalData.Instance.getCustomerService();
    if (customerService) {
      this._customerServiceLabel.string = `客服微信：${customerService.wechat_service}\n客服QQ：${customerService.qq_service}`;
    } else {
      this._customerServiceLabel.string = `客服信息加载中...`;
    }
    // TODO - 初始化客服二维码（需服务端返回二维码资源或地址）
  }
}
