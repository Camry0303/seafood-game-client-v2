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
import { SoundsManager } from "../../../Runtime/SoundsManager";
const { ccclass, property, menu } = _decorator;

@ccclass("DicesGameChip_Component")
@menu("Hidden/DicesGameChip_Component")
export class DicesGameChip_Component extends ComponentController {
  // 图像精灵
  private _chipSprite: Sprite = null;
  // 筹码值
  private _chipValue: number = 0;
  // 所属玩家
  private _owner: number = 0;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._chipSprite = this.node.getComponent(Sprite);
  }

  /**
   * 设置筹码的值
   * @param value
   */
  public setChipValue(value: number, player_id: number) {
    this._chipValue = value;
    this._owner = player_id;
    // 从资源管理中获取图集
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/chips/chips_atlas`,
    );
    // 获取图集的所有精灵帧
    const frames = atlas.getSpriteFrames();
    // 根据传入的值获取对应的精灵帧
    const frame = frames.find((frame) => frame.name === `${value}`);
    // 设置精灵帧
    this._chipSprite.spriteFrame = frame;
  }

  /**
   * 移动筹码
   * @param startPos 开始位置
   * @param endPos 结束位置
   */
  public runTween(startPos: Vec3, endPos: Vec3) {
    // 【关键修改 1】停止当前节点上所有的动画，防止动画堆积和鬼畜
    // 这样可以确保每次调用都是一个新的、干净的动画过程
    Tween.stopAllByTarget(this.node);

    // 1. 设置初始位置
    this.node.setPosition(startPos);

    // 2. 执行动画
    tween(this.node)
      .to(
        0.5,
        { position: endPos },
        {
          easing: "sineOut",
        },
      )
      .delay(0.1)
      .call(() => {
        // 播放音效
        SoundsManager.Instance.playEffect("chips_place");
      })
      .start();
  }
}
