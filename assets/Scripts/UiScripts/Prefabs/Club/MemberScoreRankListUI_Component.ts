import { _decorator, Node, EditBox, Event, Prefab, instantiate } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { ResourceManager } from "../../../Runtime/ResourceManager";
import { Gateway } from "../../../Types/typing";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
import { GetClubPlayerScoreRankListParams } from "../../../Types/gateway/requested/clubPlayer";
import { MemberScoreRankListItem_Component } from "./MemberScoreRankListItem_Component";
import { GlobalData } from "../../../Runtime/GlobalData";
const { ccclass, menu } = _decorator;

@ccclass("MemberScoreRankListUI_Component")
@menu("Hidden/MemberScoreRankListUI_Component")
export class MemberScoreRankListUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _tableContentNode: Node = null;

  // 成员列表数据
  private _data: Gateway.Returned.Common.Pagenation<
    Gateway.Returned.ClubPlayer.ClubPlayerScoreRank[]
  > = null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 获取表格内容节点
    this._tableContentNode = this.getNode(
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
   * 打开添加合伙人界面
   * @param event
   */
  private onOpenAddPartner(event: Event) {
    CommonDailogHandler.showDialogMiniKeyboard(
      "AddPartnerToggle",
      6,
      (value: string) => {
        // 添加合伙人
        const player_id = parseInt(value, 10);
        ClubEvents.addPartner({ player_id });
      },
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public setData(
    data: Gateway.Returned.Common.Pagenation<
      Gateway.Returned.ClubPlayer.ClubPlayerScoreRank[]
    >,
  ) {
    this._data = data;
    this._tableContentNode.removeAllChildren();

    const currentPlayer = data.data.find(
      (item) =>
        item.player_id ===
        GlobalData.Instance.getCurrentClubPlayerInfo()?.player_id,
    );
    if (currentPlayer) {
      data.data.unshift(currentPlayer);
    }

    const datalist = data.data;
    const prefab: Prefab = ResourceManager.Instance.getAsset<Prefab>(
      "Prefabs",
      "Club/MemberScoreRankListItem",
    );

    // 渲染玩家列表
    datalist.forEach((item) => {
      const node = instantiate(prefab);
      const component = node.addComponent(MemberScoreRankListItem_Component);
      this._tableContentNode.addChild(node);
      component.setData(item);
    });
  }

  /**
   * 刷新数据
   */
  public reloadData() {
    let params: GetClubPlayerScoreRankListParams = {
      current: 1,
      pageSize: 1000,
    };

    ClubEvents.getClubPlayerScoreRankList(params);
  }
}
