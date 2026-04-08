import { _decorator, Label, Tween, tween, UIOpacity, Vec3 } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
const { ccclass, menu } = _decorator;

@ccclass("BubbleMessageUI_Component")
@menu("Hidden/BubbleMessageUI_Component")
export class BubbleMessageUI_Component extends ComponentController {
  private _playTween: Tween = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();
  }

  /**
   * 播放气泡消息
   * @param message
   * @param callback
   */
  public playBubbleMessageUI(message: string, callback: Function) {
    const [msgNode, msgUiOpacity] = this.getNodeComponent("Message", UIOpacity);
    if (this._playTween) {
      this._playTween.stop();
    } else {
      this._playTween = tween(msgNode)
        .parallel(
          tween(msgUiOpacity)
            .to(0.25, { opacity: 255 })
            .delay(1.5)
            .to(0.25, { opacity: 0 }),
          tween(msgNode).to(0.5, {
            position: new Vec3(0, 0, 0),
          }),
        )
        .call(() => {
          // 停止当前动画
          this._playTween.stop();
          if (callback) {
            callback();
          }
        });
    }

    msgUiOpacity.opacity = 0;
    msgNode.setPosition(new Vec3(0, -100, 0));
    this.getNode("Message/Label").getComponent(Label).string = message;

    this._playTween.start();
  }
}
