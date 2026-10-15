document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    const fileInput = document.getElementById('fileInput');
    const messageArea = document.getElementById('message-area');

    // Triggers hidden file input to open file picker
    button.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (!file) {
            messageArea.textContent = 'File selection cancelled.';
            return;
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.zip') && !fileName.endsWith('.capx')) {
            messageArea.textContent = 'Error: Please select a valid .zip or .capx file.';
            return;
        }

        messageArea.textContent = `Reading ${fileName}...`;
        
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (event) => {
            const bytes = event.target.result;
            
            try {
                const zip = await JSZip.loadAsync(bytes);
                
                const fileNames = [];
                console.log('--- Beginning Directory Scan ---'); 
                const score = Object.values(zip.files).filter(f => f.name === 'score.xml');
                console.log('score:', score);

                console.log('================================'); 
                console.log(`Scan Complete. Total files found: ${fileNames.length}`);
                console.log('================================');

                messageArea.textContent = `✅ Success! Found ${fileNames.length} file(s) matching 'score.xml'. Names logged to console.`;
            } catch(e) {
                console.error('Error processing ZIP file:', e);
                messageArea.textContent = `❌ Error: Could not process the archive. (${e.message})`;
            }
        };

        reader.onerror = (event) => {
            console.error("Error reading file:", event.error);
            messageArea.textContent = '❌ Error reading the selected file.';
        };
    });
});

/**
 * Defines the pattern for files to search within the ZIP archive.
 * We only want files named 'score.xml'.
 */
function generateFileList() {
    // Using a regex pattern to ensure we only match files named score.xml
    return /score\.xml/;
}