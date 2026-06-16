import { _decorator, Button, Label, Sprite, Node, Event } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { getAvatarSpriteFrame } from "../../../Utils/RemoteSpriteFrameLoader";
import { Gateway } from "../../../Types/gateway";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";
import DicesGameEvents from "../../../Network/SocketIo/DicesGameEvents";
import { GlobalData } from "../../../Runtime/GlobalData";
import CommonDailogHandler from "../../../Utils/CommonDailogHandler";
const { ccclass, menu } = _decorator;

@ccclass("GameTable_Component")
@menu("Hidden/GameTable_Component")
export class GameTable_Component extends ComponentController {
  private _roomIdLabel: Label = null;
  private _gameConfigLabel: Label = null;
  private _joinButton: Button = null;

  private _data: Gateway.Returned.Games.DicesGame.DicesGameRoomTableUiData =
    null;

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    [, this._roomIdLabel] = this.getNodeComponent("RoomId/Label", Label);
    [, this._gameConfigLabel] = this.getNodeComponent("GameConfigLabel", Label);
    [, this._joinButton] = this.setButtonClickEvent(
      "Button",
      0,
      "onButtonClick",
      this.getClassName(),
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(
    data: Gateway.Returned.Games.DicesGame.DicesGameRoomTableUiData,
  ) {
    this._data = data;
    this._roomIdLabel.string = `${data.room_id}`;
    this._gameConfigLabel.string = `鱼虾蟹${data.game_config.total_game_rounds}局（${Math.floor(data.game_config.total_game_rounds / 5)}房卡）${data.game_config.max_players + 1}人\n\r单压限分${data.game_config.score_limit.split(",")[0]}${data.game_config.score_mode === 0 ? "不可负分" : "可负分"}`;
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._data;
  }

  /**
   * 点击事件
   * @param event
   * @param customEventData
   */
  private onButtonClick(event: Event, customEventData: string) {
    const clubPlayer = GlobalData.Instance.getCurrentClubPlayerInfo();
    if (!clubPlayer) {
      CommonDailogHandler.showBubbleMessage("请重新进入俱乐部");
      return;
    }
    // 管理员只能观战
    if (clubPlayer.role <= 1) {
      DicesGameEvents.spectateClubDicesGameRoom({
        room_id: this._data.room_id,
      });
    } else {
      DicesGameEvents.joinClubDicesGameRoom({
        room_id: this._data.room_id,
      });
    }
  }
}
