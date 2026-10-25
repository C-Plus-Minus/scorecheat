import "./sliders/sliders.js";

document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    button.addEventListener('click', pickFile);

    const fileInput = document.getElementById('fileInput');
    const messageArea = document.getElementById('message-area');

    let scoreXml;

    fileInput.addEventListener(events.READ, async (event) => {
        decompress(event.detail.file)
            .then(content => {
                scoreXml = content;
                messageArea.textContent = `✅ Successfully read! ✅`;                
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
        const modifiedXml = modifyXML(scoreXml, voice, instrument, volume)

        // TODO: 
        //  1. Read MD5 hash of original file
        //  2. Create copy of original file: `<original file name>_<ISO8601 timestamp>.capx`
        //  3. Compare original MD5 to copy MD5
        //  4. If error, retry steps 1. through 3.
        //  5. Otherwise, overwrite original score.xml (NOT the copy!) with our modified score.xml
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
     }

     const sliders = document.querySelector("choir-sliders");
     sliders.voices = voices;
}

const modifyXML = (xml, voice, newInstrument, newVolume) => {
     const score = new DOMParser().parseFromString(xml, "application/xml")
     const staffLayout = score.querySelectorAll('staffLayout');

     const voices = {};
     for(const s of staffLayout) {
        const instrument = s.querySelector('instrument');
        // TODO: check if the right voice, otherwise else continue to next loop

        const sound = s.querySelector('sound');
        const instr = sound.setAttribute('instr', newInstrument);
        const vol = sound.setAttribute('volume', newVolume);

        sound.removeAttribute('sample');
        sound.removeAttribute('genericSound');
        sound.removeAttribute('DataID');
     }

     return staffLayout;
}