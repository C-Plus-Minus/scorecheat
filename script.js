import "./sliders/sliders.js";

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("simpleButton");
    const fileInput = document.getElementById("fileInput");
    const messageArea = document.getElementById("message-area");
    const downloadButton = document.getElementById("downloadButton");
    const sliders = document.querySelector("choir-sliders");

    let originalZip = null;
    let scoreXml = null;
    let scorePath = null;
    let originalFileName = "modified-score.capx";

    const events = {
        CANCELLED: "cancelled",
        INVALID_FILE: "invalid",
        READ: "read"
    };

    // Open the file picker.
    button.addEventListener("click", pickFile);

    // Handle file selection events.
    fileInput.addEventListener(events.READ, async (event) => {
        try {
            const result = await decompress(event.detail.file);

            originalZip = result.zip;
            scoreXml = result.scoreXml;
            scorePath = result.scorePath;

            originalFileName = event.detail.file.name.replace(
                /\.(capx|zip)$/i,
                ""
            ) + "-modified.capx";

            processXml(scoreXml);

            messageArea.textContent = "✅ Successfully read!";
        } catch (err) {
            messageArea.textContent = err.message;
            console.error(err);
        }
    });

    fileInput.addEventListener(events.CANCELLED, () => {
        messageArea.textContent = "File selection cancelled.";
    });

    fileInput.addEventListener(events.INVALID_FILE, () => {
        messageArea.textContent =
            "⛔️ Please select a valid .capx or .zip file.";
    });

    // Apply GUI changes to the current XML.
    sliders.addEventListener("volume-change", (event) => {
        if (!scoreXml) {
            messageArea.textContent = "Please load a score first.";
            return;
        }

        const { voice, instrument, volume } = event.detail;

        try {
            scoreXml = modifyXML(
                scoreXml,
                voice,
                instrument,
                volume
            );

            messageArea.textContent = `✅ Updated ${voice}`;
        } catch (err) {
            console.error("XML modification failed:", err);
            messageArea.textContent = `❌ ${err.message}`;
        }
    });

    // Download the modified archive.
    downloadButton.addEventListener("click", async () => {
        if (!originalZip || !scoreXml || !scorePath) {
            messageArea.textContent =
                "❌ Please load a .capx file first.";
            return;
        }

        downloadButton.disabled = true;

        try {
            await downloadCapx();

            messageArea.textContent =
                "✅ Modified .capx downloaded!";
        } catch (err) {
            console.error("Download failed:", err);
            messageArea.textContent =
                `❌ Download failed: ${err.message}`;
        } finally {
            downloadButton.disabled = false;
        }
    });

    // Trigger the file picker.
    function pickFile() {
        // Prevent accumulating change listeners on repeated clicks.
        fileInput.click();
    }

    // Handle the native file input directly.
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            fileInput.dispatchEvent(
                new CustomEvent(events.CANCELLED)
            );
            return;
        }

        const fileName = file.name.toLowerCase();

        if (
            !fileName.endsWith(".capx") &&
            !fileName.endsWith(".zip")
        ) {
            fileInput.dispatchEvent(
                new CustomEvent(events.INVALID_FILE)
            );
            return;
        }

        fileInput.dispatchEvent(
            new CustomEvent(events.READ, {
                detail: { file }
            })
        );

        // Allow selecting the same file again later.
        fileInput.value = "";
    });

    // Read the archive and extract score.xml.
    async function decompress(file) {
        try {
            const bytes = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(bytes);

            const score = Object.values(zip.files).find(
                file =>
                    !file.dir &&
                    file.name.split("/").pop() === "score.xml"
            );

            if (!score) {
                throw new Error(
                    "The archive does not contain score.xml."
                );
            }

            const xml = await score.async("string");

            return {
                zip,
                scoreXml: xml,
                scorePath: score.name
            };
        } catch (err) {
            throw new Error(
                `⚡️ Unable to process the music sheet: ${err.message}`
            );
        }
    }

    // Extract instrument and volume information for the GUI.
    function processXml(xml) {
        const score = new DOMParser().parseFromString(
            xml,
            "application/xml"
        );

        if (score.querySelector("parsererror")) {
            throw new Error("Invalid score.xml.");
        }

        const staffLayout =
            score.querySelectorAll("staffLayout");

        const voices = {};

        for (const staff of staffLayout) {
            const instrument =
                staff.querySelector("instrument");

            const sound = staff.querySelector("sound");

            if (!instrument || !sound) continue;

            const name =
                instrument.getAttribute("name") ||
                instrument.getAttribute("abbrev");

            if (!name) continue;

            voices[name] = {
                instrument: sound.getAttribute("instr"),
                volume: sound.getAttribute("volume")
            };
        }

        sliders.voices = voices;
    }

    // Modify only the selected voice and return the full XML string.
    function modifyXML(xml, voice, newInstrument, newVolume) {
        const score = new DOMParser().parseFromString(
            xml,
            "application/xml"
        );

        if (score.querySelector("parsererror")) {
            throw new Error("Invalid score.xml.");
        }

        const staffLayout =
            score.querySelectorAll("staffLayout");

        let found = false;

        for (const staff of staffLayout) {
            const instrument =
                staff.querySelector("instrument");

            if (!instrument) continue;

            const name =
                instrument.getAttribute("name") ||
                instrument.getAttribute("abbrev");

            if (name !== voice) continue;

            const sound = staff.querySelector("sound");

            if (!sound) continue;

            sound.setAttribute(
                "instr",
                String(newInstrument)
            );

            sound.setAttribute(
                "volume",
                String(newVolume)
            );

            sound.removeAttribute("sample");
            sound.removeAttribute("genericSound");
            sound.removeAttribute("DataID");

            found = true;
        }

        if (!found) {
            throw new Error(
                `Could not find a matching voice: ${voice}`
            );
        }

        return new XMLSerializer().serializeToString(score);
    }

    // Replace score.xml and download the new archive.
    async function downloadCapx() {
        originalZip.file(scorePath, scoreXml);

        const blob = await originalZip.generateAsync({
            type: "blob",
            mimeType: "application/zip"
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = originalFileName;

        document.body.appendChild(link);
        link.click();
        link.remove();

        // Release the temporary URL after the browser starts downloading.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
});
