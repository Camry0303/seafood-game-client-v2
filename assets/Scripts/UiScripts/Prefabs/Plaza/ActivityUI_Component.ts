import { _decorator, Tween, Node, UITransform, tween, Vec3 } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
const { ccclass, menu } = _decorator;

@ccclass("ActivityUI_Component")
@menu("Hidden/ActivityUI_Component")
export class ActivityUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  // 公告面板宽度
  private _panelWidth: number = 0;

  // 滚动速度
  private _scrollSpeed: number = 150;

  // 内容节点
  private _contentNode: Node = null;

  // tween动画
  private _playTween: Tween<Node> | null = null;

  start() {
    this.playerMarquee();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node.addComponent(BubbleWindow);

    // 获取内容节点
    this._contentNode = this.getNode(
      "MainView/Content/ScrollView/view/content/Marquee/ViContent/Activites",
    );

    // 获取面板宽度
    const [viContent, viContentTransform] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/Marquee/ViContent",
      UITransform,
    );
    // 获取公告面板宽度
    this._panelWidth = viContentTransform.contentSize.width;

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
   * 播放跑马灯
   * @returns
   */
  private async playerMarquee() {
    if (!this._contentNode) return;
    if (this._playTween) this._playTween.stop();

    // 初始位置（右侧外部）
    const nodeWidth =
      this._contentNode.getComponent(UITransform)!.contentSize.width;

    // 从位置0开始
    this._contentNode.setPosition(0, 0, 0);

    // 计算滚动时间（距离/速度）
    const duration = (this._panelWidth + nodeWidth) / this._scrollSpeed;

    this._playTween = tween(this._contentNode)
      .to(duration, {
        position: new Vec3(-(this._panelWidth / 2 + nodeWidth / 2), 0),
      })
      .call(() => {
        // 停止当前动画
        this._playTween?.stop();
        // 循环播放
        this.playerMarquee();
      })
      .start();
  }
}
