import { _decorator, Node, Vec3 } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { DicesGamePlayerSeat_Component } from "./DicesGamePlayerSeat_Component";
const { ccclass, menu } = _decorator;

@ccclass("DicesGamePlayerSeatsContainer_Component")
@menu("Hidden/DicesGamePlayerSeatsContainer_Component")
export class DicesGamePlayerSeatsContainer_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;

  //#region 座位容器相关
  // 庄家座位
  private _bankerSeatNode: Node = null;
  private _bankerSeat: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat1Node: Node = null;
  private _playerSeat1: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat2Node: Node = null;
  private _playerSeat2: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat3Node: Node = null;
  private _playerSeat3: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat4Node: Node = null;
  private _playerSeat4: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat5Node: Node = null;
  private _playerSeat5: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat6Node: Node = null;
  private _playerSeat6: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat7Node: Node = null;
  private _playerSeat7: DicesGamePlayerSeat_Component = null;

  // 玩家座位
  private _playerSeat8Node: Node = null;
  private _playerSeat8: DicesGamePlayerSeat_Component = null;

  // 其他玩家座位标记
  private _morePlayersNode: Node = null;
  //#endregion

  // 座位数据数组
  private _seatsData: any[] = [];

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    [this._bankerSeatNode, this._bankerSeat] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat0/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat1Node, this._playerSeat1] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat1/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat2Node, this._playerSeat2] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat2/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat3Node, this._playerSeat3] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat3/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat4Node, this._playerSeat4] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat4/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat5Node, this._playerSeat5] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat5/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat6Node, this._playerSeat6] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat6/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat7Node, this._playerSeat7] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat7/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    [this._playerSeat8Node, this._playerSeat8] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat8/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );

    this._morePlayersNode = this.getNode("MorePlayers");
  }

  /**
   * 设置座位数据
   * @param data
   */
  public setData(data: any[]) {
    this._seatsData = data;
    this._morePlayersNode.active = data.length > 9;
  }

  /**
   * 获取座位数据
   * @returns
   */
  public getSeatsData() {
    return this._seatsData;
  }

  /**
   * 获取座位的世界坐标
   * @param seat_code 座位编码
   */
  public getSeatWorldPosition(seat_code: string): Vec3 {
    // 1. 遍历查找座位
    const seatsContainer = this.node.children;
    const seatNode = seatsContainer.find((seat) => {
      const component = seat.getComponent(DicesGamePlayerSeat_Component);
      // 修改点：返回 boolean 而不是对象
      return !!component && component.getData()?.seat_code === seat_code;
    });

    // 2. 确定最终要获取位置的节点
    const targetNode = seatNode || this._morePlayersNode;

    // 3. 安全获取位置
    if (!targetNode) {
      console.error(
        `[getSeatPosition] 未找到座位 ${seat_code} 且 _morePlayersNode 不存在`,
      );
      return Vec3.ZERO;
    }

    return targetNode.getWorldPosition();
  }
}
