import { appendFragment, attr, optionalHtml, preserveChildren } from "./shared.js";

class StoryEnding extends HTMLElement {
  connectedCallback() {
    if (this.dataset.componentReady) return;

    const children = preserveChildren(this);
    const title = attr(this, "title");

    this.innerHTML = `
      <section class="story-container story-container--wide ending">
        ${optionalHtml(title, (value) => `<h2 class="ending__title">${value}</h2>`)}
        <div class="ending__body"></div>
      </section>
    `;

    appendFragment(this, children, ".ending__body");
    this.dataset.componentReady = "true";
  }
}

customElements.define("story-ending", StoryEnding);
