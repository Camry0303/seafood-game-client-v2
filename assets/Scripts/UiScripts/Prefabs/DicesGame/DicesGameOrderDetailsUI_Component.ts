import { _decorator, instantiate, Label, Node, Prefab } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameOrderDetailsItem_Component } from "./DicesGameOrderDetailsItem_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { Gateway } from "../../../Types/gateway";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameOrderDetailsUI_Component")
@menu("Hidden/DicesGameOrderDetailsUI_Component")
export class DicesGameOrderDetailsUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  // 订单详情容器
  private _orderDetailsItemContainer: Node = null;

  // 订单数据
  private _data: Record<string, Gateway.Returned.Games.DicesGame.OrderData[]> =
    null;

  // 座位数据
  private _seatsData: Record<
    string,
    Gateway.Returned.Games.DicesGame.GameSeatData
  > = null;

  // 当前局数标签
  private _currentRoundLabel: Label = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取订单详情容器
    this._orderDetailsItemContainer = this.getNode(
      "MainView/Content/ScrollView/view/content",
    );

    // 获取当前局数标签
    [, this._currentRoundLabel] = this.getNodeComponent(
      "MainView/Content/CurrentRoundLabel",
      Label,
    );

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());
  }

  /**
   * 关闭弹窗
   */
  public close() {
    this._bubbleWindow.close(() => {
      ComponentManager.Instance.destroyNode(this.node);
    });
  }

  /**
   * 清空下注详情内容（新一局开始时调用，避免残留上一局订单）
   * 仅清空展示，保留 _data / _seatsData 以便新一局订单回执到达时能即时按座位渲染。
   */
  public clearContent() {
    if (this._orderDetailsItemContainer) {
      this._orderDetailsItemContainer.removeAllChildren();
    }
    if (this._currentRoundLabel) {
      this._currentRoundLabel.string = "";
    }
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(
    data: Record<string, Gateway.Returned.Games.DicesGame.OrderData[]>,
    seatsData: Record<string, Gateway.Returned.Games.DicesGame.GameSeatData>,
  ) {
    this._data = data;
    this._seatsData = seatsData;

    // 渲染当前局数（取自主界面缓存的 current_round，与 TopBar 同源）
    const [mainNode, mainComponent] = ComponentManager.Instance.getNodeComponent(
      "DicesGameMainUI",
      DicesGameMainUI_Component,
    );
    if (this._currentRoundLabel && mainComponent) {
      this._currentRoundLabel.string = `第${mainComponent.getCurrentRound()}局`;
    }

    // 清空列表项
    this._orderDetailsItemContainer.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameOrderDetailsItem",
    );

    const nodes: Node[] = [];
    let playerNode: Node = null;

    for (const key in data) {
      const keys = key.split("-");
      const seat_code = keys[0];
      const player_id = keys[1];
      const seat = seatsData[seat_code];
      // 座位数据缺失（如 seats 未同步）时跳过，避免 seat.player 崩溃导致整面板无渲染
      if (!seat || !seat.player) continue;
      const player = seat.player;
      const gameOrders = data[key];
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameOrderDetailsItem_Component);
      component.setData({ player, gameOrders });

      node.name = key;
      // 判断是否是玩家的订单
      if (player.player_id === GlobalData.Instance.getCurrentPlayerInfo()?.id) {
        playerNode = node;
      } else {
        nodes.push(node);
      }
    }
    nodes.unshift(playerNode);

    for (let index = 0; index < nodes.length; index++) {
      const itemNode = nodes[index];
      if (itemNode) this._orderDetailsItemContainer.addChild(itemNode);
    }
  }

  /**
   * 订单创建
   * @param data
   */
  public onOrderCreated(
    data: Gateway.Returned.Games.DicesGame.CreatedOrderResultData,
  ) {
    const key = `${data.seat_code}-${data.player_id}`;
    const node = this._orderDetailsItemContainer.getChildByName(key);
    if (node) {
      const component = node.getComponent(DicesGameOrderDetailsItem_Component);
      const order: Gateway.Returned.Games.DicesGame.OrderData = {
        seat_code: data.seat_code,
        player_id: data.player_id,
        order_type: data.order_type,
        order_results: data.order_results,
        order_score: data.order_score,
      };
      component.onOrderCreated(order);
    } else {
      // 座位数据未就绪（如新一局刚清空、尚未重新 setData）时跳过，
      // 避免访问 null 的 _seatsData 或 seat.player 导致崩溃
      if (!this._seatsData) return;
      const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
        "Prefabs",
        "DicesGame/DicesGameOrderDetailsItem",
      );
      const seat = this._seatsData[data.seat_code];
      // 座位数据缺失时跳过，避免 seat.player 崩溃
      if (!seat || !seat.player) return;
      const player = seat.player;
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameOrderDetailsItem_Component);
      component.setData({ player, gameOrders: [data] });
      node.name = key;
      this._orderDetailsItemContainer.addChild(node);
    }
  }
}
