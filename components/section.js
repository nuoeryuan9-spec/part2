import { appendFragment, attr, optionalHtml, preserveChildren } from "./shared.js";

class StorySection extends HTMLElement {
  connectedCallback() {
    if (this.dataset.componentReady) return;

    const children = preserveChildren(this);
    const eyebrow = attr(this, "eyebrow");
    const title = attr(this, "title");
    const width = attr(this, "width") === "wide" ? "story-container--wide" : "story-container--narrow";

    this.innerHTML = `
      <section class="story-container ${width} section__inner">
        <header class="section__header">
          ${optionalHtml(eyebrow, (value) => `<p class="story-eyebrow">${value}</p>`)}
          ${optionalHtml(title, (value) => `<h2 class="section__title">${value}</h2>`)}
        </header>
        <div class="section__body"></div>
      </section>
    `;

    appendFragment(this, children, ".section__body");
    this.dataset.componentReady = "true";
  }
}

customElements.define("story-section", StorySection);
