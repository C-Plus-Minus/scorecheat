// script.js
document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('simpleButton');
    const fileInput = document.getElementById('fileInput');
    const messageArea = document.getElementById('message-area');

    // 1. Setup Button Click Listener
    button.addEventListener('click', () => {
        // Programmatically trigger the hidden file input to open the file picker
        fileInput.click();
    });

    // 2. Setup File Input Change Listener
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (!file) {
            messageArea.textContent = 'File selection cancelled.';
            return;
        }

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.zip') && !fileName.endsWith('.capx')) {
            messageArea.textContent = 'Error: Please select a valid .zip or .capx file.';
            alert('Please select a ZIP archive.');
            return;
        }
        
        // Prepare for reading
        messageArea.textContent = `Reading ${fileName}...`;

        // Use FileReader to load the file into an ArrayBuffer
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async (event) => {
            const buffer = event.target.result;
            
            try {
                // 1. Load the ArrayBuffer into JSZip
                const zip = await JSZip.loadAsync(buffer);
                
                // 2. List all files using the correct for...of loop structure
                const fileNames = [];
                console.log('--- Beginning Directory Scan ---'); 
                
                // CORRECT FIX: JSZip provides file(regex) which is an iterable object itself.
                try {
                    const fileCollection = zip.file(generateFileList);
                    for (const relativePath of fileCollection) {
                        if (relativePath) {
                            fileNames.push(relativePath);
                            console.log(`[DIRECTORY] Found file: ${relativePath}`); 
                        }
                    }
                } catch (e) {
                    console.error("Error during file collection iteration:", e);
                    console.error("Falling back to directory structure error.");
                    // Fallback handling if the simple iterator fails
                    const files = Object.keys(zip.files);
                    for (const file of files) {
                        // A simple filter if we suspect the regex search failed fundamentally
                        if (file.includes('score.xml')) {
                             fileNames.push(file);
                             console.log(`[DIRECTORY] Fallback found file: ${file}`);
                        }
                    }
                }


                // 3. Display results
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