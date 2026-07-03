import { _decorator, Label, Node, Sprite, SpriteAtlas } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { Gateway } from "../../../Types/gateway";
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
  private _data: Gateway.Returned.Games.DicesGame.OrderData = null;

  start() {
    const orderTypeMap = {
      1: "单",
      2: "连串",
      3: "豹",
      4: "挪",
    };
    // 设置订单类型标签文本
    this._orderTypeLabel.string = orderTypeMap[this._data.order_type];
    // 设置分数标签文本
    this._scoreLabel.string = this._data.order_score.toString();

    // 从资源管理中获取图集
    const atlas = ResourceManager.Instance.getAsset<SpriteAtlas>(
      "Images",
      `DicesGame/icons/small_icon0_atlas`,
    );

    // 根据订单类型设置结果精灵
    if (this._data.order_type === 1 || this._data.order_type === 3) {
      // 单 或 豹
      this._result1Sprite.spriteFrame = atlas.getSpriteFrame(
        `${this._data.order_results}`,
      );
    } else if (this._data.order_type === 2 || this._data.order_type === 4) {
      // 连串 或 挪
      const results = this._data.order_results.split(",");
      this._result1Sprite.spriteFrame = atlas.getSpriteFrame(results[0]);
      this._result2Sprite.spriteFrame = atlas.getSpriteFrame(results[1]);
    }

    // 挪单标记
    this._moveTagNode.active = this._data.order_type === 4;
  }

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
  public setData(data: Gateway.Returned.Games.DicesGame.OrderData) {
    this._data = data;
  }

  /**
   * 订单创建
   * @param data
   */
  public onOrderCreated(data: Gateway.Returned.Games.DicesGame.OrderData) {
    this._data.order_score += data.order_score;
    this._scoreLabel.string = this._data.order_score.toString();
  }
}
