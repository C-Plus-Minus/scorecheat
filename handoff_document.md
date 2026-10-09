## Project Handover Document: XML Viewer/Editor PWA

### 🎯 Project Goal
To develop a Progressive Web Application (PWA) for iPhone that allows users to upload a ZIP archive, extract a specific XML file (`score.xml`), view its contents as raw text, allow the user to edit the text, and finally generate a new ZIP archive containing the modified `score.xml` while preserving the original ZIP structure.

### 🏗️ Scope & Features (Phase 1 - MVP)

#### 1. User Experience (UX)
*   **Interface:** Clean, modern web design optimized for mobile viewing (PWA).
*   **File Input:** Implement robust file handling via the browser's system file picker (upload button/drag-and-drop).
*   **Visual Flow:** Upload ZIP $\rightarrow$ Extract/Validate $\rightarrow$ Display/Edit $\rightarrow$ Process/Download.
*   **State Management:** Must handle loading, success, and error states gracefully.

#### 2. Core Functionality
*   **ZIP Handling:**
    *   Accept ZIP file input.
    *   Use JavaScript/library (e.g., JSZip) to read and archive contents.
    *   **Extraction:** Specifically locate and extract the content of `score.xml`.
*   **Parsing/Display:**
    *   The extracted `score.xml` content must be displayed as raw, formatted text (`<pre>` tag highly recommended).
    *   No automatic XML parsing, transformation, or structural validation is required initially (skip parsing for now).
*   **Editing:**
    *   A content-editable area will be provided, allowing users to modify the raw text content of the displayed XML.
*   **Error Handling:**
    *   Implement checks for:
        *   File corruption (ZIP cannot be read).
        *   Required file missing (e.g., `score.xml` not found inside the ZIP).
        *   Invalid XML structure (if potential parsing or basic validation is added later).
    *   User-friendly error messages are mandatory.
*   **Output Generation:**
    *   **Modification:** Collect the modified text from the editable field.
    *   **Archiving:** Generate a **new**, client-side downloadable ZIP file.
    *   The new ZIP must contain:
        *   The modified `score.xml` content.
        *   All other original files from the input ZIP (preserving the original structure).

### 🚧 Future Considerations (Phase 2+)
*   Implementing specialized data manipulation widgets (dropdowns, sliders) for structured input (e.g., instrument per voice, velocity).
*   Advanced data validation and pre-processing logic before export.
*   Adding functionality to submit the modified data to a remote API endpoint.

### 🛠️ Technical Considerations
*   **Platform:** PWA compatible (ideal for iPhone/mobile browser usage).
*   **Hosting:** Initially planned for GitHub Pages (Static Hosting).
*   **Technology Stack Suggestion:** HTML, CSS, JavaScript. A library like `JSZip` will be essential for ZIP handling.

---
**End of Document**"