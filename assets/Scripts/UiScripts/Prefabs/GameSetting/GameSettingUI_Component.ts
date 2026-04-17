import { _decorator, Label, Node, Toggle, ToggleContainer, Event } from "cc";
import { ComponentController } from "../../../Common/ComponentController";
import BubbleWindow from "../../../Common/BubbleWindow";
import { ComponentManager } from "../../../Runtime/ComponentManager";
import { GlobalData } from "../../../Runtime/GlobalData";
import { Gateway } from "../../../Types/gateway";
import Constants from "../../../Common/Constants";
const { ccclass, menu } = _decorator;

@ccclass("GameSettingUI_Component")
@menu("Hidden/GameSettingUI_Component")
export class GameSettingUI_Component extends ComponentController {
  public _bubbleWindow: BubbleWindow = null;

  private _scoreModeToggleContainer: ToggleContainer = null;

  private _totalGameRoundsToggleContainer: ToggleContainer = null;

  private _maxPlayersToggleContainer: ToggleContainer = null;

  private _scoreLimitComboxToggleContainer: ToggleContainer = null;
  private _scoreLimitComboxLabel: Label = null;
  private _scoreLimitComboxItemsNode: Node = null;

  private _moveLimitToggleContainer: ToggleContainer = null;

  // 游戏设置
  private _gameSetting: Gateway.Returned.Games.Dices.DicesGameConfig = null;
  // 游戏设置参数
  private _gameSettingParams: Gateway.Requested.Games.Dices.DicesGameConfig =
    null;

  // 显示类型
  private _type: "PUBLIC" | "CLUB" = "PUBLIC";

  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    super.onLoad();
    this.printNodeMap();

    // 挂载气泡弹窗组件
    this._bubbleWindow = this.node
      .getChildByName("MainView")
      .addComponent(BubbleWindow);

    // 分数选项
    [, this._scoreModeToggleContainer] = this.getNodeComponent(
      "MainView/Content/MainContent/SettingContent/ScoreMode/Options",
      ToggleContainer,
    );

    // 总局数选项
    [, this._totalGameRoundsToggleContainer] = this.getNodeComponent(
      "MainView/Content/MainContent/SettingContent/TotalGameRounds/Options",
      ToggleContainer,
    );

    // 最大玩家数选项
    [, this._maxPlayersToggleContainer] = this.getNodeComponent(
      "MainView/Content/MainContent/SettingContent/MaxPlayers/Options",
      ToggleContainer,
    );

    // 分数限制选项
    [, this._scoreLimitComboxToggleContainer] = this.getNodeComponent(
      "MainView/Content/MainContent/SettingContent/ScoreLimit/Options",
      ToggleContainer,
    );
    // 分数限制Label
    [, this._scoreLimitComboxLabel] = this.getNodeComponent(
      "MainView/Content/MainContent/SettingContent/ScoreLimit/ComboBox/Selected/Label",
      Label,
    );
    // 分数限制下拉菜单节点
    this._scoreLimitComboxItemsNode = this.getNode(
      "MainView/Content/MainContent/SettingContent/ScoreLimit/ComboBox/Items",
    );
    // 设置分数限制下拉选项按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/MainContent/SettingContent/ScoreLimit/ComboBox/Button",
      0,
      "onScoreLimitComboxBtnClick",
      this.getClassName(),
    );

    // 移动限制选项
    [, this._moveLimitToggleContainer] = this.getNodeComponent(
      "MainView/Content/MainContent/SettingContent/MoveLimit/Options",
      ToggleContainer,
    );

    // 设置创建按钮点击事件
    this.setButtonClickEvent(
      "MainView/Content/MainContent/CreateBtn",
      0,
      "onCreateBtnClick",
      this.getClassName(),
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
   * 设置数据
   * @param type
   */
  public setData(
    type: "PUBLIC" | "CLUB",
    setting: Gateway.Returned.Games.Dices.DicesGameConfig,
  ) {
    this._type = type;
    this._gameSetting = setting;
    this._gameSettingParams = { ...setting };

    // 初始化分数选项
    const scoreModeToggleNodes = this._scoreModeToggleContainer.node.children;
    for (let i = 0; i < scoreModeToggleNodes.length; i++) {
      const node = scoreModeToggleNodes[i];
      const component = node.getComponent(Toggle);
      if (node.name === `0`) {
        node.active = type === "CLUB";
      }
      if (node.name === `${this._gameSetting.score_mode}`) {
        component.isChecked = true;
        this._scoreModeToggleContainer.notifyToggleCheck(component);
      }
    }
    this.setToggleContainerCheckEvent(
      "MainView/Content/MainContent/SettingContent/ScoreMode/Options",
      0,
      "onScoreModeToggleCheck",
      this.getClassName(),
    );

    // 初始化总局数选项
    const totalGameRoundsToggleNodes =
      this._totalGameRoundsToggleContainer.node.children;
    for (let i = 0; i < totalGameRoundsToggleNodes.length; i++) {
      const node = totalGameRoundsToggleNodes[i];
      const component = node.getComponent(Toggle);
      const label = node.getChildByName("Label").getComponent(Label);
      label.string = `${node.name}局（${type === "CLUB" ? Number(node.name) / 5 : 0}卡）`;
      if (node.name === `${this._gameSetting.total_game_rounds}`) {
        component.isChecked = true;
        this._totalGameRoundsToggleContainer.notifyToggleCheck(component);
      }
    }
    this.setToggleContainerCheckEvent(
      "MainView/Content/MainContent/SettingContent/TotalGameRounds/Options",
      0,
      "onTotalGameRoundsToggleCheck",
      this.getClassName(),
    );

    // 初始化人数选项
    const maxplayerToggleNodes = this._maxPlayersToggleContainer.node.children;
    for (let i = 0; i < maxplayerToggleNodes.length; i++) {
      const node = maxplayerToggleNodes[i];
      const component = node.getComponent(Toggle);
      if (node.name !== `10`) {
        node.active = type === "CLUB";
      }
      if (node.name === `${this._gameSetting.max_players}`) {
        component.isChecked = true;
        this._maxPlayersToggleContainer.notifyToggleCheck(component);
      }
    }
    this.setToggleContainerCheckEvent(
      "MainView/Content/MainContent/SettingContent/MaxPlayers/Options",
      0,
      "onMaxPlayersToggleCheck",
      this.getClassName(),
    );

    // 初始化分数限制选项
    this._scoreLimitComboxLabel.string = Constants.SCORE_LIMIT_OPTIONS.find(
      (item) => item.value === this._gameSetting.score_limit,
    )?.label;
    this.setToggleContainerCheckEvent(
      "MainView/Content/MainContent/SettingContent/ScoreLimit/ComboBox/Items/Content/ScrollView/view/content",
      0,
      "onScoreLimitToggleCheck",
      this.getClassName(),
    );

    // 初始化移动限制选项
    const moveLimitToggleNodes = this._moveLimitToggleContainer.node.children;
    for (let i = 0; i < moveLimitToggleNodes.length; i++) {
      const node = moveLimitToggleNodes[i];
      const component = node.getComponent(Toggle);
      if (node.name === `${this._gameSetting.move_limit}`) {
        component.isChecked = true;
        this._moveLimitToggleContainer.notifyToggleCheck(component);
      }
    }
    this.setToggleContainerCheckEvent(
      "MainView/Content/MainContent/SettingContent/MoveLimit/Options",
      0,
      "onMoveLimitToggleCheck",
      this.getClassName(),
    );
  }

  /**
   * 分数限制下拉选项按钮点击事件
   * @param event
   */
  private onScoreLimitComboxBtnClick(event: Event) {
    const mainContainerNode = this.getNode("MainView/Content/MainContent");
    const itemsContainerNode = this.getNode(
      "MainView/Content/MainContent/SettingContent/ScoreLimit/ComboBox",
    );
    // 将下拉菜单移到根节点下，保持世界坐标不变
    const worldPos = this._scoreLimitComboxItemsNode.getWorldPosition();
    const currentIsActive = this._scoreLimitComboxItemsNode.active;
    if (currentIsActive) {
      this._scoreLimitComboxItemsNode.active = false;
      this._scoreLimitComboxItemsNode.setParent(itemsContainerNode);
      this._scoreLimitComboxItemsNode.setWorldPosition(worldPos);
      // 确保在根节点中也是最后一个子节点
      this._scoreLimitComboxItemsNode.setSiblingIndex(
        itemsContainerNode.children.length - 1,
      );
    } else {
      this._scoreLimitComboxItemsNode.active = true;
      this._scoreLimitComboxItemsNode.setParent(mainContainerNode);
      this._scoreLimitComboxItemsNode.setWorldPosition(worldPos);
      // 确保在根节点中也是最后一个子节点
      this._scoreLimitComboxItemsNode.setSiblingIndex(
        mainContainerNode.children.length - 1,
      );
    }
  }

  /**
   * 分数选项点击事件
   * @param event
   */
  private onScoreModeToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const value = Number(toggle.node.name);
    this._gameSettingParams.score_mode = value;
  }

  /**
   * 总局数选项点击事件
   * @param event
   */
  private onTotalGameRoundsToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const value = Number(toggle.node.name);
    this._gameSettingParams.total_game_rounds = value;
  }

  /**
   * 人数选项点击事件
   * @param event
   */
  private onMaxPlayersToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const value = Number(toggle.node.name);
    this._gameSettingParams.max_players = value;
  }

  /**
   * 分数限制选项点击事件
   * @param event
   */
  private onScoreLimitToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const nodeList = toggle.node.parent.children;
    const index = nodeList.indexOf(toggle.node);
    const option = Constants.SCORE_LIMIT_OPTIONS.find(
      (item) => item.id === index,
    );
    if (!option) return;
    this._scoreLimitComboxLabel.string = option.label;
    const value = option.value;
    this._gameSettingParams.score_limit = value;
    this.onScoreLimitComboxBtnClick(event);
  }

  /**
   * 移动限制选项点击事件
   * @param event
   */
  private onMoveLimitToggleCheck(event: Event) {
    const toggle: Toggle = event.target.getComponent(Toggle);
    const value = Number(toggle.node.name);
    this._gameSettingParams.move_limit = value;
  }

  /**
   * 创建按钮点击事件
   * @param event
   */
  private onCreateBtnClick(event: Event) {
    console.log(`onCreateBtnClick--->`, this._gameSettingParams);
  }
}
