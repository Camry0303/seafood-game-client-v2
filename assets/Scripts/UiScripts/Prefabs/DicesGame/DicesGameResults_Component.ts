import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteAtlas,
  Tween,
  tween,
  Vec3,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ResourceManager } from "../../../Runtime/ResourceManager";
const { ccclass, property, menu } = _decorator;

@ccclass("DicesGameResults_Component")
@menu("Hidden/DicesGameResults_Component")
export class DicesGameResults_Component extends ComponentController {
  // 结果1图像精灵
  private _result1Sprite: Sprite = null;
  // 结果2图像精灵
  private _result2Sprite: Sprite = null;
  // 结果3图像精灵
  private _result3Sprite: Sprite = null;

  // 结果值
  private _data: number[] = [];

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    [, this._result1Sprite] = this.getNodeComponent("Result1", Sprite);
    [, this._result2Sprite] = this.getNodeComponent("Result2", Sprite);
  }

  /**
   * 设置数据
   * @param value
   */
  public setData(data: number[]) {
    this._data = data;

    // 从资源管理中获取图集
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/dices/dices0_atlas`,
    );
    // 获取图集的所有精灵帧
    const frames = atlas.getSpriteFrames();
    // 设置结果1的图像
    this._result1Sprite.spriteFrame = frames.find(
      (frame) => frame.name === `${data[0]}`,
    );
    // 设置结果2的图像
    this._result2Sprite.spriteFrame = frames.find(
      (frame) => frame.name === `${data[1]}`,
    );
  }

  /**
   * 播放移动动画
   */
  public runTween() {
    // 【关键修改 1】停止当前节点上所有的动画，防止动画堆积和鬼畜
    // 这样可以确保每次调用都是一个新的、干净的动画过程
    Tween.stopAllByTarget(this.node);

    // 执行动画
    tween(this.node)
      .to(0.5, { scale: new Vec3(4, 4, 4) })
      .to(0.5, { scale: new Vec3(2.0, 2.0, 2.0) })
      .delay(0.5)
      .parallel(
        tween().to(
          0.5,
          { position: new Vec3(0, 10, 0) },
          {
            easing: "sineOut",
          },
        ),
        tween().to(0.5, { scale: new Vec3(1, 1, 1) }),
      )
      .call(() => {
        const children = this.node.parent.children;
        children.forEach((child) => {
          if (child !== this.node) {
            child.destroy(); // 销毁节点
          }
        });
      })
      .start();
  }

  /**
   * 重置状态
   */
  public resetStatus() {
    this.node.setPosition(0, 10, 0);
    this.node.setScale(1, 1, 1);
  }
}
