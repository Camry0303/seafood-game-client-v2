import { _decorator, Event, Label, native, Node, sys } from "cc";
import { SoundsManager } from "../../../Runtime/SoundsManager";
import { ComponentController } from "../../../Common/ComponentController";
import { GlobalData } from "../../../Runtime/GlobalData";
import { InformationMarquee_Component } from "../../Components/Common/InformationMarquee_Component";
import { PlazaPlayerInfo_Component } from "./PlazaPlayerInfo_Component";
const { ccclass, menu } = _decorator;

@ccclass("PlazaMainUI_Component")
@menu("Hidden/PlazaMainUI_Component")
export class PlazaMainUI_Component extends ComponentController {
  private _playerInfoNode: Node = null;
  private _playerInfoComponent: PlazaPlayerInfo_Component = null;

  private _informationMarqueeNode: Node = null;
  private _informationMarqueeComponent: InformationMarquee_Component = null;

  start() {
    // NOTE - 播放大厅音乐
    if (sys.isNative) {
      SoundsManager.Instance.playMusic("bgm_01");
    } else {
      this.scheduleOnce(() => {
        SoundsManager.Instance.playMusic("bgm_01");
      }, 1);
    }
  }

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // // 获取版本号组件
    // const [, versionLabel] = this.getNodeComponent(
    //   "MainContainer/Version",
    //   Label,
    // );
    // versionLabel.string = GlobalData.Instance.getVersionString();

    // 挂载组件到玩家信息节点
    [this._playerInfoNode, this._playerInfoComponent] = this.addNodeComponent(
      "TopBar/PlayerInformation",
      PlazaPlayerInfo_Component,
    );

    // 挂载组件到按钮跑马灯节点
    [this._informationMarqueeNode, this._informationMarqueeComponent] =
      this.addNodeComponent(
        "MainContainer/InformationMarquee",
        InformationMarquee_Component,
      );
  }
}
