import { Component, _decorator, math, Tween, tween, UIOpacity, Node } from "cc";

/**
 * 气泡窗口
 */
export default class BubbleWindow extends Component {
  private _origin: math.Vec3 = new math.Vec3(1, 1, 1);

  private _openTween: Tween = null;
  private _closeTween: Tween = null;

  start() {
    this.open();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    this._origin = this.node.scale;
    this.node.getComponent(UIOpacity).opacity = 0;

    // 监听显示状态变化
    this.node.on(
      "active-in-hierarchy-changed",
      (node: Node) => {
        const isActive: boolean = node.active;
        this.onActiveChanged(isActive);
      },
      this,
    );
  }

  protected onActiveChanged(isActive: boolean) {
    if (isActive) {
      this.open();
    }
  }

  protected onEnable(): void {}

  /**
   * 打开
   */
  public open(callback?: Function) {
    if (this._openTween) {
      this._openTween.stop();
    } else {
      this._openTween = tween(this.node).sequence(
        tween(this.node).to(0, {
          scale: new math.Vec3(0.1, 0.1, 0.1),
        }),
        tween(this.node.getComponent(UIOpacity)).to(0, {
          opacity: 255,
        }),
        tween(this.node)
          .to(0.1, {
            scale: new math.Vec3(
              this._origin.x * 1.05,
              this._origin.y * 1.05,
              this._origin.z * 1.05,
            ),
          })
          .to(0.1, {
            scale: new math.Vec3(
              this._origin.x * 1,
              this._origin.y * 1,
              this._origin.z * 1,
            ),
          })
          .call(() => {
            // 停止当前动画
            this._openTween.stop();
            if (callback) callback();
          }),
      );
    }
    this._openTween.start();
  }

  /**
   * 关闭
   */
  public close(callback?: Function) {
    if (this._closeTween) {
      this._closeTween.stop();
    } else {
      this._closeTween = tween(this.node)
        .to(0.1, {
          scale: new math.Vec3(
            this._origin.x * 0.01,
            this._origin.y * 0.01,
            this._origin.z * 0.01,
          ),
        })
        .call(() => {
          // 停止当前动画
          this._closeTween.stop();
          this.node.active = false;
          if (callback) callback();
        });
    }
    this._closeTween.start();
  }
}
