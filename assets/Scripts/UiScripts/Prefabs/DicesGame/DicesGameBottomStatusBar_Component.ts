import { _decorator, Node } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { DicesGameMainUI_Component } from "./DicesGameMainUI_Component";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameBottomStatusBar_Component")
@menu("Hidden/DicesGameBottomStatusBar_Component")
export class DicesGameBottomStatusBar_Component extends ComponentController {
  // 骰子游戏主界面组件
  private _mainComponent: DicesGameMainUI_Component = null;
  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    this._mainComponent = this.node.parent.getComponent(
      DicesGameMainUI_Component,
    );

    console.log(
      `DicesGameBottomStatusBar_Component _mainComponent--->`,
      this._mainComponent,
    );
  }
}
