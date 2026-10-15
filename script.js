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
                
                // Find and extract the content of all score.xml files
                const scoreFiles = Object.values(zip.files).filter(f => f.name === 'score.xml');

                if (scoreFiles.length === 0) {
                    console.log('--- Beginning Directory Scan ---');
                    console.log('No score.xml files found.');
                    messageArea.textContent = '✅ Success! No score.xml files were found to extract.';
                    return;
                }

                console.log('--- Beginning Score XML Extraction ---');

                // Extract content of all found score.xml files concurrently
                const extractionPromises = scoreFiles.map(async (file) => {
                    try {
                        const content = await file.async("string");
                        return { name: file.name, content: content };
                    } catch (e) {
                        console.error(`Error extracting ${file.name}:`, e);
                        return { name: file.name, content: `[ERROR during extraction: ${e.message}]` };
                    }
                });

                Promise.all(extractionPromises).then(extractedScores => {
                    console.log('================================');
                    console.log(`Extraction Complete. Processed ${extractedScores.length} file(s).`);
                    console.log('--- Extracted XML Content ---');

                    let combinedContent = extractedScores.map(s => 
                        `--- START FILE: ${s.name} ---\n${s.content}\n--- END FILE: ${s.name} ---\n`
                    ).join('\n');

                    console.log(combinedContent);

                    // Final update to message area
                    messageArea.textContent = `✅ Success! Extracted and processed ${extractedScores.length} file(s). Content logged to console.`;
                }).catch(e => {
                    console.error('Fatal error during batch extraction:', e);
                    messageArea.textContent = `❌ Fatal Error during extraction: ${e.message}. Check console for details.`;
                });
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