// script.js

document.addEventListener('DOMContentLoaded', () => {
    const zipFileInput = document.getElementById('zipFileInput');
    const uploadButton = document.getElementById('uploadButton');
    const messageArea = document.getElementById('message-area');
    const displaySection = document.getElementById('display-section');
    const rawXmlDisplay = document.getElementById('rawXmlDisplay');
    const processButton = document.getElementById('processButton');
    
    let originalZipFile = null;
    let originalZipData = null;
    let extractedXmlContent = null;

    // --- File Input Setup ---
    
    uploadButton.addEventListener('click', () => {
        // Programmatically trigger the file picker
        zipFileInput.click();
    });

    zipFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            originalZipFile = file;
            // Reset the UI
            messageArea.textContent = '';
            displaySection.style.display = 'none';
            rawXmlDisplay.textContent = '';
            processButton.disabled = true;
            
            // Start processing the ZIP file
            processZipFile(file);
        } else {
            originalZipFile = null;
            messageArea.textContent = 'No file selected.';
        }
    });
    
    // --- Core ZIP Processing (Phase 1: Extraction) ---

    async function processZipFile(file) {
        messageArea.textContent = 'Reading and inspecting ZIP file...';
        uploadButton.disabled = true;
        
        try {
            // Use JSZip to load the file
            const zip = await JSZip.loadAsync(file);
            originalZipData = zip; // Store the full zip object for re-zipping later

            // 1. Validate and Extract score.xml
            const xmlFile = zip.file("score.xml");
            if (!xmlFile) {
                throw new Error("Required file 'score.xml' not found inside the ZIP archive.");
            }

            extractedXmlContent = await xmlFile.async("text");

            // 2. Update UI
            rawXmlDisplay.textContent = extractedXmlContent;
            messageArea.textContent = '✅ Success! XML loaded. You can now modify the raw text.';
            displaySection.style.display = 'block';
            processButton.disabled = false; // Enable modification steps
        } catch (error) {
            console.error("ZIP processing error:", error);
            messageArea.textContent = `❌ Error processing ZIP file: ${error.message}. Please ensure the file is valid and contains score.xml.`;
            displaySection.style.display = 'none';
        } finally {
            uploadButton.disabled = false;
        }
    }
    
    // --- Modification/Processing Trigger (Phase 1/2 Transition) ---

    async function generateModifiedZip() {
        if (!originalZipData) {
            messageArea.textContent = "Error: Please upload a ZIP file first.";
            return;
        }

        // 1. Get modified content from the editable area
        const modifiedContent = rawXmlDisplay.textContent;
        
        // 2. Store the modified content for the process
        originalZipData.modifiedXmlContent = modifiedContent;
        
        messageArea.textContent = 'Processing modifications and generating new archive...';
        processButton.disabled = true;

        try {
            // 3. Create the new ZIP object
            const outputZip = new JSZip();

            // 4. Copy all original files (except the original score.xml)
            for (const [fileName, file] of Object.entries(originalZipData.files)) {
                if (fileName !== 'score.xml') {
                    outputZip.file(fileName, file.async("bytestring"));
                }
            }
            
            // 5. Overwrite/Add the modified score.xml
            outputZip.file("score.xml", modifiedContent);

            // 6. Generate the Blob
            const content = await outputZip.generateAsync({ type: "blob" }, options);
            
            // 7. Trigger Download
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            // We append '_modified' to ensure the user knows this is the new version
            a.download = 'score_modified_archive.zip';
            a.click(); 
            URL.revokeObjectURL(url);

            messageArea.textContent = '🎉 Success! Downloaded modified ZIP archive. This contains your changes.';
            originalZipFile = null; // Clear state after successful download
            // Optional: Allow reloading the original file or resetting the state
            // For now, we keep the modified state displayed.
            
        } catch (e) {
            console.error("Zipping error:", e);
            messageArea.textContent = `❌ Fatal error during zipping process: ${e.message}`;
        } finally {
            processButton.disabled = false;
        }
    }

    // Attach the final button listener
    processButton.addEventListener('click', generateModifiedZip);
});