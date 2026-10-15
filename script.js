document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    const fileInput = document.getElementById('fileInput');
    const messageArea = document.getElementById('message-area');

    button.addEventListener('click', pickFile);

    fileInput.addEventListener(events.CANCELLED, async (event) => {
        messageArea.textContent = 'File selection cancelled.';
        return;
    });

    fileInput.addEventListener(events.INVALID_FILE, async (event) => {
        messageArea.textContent = '⛔️ Please select a valid .capx file. ⛔️';
        return;
    });
    
    fileInput.addEventListener(events.READ, async (event) => {
        const file = event.detail.file;
        decompress(file)
            .then(xml => messageArea.textContent = `✅ Successfully read! ✅\n\n${xml}`)
            .catch(err => messageArea.textContent = `${err}`);
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