import { appendFragment, attr, optionalHtml, preserveChildren } from "./shared.js";

class StoryHero extends HTMLElement {
  connectedCallback() {
    if (this.dataset.componentReady) return;

    const children = preserveChildren(this);
    const image = attr(this, "image");
    const credit = attr(this, "credit");
    const eyebrow = attr(this, "eyebrow");
    const title = attr(this, "title");
    const dek = attr(this, "dek");
    const meta = attr(this, "meta");

    if (image) {
      this.style.setProperty("--hero-image", `url("${image}")`);
    }

    this.innerHTML = `
      <div class="story-container story-container--wide hero__inner">
        <div class="hero__content">
          ${optionalHtml(eyebrow, (value) => `<p class="story-eyebrow">${value}</p>`)}
          ${optionalHtml(title, (value) => `<h1 class="story-title">${value}</h1>`)}
          ${optionalHtml(dek, (value) => `<p class="story-dek">${value}</p>`)}
          ${optionalHtml(meta, (value) => `<p class="story-meta">${value}</p>`)}
        </div>
        ${optionalHtml(credit, (value) => `<div class="hero__media-credit">${value}</div>`)}
      </div>
    `;

    appendFragment(this, children, ".hero__content");
    this.dataset.componentReady = "true";
  }
}

customElements.define("story-hero", StoryHero);
