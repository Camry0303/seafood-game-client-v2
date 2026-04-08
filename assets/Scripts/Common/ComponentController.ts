import {
  __private,
  _decorator,
  Button,
  Component,
  Node,
  Slider,
  Toggle,
  ToggleContainer,
} from "cc";
import { NewEventHandler } from "../Utils/AddEventHandler";

/**
 * 控制组件类
 */
export class ComponentController extends Component {
  /**
   * 节点视图映射
   */
  protected _nodeMap: { [key: string]: Node } = {};

  protected onLoad(): void {
    this._nodeMap = {};
    this.loadNodeMap(this.node, "");
  }

  /**
   * 获取组件类名
   * @returns
   */
  protected getClassName() {
    const regex = /<([^>]+)>/; // 匹配尖括号内的内容
    const match = this.name.match(regex);
    if (match && match[1]) {
      const innerContent = match[1];
      return innerContent;
    }
    return this.name;
  }

  /**
   * 打印节点映射信息
   */
  protected printNodeMap(key: boolean = false, value: boolean = false) {
    const keys = Object.keys(this._nodeMap);
    key && console.log(`${this.getClassName()} nodeMap Keys--->`, keys);
    value && console.log(`${this.getClassName()} nodeMap--->`, this._nodeMap);
  }

  /**
   * 加载视图映射
   * @param rootNode
   * @param path
   */
  private loadNodeMap(rootNode: Node, path: string): void {
    if (path.trim() === "") {
      this._nodeMap[`rootNode`] = rootNode;
    }
    rootNode.children?.forEach((element) => {
      this._nodeMap[`${path}${element.name}`] = element;
      this.loadNodeMap(element, `${path}${element.name}/`);
    });
  }

  /**
   * 获取节点
   * @param path
   * @returns
   */
  public getNode(path: string): Node {
    return this._nodeMap[path];
  }

  /**
   * 添加组件到节点
   * @param path
   * @param component
   */
  public addNodeComponent<T extends Component>(
    path: string,
    classConstructor: __private.__types_globals__Constructor<T>,
  ): [node: Node, component: T] {
    const node = this.getNode(path);
    if (!node) {
      return [null, null];
    }
    const component = node.addComponent(classConstructor);
    return [node, component];
  }

  /**
   * 获取节点上的节点以及其组件实例
   * @param path
   * @param classConstructor
   * @returns
   */
  public getNodeComponent<T extends Component>(
    path: string,
    classConstructor:
      | __private.__types_globals__Constructor<T>
      | __private.__types_globals__AbstractedConstructor<T>,
  ): [node: Node, component: T] {
    const node = this.getNode(path);
    if (!node) {
      return [null, null];
    }
    const component = node.getComponent(classConstructor);
    return [node, component];
  }

  /**
   * 根据路径获取组件
   * @param path
   * @param classConstructor
   * @returns
   */
  public getComponentByPath<T extends Component>(
    path: string,
    classConstructor:
      | __private.__types_globals__Constructor<T>
      | __private.__types_globals__AbstractedConstructor<T>,
  ): T {
    const node = this.getNode(path);
    if (!node) {
      return null;
    }
    const component = node.getComponent(classConstructor);
    return component;
  }

  /**
   * 添加按钮事件
   * @param path
   * @param callback
   * @returns
   */
  public addButtonClickEvent(
    path: string,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, button: Button] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, button] = this.getNodeComponent(path, Button);
    if (button) {
      button.clickEvents.push(
        NewEventHandler(
          targetNode,
          componentName,
          handlerName,
          customEventData,
        ),
      );
      return [node, button];
    }
    return [null, null];
  }

  /**
   * 设置按钮事件
   * @param path
   * @param eventIndex
   * @param handlerName
   * @param componentName
   * @param customEventData
   * @param targetNode
   * @returns
   */
  public setButtonClickEvent(
    path: string,
    eventIndex: number,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, button: Button] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, button] = this.getNodeComponent(path, Button);
    if (button) {
      button.clickEvents[eventIndex] = NewEventHandler(
        targetNode,
        componentName,
        handlerName,
        customEventData,
      );
      return [node, button];
    }
    return [null, null];
  }

  /**
   * 添加Toggle Click事件
   * @param path
   * @param handlerName
   * @param componentName
   * @param customEventData
   * @param targetNode
   * @returns
   */
  public addToggleClickEvent(
    path: string,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, toggle: Toggle] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, toggle] = this.getNodeComponent(path, Toggle);
    if (toggle) {
      toggle.clickEvents.push(
        NewEventHandler(
          targetNode,
          componentName,
          handlerName,
          customEventData,
        ),
      );
      return [node, toggle];
    }
    return [null, null];
  }

  /**
   * 设置Toggle Click事件
   * @param path
   * @param callback
   * @returns
   */
  public setToggleClickEvent(
    path: string,
    eventIndex: number,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, toggle: Toggle] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, toggle] = this.getNodeComponent(path, Toggle);
    if (toggle) {
      toggle.clickEvents[eventIndex] = NewEventHandler(
        targetNode,
        componentName,
        handlerName,
        customEventData,
      );
      return [node, toggle];
    }
    return [null, null];
  }

  /**
   * 添加Toggle Check事件 (每次check变更都会触发)
   * @param path
   * @param handlerName
   * @param componentName
   * @param customEventData
   * @param targetNode
   * @returns
   */
  public addToggleCheckEvent(
    path: string,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, toggle: Toggle] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, toggle] = this.getNodeComponent(path, Toggle);
    if (toggle) {
      toggle.checkEvents.push(
        NewEventHandler(
          targetNode,
          componentName,
          handlerName,
          customEventData,
        ),
      );
      return [node, toggle];
    }
    return [null, null];
  }

  /**
   * 设置Toggle Check事件 (每次check变更都会触发)
   * @param path
   * @param callback
   * @returns
   */
  public setToggleCheckEvent(
    path: string,
    eventIndex: number,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, toggle: Toggle] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, toggle] = this.getNodeComponent(path, Toggle);
    if (toggle) {
      toggle.checkEvents[eventIndex] = NewEventHandler(
        targetNode,
        componentName,
        handlerName,
        customEventData,
      );
      return [node, toggle];
    }
    return [null, null];
  }

  /**
   * 添加ToggleContainer Check事件
   * @param path
   * @param handlerName
   * @param componentName
   * @param customEventData
   * @param targetNode
   * @returns
   */
  public addToggleContainerCheckEvent(
    path: string,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, toggle: ToggleContainer] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, toggleContainer] = this.getNodeComponent(
      path,
      ToggleContainer,
    );
    if (toggleContainer) {
      toggleContainer.checkEvents.push(
        NewEventHandler(
          targetNode,
          componentName,
          handlerName,
          customEventData,
        ),
      );
      return [node, toggleContainer];
    }
    return [null, null];
  }

  /**
   * 设置ToggleContainer Check事件
   * @param path
   * @param callback
   * @returns
   */
  public setToggleContainerCheckEvent(
    path: string,
    eventIndex: number,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, toggle: ToggleContainer] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, toggleContainer] = this.getNodeComponent(
      path,
      ToggleContainer,
    );
    if (toggleContainer) {
      toggleContainer.checkEvents[eventIndex] = NewEventHandler(
        targetNode,
        componentName,
        handlerName,
        customEventData,
      );
      return [node, toggleContainer];
    }
    return [null, null];
  }

  /**
   * 添加滑动事件
   * @param path
   * @param handlerName
   * @param componentName
   * @param customEventData
   * @param targetNode
   * @returns
   */
  public addSlideEvent(
    path: string,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, slider: Slider] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, slider] = this.getNodeComponent(path, Slider);
    if (slider) {
      slider.slideEvents.push(
        NewEventHandler(
          targetNode,
          componentName,
          handlerName,
          customEventData,
        ),
      );
      return [node, slider];
    }
    return [null, null];
  }

  /**
   * 设置滑动事件
   * @param path
   * @param eventIndex
   * @param handlerName
   * @param componentName
   * @param customEventData
   * @param targetNode
   * @returns
   */
  public setSlideEvent(
    path: string,
    eventIndex: number,
    handlerName: string,
    componentName: string,
    customEventData?: any,
    targetNode?: Node,
  ): [node: Node, slider: Slider] {
    if (!targetNode) {
      targetNode = this.node;
    }
    const [node, slider] = this.getNodeComponent(path, Slider);
    if (slider) {
      slider.slideEvents[eventIndex] = NewEventHandler(
        targetNode,
        componentName,
        handlerName,
        customEventData,
      );
      return [node, slider];
    }
    return [null, null];
  }
}
