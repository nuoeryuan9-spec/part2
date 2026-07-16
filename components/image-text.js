import { appendFragment, attr, escapeHtml, optionalHtml, preserveChildren } from "./shared.js";

class StoryImageText extends HTMLElement {
  connectedCallback() {
    if (this.dataset.componentReady) return;

    const children = preserveChildren(this);
    const image = attr(this, "image");
    const alt = attr(this, "alt");
    const eyebrow = attr(this, "eyebrow");
    const title = attr(this, "title");
    const reverse = attr(this, "reverse") === "true";
    const media = image
      ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy">`
      : "";

    if (image) {
      this.style.setProperty("--image-text-media", `url("${image}")`);
    }

    this.innerHTML = `
      <section class="story-container story-container--wide image-text" data-reverse="${reverse}">
        <figure class="image-text__media">${media}</figure>
        <div class="image-text__content">
          ${optionalHtml(eyebrow, (value) => `<p class="story-eyebrow">${value}</p>`)}
          ${optionalHtml(title, (value) => `<h2 class="section__title">${value}</h2>`)}
        </div>
      </section>
    `;

    appendFragment(this, children, ".image-text__content");
    this.dataset.componentReady = "true";
  }
}

customElements.define("story-image-text", StoryImageText);
