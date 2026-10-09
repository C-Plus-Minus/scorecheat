## Development Session Plan

**Project:** XML Viewer/Editor PWA
**Goal:** Build a Minimum Viable Product (MVP) that handles ZIP upload, text display, editing, and constrained re-zipping.
**Target Environment:** PWA running on GitHub Pages.
**Estimated Time:** 3-5 hours (depending on initial setup time).

### 🧪 Phase 1: Setup and Core Architecture (Session 1)

**Objective:** Establish the foundation, file reading, and display components.

1.  **Project Initialization:**
    *   Set up the basic HTML/CSS/JS structure (`index.html`, `style.css`, `script.js`).
    *   Configure the project for PWA functionality (e.g., basic `manifest.json` and `service-worker.js`).
2.  **File Input Handling:**
    *   Implement the file input UI (Upload button).
    *   Write the event listener to capture the user's selected ZIP file (`<input type="file">`).
3.  **ZIP Reading and Validation (Client-Side):**
    *   Install and implement the ZIP library (e.g., `JSZip`).
    *   Implement `handleZipUpload(file)` function.
    *   Test 1: Successful ZIP read and structure inspection.
    *   Test 2: Error handling for invalid/corrupted ZIPs.
4.  **XML Extraction and Display:**
    *   Extract `score.xml` content using the library.
    *   Display the raw text content in a sanitized, editable `<textarea>` or `<div>`.

### 🔧 Phase 2: Modification and Output (Session 2)

**Objective:** Implement the core logic for editing and generating the modified archive.

1.  **Editing Logic:**
    *   Attach an input change listener to the display element.
    *   Capture the modified text content.
2.  **Output Generation (The Core Logic):**
    *   Create a function `generateModifiedZip(originalZip, modifiedXmlContent)`.
    *   This function must:
        *   Create a new ZIP instance.
        *   Copy *all* assets from the `originalZip` into the new ZIP.
        *   Overwrite/Add the modified `score.xml` to the new ZIP.
        *   Generate a Blob/file object from the resulting ZIP data.
3.  **User Download:**
    *   Trigger a download link for the newly generated ZIP file.
4.  **Refinement & Testing:**
    *   A/B testing: Verify that the new downloaded zip only differs from the original in `score.xml`.
    *   Final error handling polish.

### ✅ Next Steps
*   Begin with Phase 1 and report back on progress, or if any architectural decisions need adjustment.
***
**End of Plan**