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
        messageArea.textContent = `Reading ${file.name}...`;

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (event) => {
            const bytes = event.target.result;
            
            try {
                const zip = await JSZip.loadAsync(bytes);
                const score = Object.values(zip.files).find(f => f.name === 'score.xml');
                if (!score) {
                    messageArea.textContent = '👾 On no! Unexpected alien format. 👾';
                    return;
                }

                const content = await score.async("string");
                messageArea.textContent = `✅ Successfully read! ✅`;
                console.log(content)
            } catch(e) {
                console.error('Extraction failed:', e);
                messageArea.textContent = `⚡️ Unable to process the music sheet (${e.message}) ⚡️`;
            };
        };

        reader.onerror = (event) => {
            console.error("Error reading file:", event.error);
            messageArea.textContent = '❌ Error reading the selected file. ❌';
        };
    });
        
});

const events = {
    CANCELLED: 'cancelled',
    INVALID_FILE: 'invalid',
    READ: 'read'
};

const pickFile = () => {
    const fileInput = document.getElementById('fileInput');

    fileInput.click();

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            fileInput.dispatchEvent(new CustomEvent(events.CANCELLED));
            return;
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.zip') && !fileName.endsWith('.capx')) {
            fileInput.dispatchEvent(new CustomEvent(events.INVALID_FILE));
            return;
        }

        fileInput.dispatchEvent(new CustomEvent(events.READ, {detail: {file}}));
    });
};