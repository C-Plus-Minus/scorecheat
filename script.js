document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    const fileInput = document.getElementById('fileInput');
    const messageArea = document.getElementById('message-area');

    const openFilePicker = () => fileInput.click();

    button.addEventListener('click', openFilePicker);

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            messageArea.textContent = 'File selection cancelled.';
            return;
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.zip') && !fileName.endsWith('.capx')) {
            messageArea.textContent = '⛔️ Please select a valid .capx file. ⛔️';
            return;
        }

        messageArea.textContent = `Reading ${fileName}...`;
        
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