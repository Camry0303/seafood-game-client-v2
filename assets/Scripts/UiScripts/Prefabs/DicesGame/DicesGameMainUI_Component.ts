import { _decorator, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { DicesGameTopStatusBar_Component } from "./DicesGameTopStatusBar_Component";
import { DicesGameBottomStatusBar_Component } from "./DicesGameBottomStatusBar_Component";
import { DicesGameGameTable_Component } from "./DicesGameGameTable_Component";
import { DicesGamePlayerSeatsContainer_Component } from "./DicesGamePlayerSeatsContainer_Component";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameMainUI_Component")
@menu("Hidden/DicesGameMainUI_Component")
export class DicesGameMainUI_Component extends ComponentController {
  //#region 顶部状态栏属性
  private _topStatusBar: Node = null;
  private _topStatusBarComponent: DicesGameTopStatusBar_Component = null;
  //#endregion

  //#region 底部状态栏属性
  private _bottomStatusBar: Node = null;
  private _bottomStatusBarComponent: DicesGameBottomStatusBar_Component = null;
  //#endregion

  //#region 游戏桌面区域属性
  private _gameTable: Node = null;
  private _gameTableComponent: DicesGameGameTable_Component = null;
  //#endregion

  //#region 玩家座位区域属性
  private _playerSeats: Node = null;
  private _playerSeatsComponents: DicesGamePlayerSeatsContainer_Component =
    null;
  //#endregion

  start() {
    // FIXME: 暂时使用
    this._gameTableComponent.setTimeCounter("ordering", 30);
    // FIXME: 暂时使用
    setTimeout(() => {
      this._gameTableComponent.placeChipAnimation(2, 50, "0", 12);
    }, 3000);
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取顶部状态栏节点
    this._topStatusBar = this.getNode("TopStatusBar");
    // 添加顶部状态栏组件
    this._topStatusBarComponent = this._topStatusBar.addComponent(
      DicesGameTopStatusBar_Component,
    );

    // 获取底部状态栏节点
    this._bottomStatusBar = this.getNode("BottomStatusBar");
    // 添加底部状态栏组件
    this._bottomStatusBarComponent = this._bottomStatusBar.addComponent(
      DicesGameBottomStatusBar_Component,
    );

    // 获取游戏桌面节点
    this._gameTable = this.getNode("GameTable");
    // 添加游戏桌面组件
    this._gameTableComponent = this._gameTable.addComponent(
      DicesGameGameTable_Component,
    );

    // 获取玩家座位节点
    this._playerSeats = this.getNode("PlayerSeatsContainer");
    // 添加玩家座位组件
    this._playerSeatsComponents = this._playerSeats.addComponent(
      DicesGamePlayerSeatsContainer_Component,
    );
  }

  /**
   * 获取顶部状态栏组件
   * @returns
   */
  public getTopStatusBarComponent(): DicesGameTopStatusBar_Component {
    return this._topStatusBarComponent;
  }

  /**
   * 获取底部状态栏组件
   * @returns
   */
  public getBottomStatusBarComponent(): DicesGameBottomStatusBar_Component {
    return this._bottomStatusBarComponent;
  }

  /**
   * 获取游戏桌面组件
   * @returns
   */
  public getGameTableComponent(): DicesGameGameTable_Component {
    return this._gameTableComponent;
  }

  /**
   * 获取玩家座位组件
   * @returns
   */
  public getPlayerSeatsComponent(): DicesGamePlayerSeatsContainer_Component {
    return this._playerSeatsComponents;
  }
}
