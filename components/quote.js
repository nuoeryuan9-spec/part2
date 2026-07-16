import { appendFragment, attr, escapeHtml, optionalHtml, preserveChildren } from "./shared.js";

class StoryQuote extends HTMLElement {
  connectedCallback() {
    if (this.dataset.componentReady) return;

    const children = preserveChildren(this);
    const text = attr(this, "text");
    const cite = attr(this, "cite");

    this.innerHTML = `
      <figure class="quote">
        <blockquote class="quote__text">${escapeHtml(text)}</blockquote>
        ${optionalHtml(cite, (value) => `<figcaption class="quote__cite">${value}</figcaption>`)}
      </figure>
    `;

    appendFragment(this, children, ".quote__text");
    this.dataset.componentReady = "true";
  }
}

customElements.define("story-quote", StoryQuote);
