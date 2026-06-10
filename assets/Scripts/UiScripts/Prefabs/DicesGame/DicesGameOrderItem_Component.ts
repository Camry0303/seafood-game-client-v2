import { _decorator, Label, Node, Sprite, SpriteAtlas } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ResourceManager } from "../../../Runtime/ResourceManager";
const { ccclass, property, menu } = _decorator;

@ccclass("DicesGameOrderItem_Component")
@menu("Hidden/DicesGameOrderItem_Component")
export class DicesGameOrderItem_Component extends ComponentController {
  // 订单类型标签
  private _orderTypeLabel: Label = null;
  // 分数标签
  private _scoreLabel: Label = null;

  // 结果1图像精灵
  private _result1Sprite: Sprite = null;
  // 结果2图像精灵
  private _result2Sprite: Sprite = null;
  // 挪单标记
  private _moveTagNode: Node = null;

  // 订单数据
  private _data: any = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取订单类型标签组件
    [, this._orderTypeLabel] = this.getNodeComponent(
      "OrderInfo/OrderType",
      Label,
    );
    // 获取分数标签组件
    [, this._scoreLabel] = this.getNodeComponent("OrderInfo/Score", Label);
    // 获取结果1图像精灵组件
    [, this._result1Sprite] = this.getNodeComponent(
      "OrderIcons/Result1/Icon",
      Sprite,
    );
    // 获取结果2图像精灵组件
    [, this._result2Sprite] = this.getNodeComponent(
      "OrderIcons/Result2/Icon",
      Sprite,
    );
    // 获取挪单标记节点
    this._moveTagNode = this.getNode("OrderIcons/MoveTag");
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: any) {
    this._data = data;

    // 设置订单类型标签文本
    this._orderTypeLabel.string = data.orderType;
    // 设置分数标签文本
    this._scoreLabel.string = data.score;

    // 从资源管理中获取图集
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/icons/small_icon0_atlas`,
    );
    // 获取图集的所有精灵帧
    const frames = atlas.getSpriteFrames();

    // 根据订单类型设置结果精灵
    if (data.orderType === "Normal") {
      this._result1Sprite.spriteFrame = frames.find(
        (frame) => frame.name === `${data.results[0]}`,
      );
    } else {
      this._result1Sprite.spriteFrame = frames.find(
        (frame) => frame.name === `${data.results[0]}`,
      );
      this._result2Sprite.spriteFrame = frames.find(
        (frame) => frame.name === `${data.results[1]}`,
      );
    }

    // 挪单标记
    this._moveTagNode.active = data.orderType === "Move";
  }
}
