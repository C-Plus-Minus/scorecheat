import "./sliders/sliders.js";

document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    button.addEventListener('click', pickFile);

    const fileInput = document.getElementById('fileInput');
    const messageArea = document.getElementById('message-area');
    fileInput.addEventListener(events.READ, async (event) => {
        decompress(event.detail.file)
            .then(content => {
                messageArea.textContent = `✅ Successfully read! ✅\n\n${content}`;
                processXml(content);
            })
            .catch(err => messageArea.textContent = `${err}`);
    });
    fileInput.addEventListener(events.CANCELLED, async (event) => {
        messageArea.textContent = 'File selection cancelled.';
        return;
    });
    fileInput.addEventListener(events.INVALID_FILE, async (event) => {
        messageArea.textContent = '⛔️ Please select a valid .capx file. ⛔️';
        return;
    });

    const sliders = document.querySelector("choir-sliders");
    sliders.addEventListener("volume-change", (event) => {
        const { voice, instrument, volume } = event.detail;
        console.log(voice.toUpperCase(), instrument.toUpperCase(), volume);
    });
        
});

const events = {
    CANCELLED: 'cancelled',
    INVALID_FILE: 'invalid',
    READ: 'read'
};

const pickFile = () => {
    const fileInput = document.getElementById('fileInput');
    
    fileInput.click(); // <-- triggers picker
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            fileInput.dispatchEvent(new CustomEvent(events.CANCELLED));
            return;
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.zip') && !fileName.endsWith('.capx')) {
            fileInput.dispatchEvent(new CustomEvent(events.INVALID_FILE));
            console.error(`Expected .(zip|capx) but got: ${file.name}`);
            return;
        }

        fileInput.dispatchEvent(new CustomEvent(events.READ, {detail: {file}}));
    });
};

const decompress = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (event) => {
            try {
                const bytes = event.target.result;
                const zip = await JSZip.loadAsync(bytes);

                const score = Object.values(zip.files).find(f => f.name === 'score.xml');
                if (!score) {
                    console.error(`Archive contains no score.xml:`, zip.files);
                    return reject('👾 On no! Unexpected alien format. 👾');
                }

                const decompressed = await score.async("string");
                return resolve(decompressed);
            } catch(e) {
                console.error('Decompression failed:', e);
                return reject(`⚡️ Unable to process the music sheet (${e.message}) ⚡️`);
            };
        };

        reader.onerror = (event) => {
            console.error("Failed to read buffer:", event.error);
            return reject('❌ Error reading the selected file. ❌');
        };
    });
}

const processXml = (xml) => {
     const score = new DOMParser().parseFromString(xml, "application/xml")
     const staffLayout = score.querySelectorAll('staffLayout');

     const voices = {};
     for(const s of staffLayout) {
        const instrument = s.querySelector('instrument');
        const name = instrument.getAttribute('name') || instrument.getAttribute('abbrev')

        const sound = s.querySelector('sound');
        const instr = sound.getAttribute('instr');
        const vol = sound.getAttribute('volume');

        sound.removeAttribute('sample');
        sound.removeAttribute('genericSound');
        sound.removeAttribute('DataID');

        voices[name] = {instrument: instr, volume: vol};

        // TODO:
        // create and connect slider
        // create and connect instrument
        // make update
        // write back stuff
     }

     const sliders = document.querySelector("choir-sliders");
     sliders.voices = voices;
}