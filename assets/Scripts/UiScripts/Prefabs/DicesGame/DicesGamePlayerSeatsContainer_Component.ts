import { _decorator, Node, Vec3 } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
import { DicesGamePlayerSeat_Component } from "./DicesGamePlayerSeat_Component";
import { Gateway } from "../../../Types/gateway";
import _ from "lodash";
import { GlobalData } from "../../../Runtime/GlobalData";
import { DICES_GAME_SEAT_STATUS } from "../../../Enums/Events/DicesGame";
const { ccclass, menu } = _decorator;

@ccclass("DicesGamePlayerSeatsContainer_Component")
@menu("Hidden/DicesGamePlayerSeatsContainer_Component")
export class DicesGamePlayerSeatsContainer_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;

  //#region 座位容器相关
  // 庄家座位
  private _dealerSeatNode: Node = null;
  private _dealerSeat: DicesGamePlayerSeat_Component = null;

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

  // 座位组件数组
  private _seats: DicesGamePlayerSeat_Component[] = [];
  //#endregion

  // 座位数据数组
  private _seatsData: Record<
    string,
    Gateway.Returned.Games.DicesGame.GameSeatData
  > = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    [this._dealerSeatNode, this._dealerSeat] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat0/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._dealerSeat);

    [this._playerSeat1Node, this._playerSeat1] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat1/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat1);

    [this._playerSeat2Node, this._playerSeat2] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat2/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat2);

    [this._playerSeat3Node, this._playerSeat3] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat3/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat3);

    [this._playerSeat4Node, this._playerSeat4] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat4/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat4);

    [this._playerSeat5Node, this._playerSeat5] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat5/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat5);

    [this._playerSeat6Node, this._playerSeat6] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat6/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat6);

    [this._playerSeat7Node, this._playerSeat7] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat7/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat7);

    [this._playerSeat8Node, this._playerSeat8] =
      this.addNodeComponent<DicesGamePlayerSeat_Component>(
        "Seat8/PlayerSeat",
        DicesGamePlayerSeat_Component,
      );
    this._seats.push(this._playerSeat8);

    this._morePlayersNode = this.getNode("MorePlayers");
  }

  /**
   * 获取座位数据
   * @returns
   */
  public getSeatsData() {
    return this._seatsData;
  }

  /**
   * 获取座位组件
   * @returns
   */
  public getSeatsComponents() {
    return this._seats;
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

  /**
   * 更新座位UI
   * @param data
   */
  public updatePlayerSeatsUI(
    data: Record<string, Gateway.Returned.Games.DicesGame.GameSeatData>,
  ) {
    this._seatsData = data;

    const player = GlobalData.Instance.getCurrentPlayerInfo();

    // 获取庄家座位数据
    const dealerSeatData = data["0"];

    // 整理座位数据
    const seatsData = Object.values(data);
    seatsData.shift(); // 移除庄家座位数据

    // 根据玩家排序，不含庄家座位
    const seatsDataSorted = _.sortBy(seatsData, (seat) => seat.player);

    // 尝试找出本玩家的座位索引
    const index = seatsDataSorted.findIndex(
      (seat) => seat.player?.player_id === player.id,
    );
    // 如果找到了本玩家的座位索引，则将其移动到第一个位置
    if (index !== -1) {
      const playerSeatData = seatsDataSorted.splice(index, 1);
      seatsDataSorted.unshift(playerSeatData[0]);
    }

    // 取前八个非庄家座位
    const seatsDataToRender = seatsDataSorted.slice(0, 8);
    // 加入庄家座位数据
    seatsDataToRender.unshift(dealerSeatData);

    // 渲染座位UI
    this._seats.forEach((seat, index) => {
      seat.setData(seatsDataToRender[index]);
    });

    console.log(`updatePlayerSeatsUI seatsDataToRender--->`, seatsDataToRender);

    // 计算玩家人数
    const playernum = seatsDataSorted.reduce((acc, seat) => {
      return seat.status !== DICES_GAME_SEAT_STATUS.EMPTY ? acc + 1 : acc;
    }, 0);

    this._morePlayersNode.active = playernum > 8;
  }

  /**
   * 更新玩家座位
   * @param seat
   */
  public updatePlayerSeat(seat: Gateway.Returned.Games.DicesGame.GameSeatData) {
    this._seatsData[seat.seat_code] = seat;
    this.updatePlayerSeatsUI(this._seatsData);
  }

  /**
   * 更新玩家座位分数
   * @param seat_code
   * @param score
   */
  public updatePlayerSeatScore(seat_code: string, score: number) {
    this._seats.forEach((seat) => {
      if (seat.getData()?.seat_code === seat_code) {
        seat.updateScore(score);
      }
    });
  }

  /**
   * 结算玩家座位分数
   * @param data
   */
  public settlePlayerSeatScore(
    data: Gateway.Returned.Games.DicesGame.PlayerSettlementData[],
  ) {
    data.forEach((item) => {
      const seat_code = item.seat_code;
      const component = this._seats.find(
        (seat) => seat.getData()?.seat_code === seat_code,
      );
      component && component.settleScore(item);
      const seatData = this._seatsData[seat_code];
      seatData && (seatData.score = item.score);
    });
  }
}
