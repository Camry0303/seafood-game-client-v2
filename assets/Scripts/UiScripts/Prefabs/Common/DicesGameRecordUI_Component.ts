import { Logger } from "../../../Utils/Logger";
import { _decorator, instantiate, Node, Prefab, Toggle } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { Gateway } from "../../../Types/gateway";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { DicesGameRecordItem_Component } from "./DicesGameRecordItem_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import PlazaEvents from "../../../Network/SocketIo/PlazaEvents";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameRecordUI_Component")
@menu("Hidden/DicesGameRecordUI_Component")
export class DicesGameRecordUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _publicRoomToggleNode: Node = null;
  private _publicRoomToggle: Toggle = null;

  private _clubRoomToggleNode: Node = null;
  private _clubRoomToggle: Toggle = null;

  private _tableContentNode: Node = null;

  private _data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement[] = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 获取普通房间节点和Toggle组件
    [this._publicRoomToggleNode, this._publicRoomToggle] =
      this.getNodeComponent(
        "MainView/Content/ScrollView/view/content/MainContent/Menu/PublicRoomToggle",
        Toggle,
      );

    // 获取俱乐部房间节点和Toggle组件
    [this._clubRoomToggleNode, this._clubRoomToggle] = this.getNodeComponent(
      "MainView/Content/ScrollView/view/content/MainContent/Menu/ClubRoomToggle",
      Toggle,
    );

    // 获取内容节点
    this._tableContentNode = this.getNode(
      "MainView/Content/ScrollView/view/content/MainContent/TableContent/Content/ScrollView/view/content",
    );

    this.setToggleClickEvent(
      "MainView/Content/ScrollView/view/content/MainContent/Menu/PublicRoomToggle",
      0,
      "onPublicRoomToggleClick",
      this.getClassName(),
    );

    this.setToggleClickEvent(
      "MainView/Content/ScrollView/view/content/MainContent/Menu/ClubRoomToggle",
      0,
      "onClubRoomToggleClick",
      this.getClassName(),
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
   * 普通房间Toggle点击事件
   */
  private onPublicRoomToggleClick() {
    Logger.log(`onClubRoomToggleClick--->`);
    // TODO 获取普通房间战绩
    // PlazaEvents.getMyPublicDicesGameSettlement({
    //   current: 1,
    //   pageSize: 1000,
    // });
  }

  /**
   * 俱乐部房间Toggle点击事件
   */
  private onClubRoomToggleClick() {
    Logger.log(`onClubRoomToggleClick--->`);
    const club = GlobalData.Instance.getCurrentClubInfoDetail();
    let params: Gateway.Requested.ClubPlayer.GetMyClubDicesGameSettlementParams =
      {
        current: 1,
        pageSize: 1000,
      };

    // 挂载战绩界面
    const [node, component] =
      ComponentManager.Instance.renderUiNode<DicesGameRecordUI_Component>(
        "DicesGameRecordUI",
        "Prefabs",
        "Common/DicesGameRecordUI",
        DicesGameRecordUI_Component,
      );

    if (club) {
      component && component.setShowMode("ClubOnly");
      params.club_id = club.club_id;
      ClubEvents.getMyClubDicesGameSettlement(params);
    } else {
      // 没有俱乐部信息，在大厅中查询俱乐部战绩
      component && component.setShowMode("ALL");
      ClubEvents.getMyClubDicesGameSettlement(params);
    }
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement[]) {
    this._data = data;
    this._tableContentNode.removeAllChildren();

    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Common/DicesGameRecordItem",
    );
    data.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(DicesGameRecordItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }

  /**
   * 设置显示模式
   * @param mode
   */
  public setShowMode(mode: "ClubOnly" | "ALL") {
    if (mode === "ClubOnly") {
      this._publicRoomToggleNode.active = false;
      this._clubRoomToggleNode.active = true;
    } else {
      this._publicRoomToggleNode.active = true;
      this._clubRoomToggleNode.active = true;
    }
  }
}
