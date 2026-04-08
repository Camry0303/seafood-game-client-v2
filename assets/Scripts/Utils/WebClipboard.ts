/**
 * 网页剪切板
 */
export default class WebClipboard {
  /**
   * 复制文本
   * @param text
   */
  public static async copyTextToClipboard(text: string) {
    if (!text) {
      return;
    }
    // 创建一个临时的textarea元素，将文本放入其中
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    // 选中文本
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    try {
      // 尝试执行复制操作
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Unable to copy text to clipboard");
    }
    // 移除临时元素
    document.body.removeChild(textarea);
  }
}
