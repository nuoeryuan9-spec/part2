export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function attr(element, name) {
  return element.getAttribute(name) || "";
}

export function optionalHtml(value, renderer) {
  return value ? renderer(escapeHtml(value)) : "";
}

export function preserveChildren(element) {
  const fragment = document.createDocumentFragment();

  while (element.firstChild) {
    fragment.append(element.firstChild);
  }

  return fragment;
}

export function appendFragment(target, fragment, selector) {
  const host = target.querySelector(selector);

  if (host && fragment.hasChildNodes()) {
    host.append(fragment);
  }
}
