import {MIDI} from './midi-instruments.js';

export class MidiPicker extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._value = 0;
    this._group = null;
  }

  get value() {
    return this._value;
  }

  set value(program) {
    if (Object.hasOwn(MIDI.Instruments, program)) {
      this._value = Number(program);
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const root = this.shadowRoot;
    const instruments = MIDI.Instruments;

    const groups = [...new Set(
      Object.values(instruments).map(i => i.group)
    )];

    const selected = instruments[this._value];

    root.innerHTML = `
      <style>
        :host {
          display: block;
          font: inherit;
        }

        button {
          display: block;
          width: 100%;
          min-height: 16px;
          padding: 12px 16px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: inherit;
          font: inherit;
          font-weight: lighter;
          text-align: left;
          cursor: pointer;
          outline: 0
        }

        button:hover {
          background: color-mix(in srgb, currentColor 8%, transparent);
        }

        button:focus-visible {
          outline: 2px solid Highlight;
          outline-offset: -2px;
        }

        .trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          /*border: 1px solid #8886;*/
        }

        dialog {
          box-sizing: border-box;
          width: min(420px, calc(100% - 32px));
          max-height: min(75dvh, 600px);
          padding: 12px;
          border: 1px solid #8885;
          border-radius: 14px;
          background: Canvas;
          color: CanvasText;
          overflow-y: auto;
        }

        dialog::backdrop {
          background: #0007;
        }

        h2 {
          margin: 8px 12px 12px;
          font-size: 1.1rem;
        }

        .back {
          margin-bottom: 8px;
          background: color-mix(in srgb, currentColor 6%, transparent);
        }

        .instrument {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .number {
          opacity: .6;
          font-size: .85em;
        }

        .selected {
          background: color-mix(in srgb, Highlight 15%, transparent);
          font-weight: 600;
        }

        @media (max-width: 480px) {
          dialog {
            position: fixed;
            width: 100%;
            max-width: none;
            max-height: 85dvh;
            margin: 0;
            inset: auto 0 0;
            border-radius: 16px 16px 0 0;
          }
        }
      </style>

      <button class="trigger" type="button">
        <span class="current"></span>
        <span aria-hidden="true">▾</span>
      </button>

      <dialog aria-label="Select MIDI instrument">
        <h2></h2>
        <div class="items"></div>
      </dialog>
    `;

    const dialog = root.querySelector('dialog');
    const heading = root.querySelector('h2');
    const list = root.querySelector('.items');
    const trigger = root.querySelector('.trigger');

    root.querySelector('.current').textContent =
      selected?.name ?? 'Select instrument';

    trigger.setAttribute('aria-haspopup', 'dialog');

    const button = (label, callback, className = '') => {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = label;
      el.className = className;
      el.addEventListener('click', callback);
      list.append(el);
      return el;
    };

    const showGroups = () => {
      this._group = null;
      heading.textContent = 'Choose category';
      list.replaceChildren();

      groups.forEach(group => {
        button(group, () => showInstruments(group));
      });
    };

    const showInstruments = group => {
      this._group = group;
      heading.textContent = group;
      list.replaceChildren();

      button('← All categories', showGroups, 'back');

      Object.entries(instruments)
        .filter(([, item]) => item.group === group)
        .forEach(([program, item]) => {
          const isSelected = Number(program) === this._value;
          const el = button(
            item.name,
            () => {
              this._value = Number(program);
              dialog.close();
              this.render();

              this.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                detail: {
                  program: Number(program),
                  name: item.name,
                  group: item.group
                }
              }));
            },
            `instrument${isSelected ? ' selected' : ''}`
          );

          const number = document.createElement('span');
          number.className = 'number';
          number.textContent = `${program}${isSelected ? ' ✓' : ''}`;
          el.append(number);
        });
    };

    trigger.addEventListener('click', () => {
      showGroups();
      trigger.setAttribute('aria-expanded', 'true');
      dialog.showModal();
    });

    dialog.addEventListener('close', () => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    // Prevent focus being lost when the dialog closes.
    dialog.addEventListener('close', () => trigger.focus());

    // Optional public API for opening the picker.
    this.open = () => {
      showGroups();
      dialog.showModal();
    };
  }
}

customElements.define('midi-picker', MidiPicker);
