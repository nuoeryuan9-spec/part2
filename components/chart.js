import { appendFragment, attr, escapeHtml, optionalHtml, preserveChildren } from "./shared.js";

class StoryChart extends HTMLElement {
  connectedCallback() {
    if (this.dataset.componentReady) return;

    const children = preserveChildren(this);
    const title = attr(this, "title");
    const deck = attr(this, "deck");
    const src = attr(this, "src");
    const note = attr(this, "note");
    const height = attr(this, "height");
    const hasHeader = title || deck;
    const header = hasHeader
      ? `
        <header class="chart-frame__header">
          ${optionalHtml(title, (value) => `<h2 class="chart-frame__title">${value}</h2>`)}
          ${optionalHtml(deck, (value) => `<p class="chart-frame__deck">${value}</p>`)}
        </header>
      `
      : "";
    const embed = src
      ? `<iframe class="chart-frame__embed" src="${escapeHtml(src)}" title="${escapeHtml(title || "chart")}" loading="lazy"></iframe>`
      : `<div class="chart-frame__embed" role="presentation"></div>`;

    this.innerHTML = `
      <section class="story-container story-container--wide chart-frame">
        ${header}
        ${embed}
        <div class="chart-frame__note">
          ${optionalHtml(note, (value) => `<p>${value}</p>`)}
        </div>
      </section>
    `;

    if (height) {
      this.querySelector(".chart-frame__embed")?.style.setProperty("min-height", height);
    }

    appendFragment(this, children, ".chart-frame__note");
    this.dataset.componentReady = "true";
  }
}

customElements.define("story-chart", StoryChart);
