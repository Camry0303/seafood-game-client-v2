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

  start() {}

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
    [, this._nickNameLabel] = this.getNodeComponent("PlayerUI/NickName", Label);
    // 获取订单容器节点
    this._orderItemContainerNode = this.getNode("OrderItemContainer");
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(data: { player: any; gameOrders: any[] }) {
    // 清空列表项
    this._orderItemContainerNode.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameOrderItem",
    );

    // 渲染订单项
    data.gameOrders.forEach(async (order) => {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameOrderItem_Component);
      component.setData(order);
      this._orderItemContainerNode.addChild(node);
    });

    // 根据订单项数量调整容器大小
    const height =
      this._orderItemContainerNode.getComponent(UITransform).height;
    const width = this._orderItemContainerNode.getComponent(UITransform).width;
    this.node.getComponent(UITransform).setContentSize(new Size(width, height));

    // 渲染头像和昵称
    this._avatarSprite.spriteFrame = await getAvatarSpriteFrame(
      data.player.avatar,
    );
    this._nickNameLabel.string = data.player.nickname;
  }
}
