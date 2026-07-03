import {
  _decorator,
  instantiate,
  Label,
  Node,
  Prefab,
  Size,
  Sprite,
  UITransform,
} from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { DicesGameOrderItem_Component } from "./DicesGameOrderItem_Component";
import { Gateway } from "../../../Types/gateway";
const { ccclass, property, menu } = _decorator;

@ccclass("DicesGameOrderDetailsItem_Component")
@menu("Hidden/DicesGameOrderDetailsItem_Component")
export class DicesGameOrderDetailsItem_Component extends ComponentController {
  // 头像图像精灵
  private _avatarSprite: Sprite = null;

  // 昵称标签
  private _nickNameLabel: Label = null;

  // 订单项容器
  private _orderItemContainerNode: Node = null;

  // 玩家信息
  private _playerData: Gateway.Returned.Games.DicesGame.GamePlayerData;
  // 订单信息
  private _gameOrdersData: Gateway.Returned.Games.DicesGame.OrderData[];

  start() {
    this.render();
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取头像图像精灵
    [, this._avatarSprite] = this.getNodeComponent(
      "PlayerUI/Avatar/Mask/AvatarSprite",
      Sprite,
    );
    // 获取昵称标签
    [, this._nickNameLabel] = this.getNodeComponent("PlayerUI/Nickname", Label);
    // 获取订单容器节点
    this._orderItemContainerNode = this.getNode("OrderItemContainer");
  }

  /**
   * 渲染
   */
  public async render() {
    // 清空列表项
    this._orderItemContainerNode.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameOrderItem",
    );
    const prefabTransform = prefab.data.getComponent(UITransform);
    const itemHeight = prefabTransform ? prefabTransform.height : 0;
    const itemWidth = prefabTransform ? prefabTransform.width : 0;

    const rowSpacing = 5; // 行间距
    const itemsPerRow = 3; // 每行项数

    // 渲染订单项
    this._gameOrdersData.forEach((order) => {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameOrderItem_Component);
      component.setData(order);
      node.name = `${order.seat_code}-${order.player_id}-${order.order_type}-${order.order_results}`;
      this._orderItemContainerNode.addChild(node);
    });

    // 根据订单项数量调整容器大小
    if (itemHeight > 0 && this._gameOrdersData.length > 0) {
      const totalItems = this._gameOrdersData.length;
      const totalRows = Math.ceil(totalItems / itemsPerRow); // 计算总行数

      // 总高度 = 所有行高度 + 所有行间距 (间距数量为 总行数 - 1)+ 底部各10偏移量
      const totalHeight =
        itemHeight * totalRows + rowSpacing * (totalRows - 1) + 10;

      this._orderItemContainerNode
        .getComponent(UITransform)
        .setContentSize(new Size(itemWidth, totalHeight));

      // 如果当前节点也需要自适应撑开，则也设置当前节点的高度
      this.node
        .getComponent(UITransform)
        .setContentSize(
          new Size(itemWidth, totalRows === 1 ? totalHeight + 20 : totalHeight),
        );
    }

    // 渲染头像和昵称
    getAvatarSpriteFrame(this._playerData.avatar).then((spriteFrame) => {
      this._avatarSprite.spriteFrame = spriteFrame;
    });
    this._nickNameLabel.string = this._playerData.nickname;
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: {
    player: Gateway.Returned.Games.DicesGame.GamePlayerData;
    gameOrders: Gateway.Returned.Games.DicesGame.OrderData[];
  }) {
    this._playerData = data.player;
    this._gameOrdersData = data.gameOrders;
  }

  /**
   * 订单创建
   * @param data
   */
  public async onOrderCreated(
    data: Gateway.Returned.Games.DicesGame.OrderData,
  ) {
    const key = `${data.seat_code}-${data.player_id}-${data.order_type}-${data.order_results}`;
    const node = this._orderItemContainerNode.getChildByName(key);
    if (node) {
      const component = node.getComponent(DicesGameOrderItem_Component);
      component.onOrderCreated(data);
    } else {
      this._gameOrdersData.push(data);
      this.render();
    }
  }
}
