import { _decorator, Label, Node, Event } from "cc";
import { Logger } from "../../../Utils/Logger";
import { ComponentController } from "../../../Common/ComponentController";
import { Gateway } from "../../../Types/gateway";
import moment from "moment";
import ClubEvents from "../../../Network/SocketIo/ClubEvents";

const { ccclass, menu } = _decorator;

@ccclass("DicesGameRecordItem_Component")
@menu("Hidden/DicesGameRecordItem_Component")
export class DicesGameRecordItem_Component extends ComponentController {
  private _normalTagNode: Node = null; // 正常标签

  private _winTagNode: Node = null; // 赢标签

  private _loseTagNode: Node = null; // 输标签

  private _timeLabel: Label = null; // 时间标签

  private _scoreLabel: Label = null; // 分数标签

  private _roomIdLabel: Label = null; // 房间号标签

  private _data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement = null; // 数据

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._normalTagNode = this.getNode("WinLose/NormalTag");
    this._winTagNode = this.getNode("WinLose/WinTag");
    this._loseTagNode = this.getNode("WinLose/LoseTag");
    [, this._timeLabel] = this.getNodeComponent("Time", Label);
    [, this._scoreLabel] = this.getNodeComponent("Score", Label);
    [, this._roomIdLabel] = this.getNodeComponent("RoomId", Label);

    this.setButtonClickEvent(
      "Options/ReviewBtn",
      0,
      "onReviewBtnClick",
      this.getClassName(),
    );
  }

  /**
   * 设置数据
   * @param data
   */
  public async setData(
    data: Gateway.Returned.ClubPlayer.ClubDicesGameSettlement,
  ) {
    this._data = data;

    this._normalTagNode.active = data.total_score === 0;
    this._winTagNode.active = data.total_score > 0;
    this._loseTagNode.active = data.total_score < 0;

    this._timeLabel.string = moment(new Date(data.created_date)).format(
      "MM-DD HH:mm",
    );
    this._scoreLabel.string = data.total_score.toString();
    this._roomIdLabel.string = data.room_id.toString();
  }

  /**
   * 获取数据
   * @returns
   */
  public getData() {
    return this._data;
  }

  /**
   * 点击查看按钮
   * @param event
   */
  private onReviewBtnClick(event: Event) {
    Logger.log(`onReviewBtnClick--->`, this._data);
    ClubEvents.getRoomClubDicesGameSettlement({
      current: 1,
      pageSize: 1000,
      room_id: this._data.room_id,
      club_id: this._data.club_id,
    });
  }
}
