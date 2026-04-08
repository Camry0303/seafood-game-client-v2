import { _decorator, Label, Tween, tween, UITransform, Vec3, Node } from "cc";
import _ from "lodash";
import { ComponentController } from "../../../Common/ComponentController";
const { ccclass, menu } = _decorator;

@ccclass("InformationMarquee_Component")
@menu("Hidden/InformationMarquee_Component")
export class InformationMarquee_Component extends ComponentController {
  // 公告内容
  private _messages: string[] = [];

  // 当前播放的公告索引
  private _currentIndex = 0;

  // 公告面板宽度
  private _panelWidth: number = 0;

  // 滚动速度
  private _scrollSpeed: number = 100;

  // tween动画
  private _playTween: Tween<Node> | null = null;

  // 成员变量声明
  private _messageLabelNode: Node | null = null;
  private _messageLabel: Label | null = null;

  start() {
    this.playNextMessage();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取消息标签节点和组件
    [this._messageLabelNode, this._messageLabel] = this.getNodeComponent(
      "ViContent/MessageLabel",
      Label,
    );

    this._panelWidth = this.node.getComponent(UITransform)!.contentSize.width;
  }

  /**
   * 播放跑马灯
   * @returns
   */
  private async playNextMessage() {
    if (
      this._messages.length === 0 ||
      !this._messageLabelNode ||
      !this._messageLabel
    )
      return;
    if (this._playTween) this._playTween.stop();

    // 更新消息内容
    this._messageLabel.string = this._messages[this._currentIndex];
    this._currentIndex = (this._currentIndex + 1) % this._messages.length;
    // 强制更新 Label 的渲染数据,以便获取到正确的宽度
    this._messageLabel.updateRenderData(true);

    // 初始位置（右侧外部）
    const labelWidth =
      this._messageLabelNode.getComponent(UITransform)!.contentSize.width;

    this._messageLabelNode.setPosition(
      this._panelWidth / 2 + labelWidth / 2,
      0,
    );

    // 计算滚动时间（距离/速度）
    const duration = (this._panelWidth + labelWidth) / this._scrollSpeed;

    this._playTween = tween(this._messageLabelNode)
      .to(duration, {
        position: new Vec3(-(this._panelWidth / 2 + labelWidth / 2), 0),
      })
      .call(() => {
        // 停止当前动画
        this._playTween?.stop();
        // 循环播放
        this.playNextMessage();
      })
      .start();
  }

  /**
   * 设置公告内容
   * @param msgs
   */
  public setMessages(msgs: string[]) {
    this._messages = msgs;
    this.playNextMessage();
  }

  /**
   * 动态添加新消息
   * @param msg
   * @returns
   */
  public addMessage(msg: string) {
    if (msg.trim().length === 0) return;
    this._messages.unshift(msg);
    // 数组去重
    this._messages = _.uniq(this._messages);
  }

  /**
   * 动态删除消息
   * @param msg
   */
  public removeMessage(msg: string) {
    this._messages = this._messages.filter((m) => m !== msg);
  }
}
