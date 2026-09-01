import { Logger } from "../../../Utils/Logger";
import { _decorator, instantiate, Node, Prefab } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameRobotItem_Component } from "./DicesGameRobotItem_Component";
import { Gateway } from "../../../Types/gateway";
import { GlobalData } from "../../../Runtime/GlobalData";
import { GAME_ROOM_STATUS } from "../../../Enums";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
const { ccclass, menu } = _decorator;

/**
 * 机器人列表面板组件
 *
 * 数据来自 ClubDicesGame.GetRoomRobotList（房间内当前正在游戏的机器人）。
 * 游戏开始后（房间非 WAITING）不允许机器人退出，退出按钮置为不可点击。
 */
@ccclass("DicesGameRobotUI_Component")
@menu("Hidden/DicesGameRobotUI_Component")
export class DicesGameRobotUI_Component extends ComponentController {
  // 机器人列表容器
  private _robotItemContainer: Node = null;

  // 机器人列表数据
  private _robotDataList: Gateway.Returned.Games.DicesGame.RoomRobotData[] =
    null;

  // 当前已渲染的列表项组件（用于统一控制退出按钮可用性）
  private _robotItemComponents: DicesGameRobotItem_Component[] = [];

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取机器人列表容器
    this._robotItemContainer = this.getNode(
      "MainView/Content/TableScrollView/view/content",
    );

    // 设置关闭按钮点击事件
    this.setButtonClickEvent(
      "MainView/CloseBtn",
      0,
      "close",
      this.getClassName(),
    );

    // 设置蒙版关闭按钮点击事件
    this.setButtonClickEvent("MaskNode", 0, "close", this.getClassName());

    // 添加机器人按钮（位于工具栏 MainView/Content/SearchBar/Options/AddBtn）
    this.setButtonClickEvent(
      "MainView/Content/SearchBar/Options/AddBtn",
      0,
      "onAddBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 关闭弹窗
   */
  public close() {
    ComponentManager.Instance.destroyNode(this.node);
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(
    data: Gateway.Returned.Games.DicesGame.RoomRobotData[],
  ) {
    this._robotDataList = data;

    // 清空列表项
    this._robotItemContainer.removeAllChildren();
    this._robotItemComponents = [];

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "DicesGame/DicesGameRobotItem",
    );

    for (let i = 0; i < data.length; i++) {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameRobotItem_Component);
      node.name = `${data[i].player_id}`;
      this._robotItemContainer.addChild(node);
      component.setData(data[i]);
      this._robotItemComponents.push(component);
    }

    // 依据房间状态同步退出按钮可用性
    this.updateQuitBtnsState();
  }

  /**
   * 依据房间状态更新所有退出按钮可用性
   * 仅房间处于 WAITING（游戏未开始）时才允许机器人退出。
   */
  public updateQuitBtnsState() {
    const roomData =
      GlobalData.Instance.getCurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>()
        ?.game_room_data;
    const canQuit = roomData?.status === GAME_ROOM_STATUS.WAITING;
    for (const component of this._robotItemComponents) {
      component.setQuitBtnInteractable(canQuit);
    }
  }

  /**
   * 添加机器人按钮点击事件：随机加入一个机器人（不指定 player_id）
   * @param event
   */
  private onAddBtnClick(event: Event) {
    Logger.log(`onAddBtnClick--->`);
    const roomData =
      GlobalData.Instance.getCurrentGameInfo<Gateway.Returned.Games.DicesGame.ClubDicesGameRoomData>()
        ?.game_room_data;
    if (!roomData?.room_id) {
      return;
    }
    // 成功后由 DicesGameEvents 自动重新拉取列表刷新界面
    DicesGameEvents.addRandomRobotToRoom({ room_id: roomData.room_id });
  }
}
