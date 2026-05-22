import {
  __private,
  _decorator,
  Component,
  instantiate,
  Node,
  Prefab,
  UITransform,
  Vec3,
} from "cc";
import { SingletonComponent } from "../Common/SingletonComponent";
import { ResourceManager } from "./ResourceManager";
import { ComponentController } from "../Common/ComponentController";
import { BubbleMessageUI_Component } from "../UiScripts/Prefabs/Common/BubbleMessageUI_Component";
import { CircleLoadingUI_Component } from "../UiScripts/Prefabs/Common/CircleLoadingUI_Component";
import { DialogMessageUI_Component } from "../UiScripts/Prefabs/Dialog/DialogMessageUI_Component";
import { UI } from "../Types/typing";
import { DialogMsgCallbackUI_Component } from "../UiScripts/Prefabs/Dialog/DialogMsgCallbackUI_Component";
import { DialogInputUI_Component } from "../UiScripts/Prefabs/Dialog/DialogInputUI_Component";
import { DialogConfirmSmallUI_Component } from "../UiScripts/Prefabs/Dialog/DialogConfirmSmallUI_Component";
import { DialogMiniKeyboardUI_Component } from "../UiScripts/Prefabs/Dialog/DialogMiniKeyboardUI_Component";
import _ from "lodash";
import ClassNameGetter from "../Utils/ClassNameGetter";
const { ccclass, property } = _decorator;

/**
 * 组件管理类
 */
// @ccclass("ComponentManager")
export class ComponentManager extends SingletonComponent {
  private _canvas: Node = null;
  // UI视图映射
  private _uiMap: { [key: string]: Node } = {};

  // 单例
  static get Instance() {
    return super.GetInstance<ComponentManager>();
  }

  protected onLoad(): void {
    // 单例模式代码
    if (ComponentManager.GetInstance() === null) {
      ComponentManager.SetInstance(this);
    } else {
      this.destroy();
    }

    this._canvas = this.node;
    // this._canvas = find("Canvas");

    this._canvas.children?.forEach((element) => {
      this._uiMap[`${element.name}`] = element;
    });
  }

  /**
   * 挂载Ui节点
   * @param uiName UI节点名称
   * @param pkgName 所属包名
   * @param path 路径
   * @param constructor 组件构造函数
   * @param siblingTop 是否将节点渲染到最顶层
   * @param parentNode 父节点
   */
  public renderUiNode<T extends ComponentController>(
    uiName: string,
    pkgName: string,
    path: string,
    constructor: new (...args: any[]) => T,
    siblingTop: boolean = true,
    parentNode: Node | null = null,
  ): [node: Node, component: T, created: boolean | null] {
    const componentClassName =
      ClassNameGetter.getComponentClassName(constructor);

    let absUiName: string = "";
    if (!parentNode) {
      parentNode = this._canvas;
      absUiName = uiName;
    } else {
      absUiName = this.getNodeAbsoluteUiName(parentNode) + "/" + uiName;
    }

    if (this._uiMap[absUiName]) {
      // 处理渲染层级到最顶层
      siblingTop &&
        (this.setNodeSiblingTop(this._uiMap[absUiName], parentNode),
        (this._uiMap[absUiName].active = true));
      // console.log(
      //   `已有相同名称<${absUiName}>的UI节点！${
      //     siblingTop ? "已" : "不"
      //   }处理渲染层级到最顶层!`
      // );
      // // 打印信息
      // console.log(`uiMap-->`, this._uiMap);
      return [
        this._uiMap[absUiName],
        this._uiMap[absUiName].getComponent(componentClassName) as T,
        false,
      ];
    }

    // 获取预制体
    const prefab: Prefab = ResourceManager.Instance.getAsset(pkgName, path);
    if (prefab) {
      // 实例化预制体
      const node: Node = (this._uiMap[absUiName] = instantiate(prefab));
      try {
        // 添加组件
        const component = node.addComponent(componentClassName) as T;
        node.name = uiName;
        node.setPosition(0, 0, 0);
        // 挂载到父节点
        parentNode.addChild(node);
        // // 打印信息
        // console.log(`uiMap-->`, this.UIMap);
        return [node, component, true];
      } catch (error) {
        const err = error as Error;
        console.error(`[ComponentManager] Add component failed:${err.message}`);
        // 挂载到父节点
        parentNode.addChild(node);
        // // 打印信息
        // console.log(`uiMap-->`, this._uiMap);
        return [null, null, null];
      }
    } else {
      console.error(
        `[ComponentManager] Prefab not exist, pkgName: ${pkgName}, path: ${path}`,
      );
      // // 打印信息
      // console.log(`uiMap-->`, this._uiMap);
      return [null, null, null];
    }
  }

  /**
   * 获取节点绝对UiName路径
   * @param uiNode
   * @returns
   */
  public getNodeAbsoluteUiName(uiNode: Node): string {
    let path = uiNode.name;
    let currentNode = uiNode.parent;

    // 从当前节点向上遍历父节点
    while (currentNode && currentNode?.name != "Canvas") {
      path = currentNode.name + "/" + path;
      currentNode = currentNode.parent;
    }
    // 返回绝对路径
    return path;
  }

  /**
   * 获取节点
   * @param uiName
   * @returns
   */
  public getNode(uiName: string): Node {
    return this._uiMap[uiName];
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
   * 销毁节点
   * @param uiName
   */
  public destroyNodeByName(uiName: string) {
    const node = this._uiMap[uiName];
    if (node) {
      delete this._uiMap[uiName];
      node.active = false;
      node.destroy();

      for (let key in this._uiMap) {
        // 删除所有包含uiName的节点映射
        if (key.indexOf(`${uiName}/`) === 0) {
          delete this._uiMap[key];
        }
      }
    }
  }

  /**
   * 销毁节点
   * @param node
   */
  public destroyNode(node: Node) {
    if (node) {
      const absUiName = this.getNodeAbsoluteUiName(node);
      delete this._uiMap[absUiName];
      node.active = false;
      node.destroy();

      for (let key in this._uiMap) {
        // 删除所有包含uiName的节点映射
        if (key.indexOf(`${absUiName}/`) === 0) {
          delete this._uiMap[key];
        }
      }
    }
  }

  /**
   * 设置节点渲染层级到最顶层级
   * @param uiNode
   * @param parentNode
   */
  public setNodeSiblingTop(uiNode: Node, parentNode?: Node) {
    if (!parentNode) {
      parentNode = this.node;
    }
    const activedNodes = _.filter(
      parentNode.children,
      (child) => child.active === true,
    );
    const siblingIndex = _.maxBy(activedNodes, (child) =>
      child.getSiblingIndex(),
    ).getSiblingIndex();

    const uiNodeSiblingIndex = uiNode.getSiblingIndex();
    if (uiNodeSiblingIndex < siblingIndex) {
      uiNode.setSiblingIndex(siblingIndex + 1);
    }
  }

  /**
   * 节点坐标转换
   * @param targetNode
   * @param parentNode
   * @returns
   */
  public getRelativePosition(targetNode: Node, parentNode: Node) {
    const uiTransformParent = parentNode.getComponent(UITransform);
    if (!uiTransformParent) {
      return Vec3.ZERO;
    }

    // 将目标节点的世界坐标转换为新父节点的本地坐标
    return uiTransformParent.convertToNodeSpaceAR(targetNode.worldPosition);
  }
}
