import { Component, Node } from "cc";

/**
 * 新建事件处理器
 * @param node
 * @param componentName
 * @param handlerName
 * @param customEventData
 * @returns
 */
export function NewEventHandler(
  node: Node,
  componentName: string,
  handlerName: string,
  customEventData?: any
) {
  const evh = new Component.EventHandler();
  evh.target = node;
  evh.component = componentName;
  evh.handler = handlerName;
  if (customEventData) {
    evh.customEventData = customEventData;
  }
  return evh;
}
