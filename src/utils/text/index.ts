import { isString, includes } from '@ntks/toolbox';

function copyText(content: string): string {
  const ipt = document.createElement('input');

  ipt.setAttribute('value', content);
  document.body.appendChild(ipt);
  ipt.select();
  document.execCommand('copy');
  document.body.removeChild(ipt);

  return content;
}

export function copy(content: any, keepSelected?: boolean): void | string {
  let $el;

  if (!isString(content)) {
    $el = $(content);

    const el = $el.get(0);

    if (el == null || el.nodeType !== 1) {
      return;
    }

    if (includes(el.tagName.toLowerCase(), ['input', 'textarea'])) {
      content = $el.val();
    } else {
      content = $el.text();
    }
  }

  copyText(content);

  // 将被复制文本的区域保持选中状态
  if ($el && keepSelected === true) {
    $el.select();
  }

  return content;
}
