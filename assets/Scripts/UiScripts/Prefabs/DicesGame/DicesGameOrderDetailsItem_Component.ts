import {
  _decorator,
  instantiate,
  Label,
  Layout,
  Node,
  Prefab,
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

  // 顶部区域（头像+昵称）节点，用于计算 Item 根节点固定顶部高度
  private _topRegionNode: Node = null;

  // Item 根节点 UITransform（随订单容器撑高）
  private _rootUITransform: UITransform = null;

  // 订单容器 Layout（RESIZE_CONTAINER 完成后派发 resize 事件）
  private _orderContainerLayout: Layout = null;

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
    // 顶部区域（头像+昵称）
    this._topRegionNode = this.getNode("PlayerUI");
    // Item 根 UITransform
    this._rootUITransform = this.node.getComponent(UITransform);
    // 订单容器 Layout（RESIZE_CONTAINER）
    this._orderContainerLayout = this._orderItemContainerNode.getComponent(
      Layout,
    );
  }

  /**
   * 渲染
   * 订单项容器 OrderItemContainer 已挂载 GRID Layout（RESIZE_CONTAINER），
   * 由 Layout 自动按行列排布并撑开容器高度，脚本只负责增删子节点，不再手动 setContentSize。
   * 容器撑高后，需在 resize 回调里同步 Item 根节点高度，否则外层 content 的
   * VERTICAL Layout 读到的仍是固定高度，导致 content 不随 Item 撑高。
   */
  public async render() {
    // 清空列表项
    this._orderItemContainerNode.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameOrderItem",
    );

    // 渲染订单项
    this._gameOrdersData.forEach((order) => {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameOrderItem_Component);
      component.setData(order);
      node.name = `${order.seat_code}-${order.player_id}-${order.order_type}-${order.order_results}`;
      this._orderItemContainerNode.addChild(node);
    });

    // 渲染头像和昵称
    getAvatarSpriteFrame(this._playerData.avatar).then((spriteFrame) => {
      this._avatarSprite.spriteFrame = spriteFrame;
    });
    this._nickNameLabel.string = this._playerData.nickname;

    // 订单容器 GRID Layout 在下一帧 update 才会完成排布并撑高自身，
    // 延迟一帧同步 Item 根节点高度，使外层 content 的 VERTICAL Layout 能读到正确高度。
    this.scheduleOnce(this.syncRootHeight, 0);
    // 立即同步一次（应对无子项或 Layout 当帧未触发的情况）
    this.syncRootHeight();
  }

  /**
   * 同步 Item 根节点高度。
   * PlayerUI（头像+昵称）与 OrderItemContainer 在 Item 根坐标系下均从顶部起（lpos.y=0），
   * 二者垂直方向同起点、横向并排，因此根高度应取两者底部最大者，而非简单相加，
   * 否则会在中间多出一段空白（原 bug：topHeight + containerHeight 导致空一行）。
   * Item 根高度正确后，外层 content 的 VERTICAL Layout(RESIZE_CONTAINER) 会在
   * 下一次 update 自动跟随重排，从而整体随订单数撑高。
   */
  private syncRootHeight() {
    if (!this._rootUITransform || !this._orderItemContainerNode) return;

    const topHeight = this._topRegionNode
      ? this._topRegionNode.getComponent(UITransform)?.height ?? 0
      : 0;
    const containerHeight =
      this._orderItemContainerNode.getComponent(UITransform)?.height ?? 0;
    const bottomPadding = 10;

    const usedHeight = Math.max(topHeight, containerHeight);
    const totalHeight = usedHeight + bottomPadding;
    this._rootUITransform.setContentSize(
      this._rootUITransform.width,
      totalHeight,
    );
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
