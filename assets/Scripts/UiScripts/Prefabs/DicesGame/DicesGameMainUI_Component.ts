import { _decorator } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import { ComponentManager } from "../../../Runtime/ComponentManager";
const { ccclass, menu } = _decorator;

@ccclass("DicesGameMainUI_Component")
@menu("Hidden/DicesGameMainUI_Component")
export class DicesGameMainUI_Component extends ComponentController {
  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();
  }
}
