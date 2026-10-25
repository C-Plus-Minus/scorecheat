import '../instruments/midi-picker.js';

class ChoirSliders extends HTMLElement {
  _voices = {};

  set voices(value) {
    this._voices = value ?? {};
    this.render();
  }

  get voices() {
    return this._voices;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.isConnected) return;

    this.innerHTML = `
      <section class="mixer">
        <header class="header">
          <div>
            <h2>Voices</h2>
            <p>Score volume</p>
          </div>
          <span class="count">
            ${Object.keys(this._voices).length} PARTS
          </span>
        </header>

        <div class="voice-list">
          ${Object.entries(this._voices).map(([voice, assigned]) => `
            <div class="voice" data-voice="${voice}">
              <div class="voice-top">
                <span class="voice-name">
                  <span class="dot"></span>
                  <span class="voice-type">${voice}</span>
                  <midi-picker></midi-picker>
                </span>
                <span class="volume">${assigned.volume}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="127"
                value="${assigned.volume}"
                aria-label="${voice} volume"
              >
            </div>
          `).join("")}
        </div>
      </section>
    `;

    this.querySelectorAll(".voice").forEach(row => {
      const slider = row.querySelector("input");
      const display = row.querySelector(".volume");
      const picker = row.querySelector("midi-picker");

      const voice = row.dataset.voice;
      
      const update = () => {
        const absoluteVolume = Number(slider.value);
        const relativeVolume = Math.ceil(absoluteVolume / 127 * 100);

        display.textContent = `${relativeVolume}%`;
        slider.style.setProperty("--fill", `${relativeVolume}%`);
        this._voices[voice].volume = absoluteVolume;

        this.dispatchEvent(new CustomEvent("volume-change", {
          detail: {
            voice: voice,
            instrument: picker.value,
            volume: this._voices[voice].volume 
          },
          bubbles: true
        }));
      };

      // TODO: redesign -> mixed responsibilities
      slider.addEventListener("input", update);
      picker.addEventListener("change", update);
      update();
    });
  }
}

customElements.define("choir-sliders", ChoirSliders);

