# Compare and Configure Editable Regions

## Introduction

Compare and Configure Editable Regions is a React + ASP.NET Core sample that
demonstrates two Document Editor workflows using the Syncfusion<sup
style="font-size:70%">&reg;</sup>
[React DOCX Editor](https://www.syncfusion.com/docx-editor-sdk/react-docx-editor?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples)
(Document Editor):

1. **Compare Documents** — side-by-side comparison of two DOCX/SFDT files,
   with a server-side comparison that produces a result document containing
   tracked revisions, change summary navigation, and an accept/reject audit
   history.
2. **Document Protection** — configuring user-scoped editable regions in a
   protected document, highlighting who can edit what, and importing PDF or
   image files which are converted to editable Word content before being
   opened in the editor.

The sample is designed for organizations that need to review document
revisions between authors, and to lock down documents so that only specific
users can edit specific regions — for example contracts, SOPs, or legal
templates reviewed by engineers and managers.

Users can:

-   Load two documents (original and revised) into side-by-side editors.
-   Run a word-by-word comparison on the server and open the result, with
   every difference recorded as a tracked revision.
-   Toggle revision visibility and navigate a **Change Summary** of all
   differences.
-   Accept or reject revisions, with each decision logged into a **Revision
   Audit History** panel (user, action, content).
-   Switch the current user (engineer / manager) in the protection demo.
-   Insert editable regions over a selection for a specific user and
   highlight all editable ranges in the document.
-   Open a PDF or image file — the server converts it to an editable Word
   document (via Smart Data Extraction) and opens the result in the editor.

## Key Features

### Compare Documents

The **Compare Documents** page hosts two `DocumentEditorContainer` instances
side by side. After selecting an original and a revised DOCX/SFDT file:

-   **Compare documents** uploads both files to the server. The server uses
   DocIO `WordDocument.Compare` to produce a result document in which every
   difference (insertions, deletions, formatting changes) is recorded as a
   tracked revision attributed to the configured author and timestamp.
-   The comparison result opens in the right-hand editor with revisions
   visible.
-   **Show/Hide revisions** toggles the tracked-changes marks in the result
   editor.
-   The **Change Summary** panel lists each revision found in the result
   document so reviewers can jump straight to the changes.
-   **Revision Audit History** — every accept/reject action performed on a
   revision is logged with the author, the action taken, and the affected
   text content.
-   Files can be `.docx` (converted to SFDT via the `Import` endpoint) or
   `.sfdt` (opened directly).

### Document Protection and Editable Regions

The **Document Protection** page opens a Word-like editor pre-loaded with a
sample protected document:

-   The **current user** can be switched between
    `engineer@mycompany.com` and `manager@mycompany.com` from the title bar.
-   **Insert editable region** covers the current selection with an editing
   region that only the currently selected user can edit.
-   Editable ranges are **highlighted** in the editor so it is visually
   clear which parts of the document each user may change.
-   The document itself is protected — users cannot edit outside their own
   editable regions.

### PDF and Image to Word Import

The protection page also exposes an **Open PDF/Image** button:

-   The selected `.pdf` / `.jpg` / `.png` file is uploaded to the
    `ImportFromPdfOrImage` endpoint.
-   The server uses the Syncfusion **Smart Data Extractor** to convert the
    PDF or image into an editable Word document (preserving layout, tables,
    images, and text styles where supported).
-   The extracted Word content is converted to SFDT and opened directly in
    the Document Editor for further editing.

## Architecture

The sample consists of two applications:

- **ASP.NET Core Web API** (`Server-Side/`) — .NET 10, minimal hosting
  model. Hosts the Document Editor web services (import, save, spell check,
  clipboard, PDF/image conversion, document comparison) used by both pages.
- **React application** (`Client-Side/`) — Vite + React 18 UI with routing
  between the two workflow pages and the Syncfusion Document Editor
  components.

The React app calls the backend directly at
`http://localhost:62870/api/documenteditor/` (CORS is enabled on the
server).

## Prerequisites

### Client

-   Node.js (LTS recommended)
-   npm

### Server

-   .NET 10 SDK
-   Syncfusion ASP.NET Core, DocIO, and Smart Data Extractor packages
   referenced by the project

## How to Run

Start the ASP.NET Core Web API server first because the React application
uses the server for import, comparison, and PDF/image conversion
operations.

### 1. Start the ASP.NET Core Server

Open a terminal in:

``` text
Server-Side/src/
```

Build and run:

``` bash
dotnet restore
dotnet build
dotnet run
```

### 2. Start the React Application

Open another terminal in:

``` text
Client-Side/
```

Install dependencies:

``` bash
npm install
```

Start the development server:

``` bash
npm run dev
```

Open the URL shown by Vite in the terminal, normally:

``` text
http://localhost:5173
```

### 3. Register Syncfusion Licenses

The sample requires a Syncfusion license key (free trial available):

- **Client** — replace `YOUR_LICENSE_KEY_HERE` in
  `Client-Side/src/main.jsx` (`registerLicense` call).
- **Server** — replace the empty `licenseKey` string in
  `Server-Side/src/Program.cs` (`SyncfusionLicenseProvider.RegisterLicense`
  call).

The same license key string works for both. Get a key from your
[Syncfusion account](https://www.syncfusion.com/account) under
**Licenses & Keys**.

## Server API

The Document Editor service exposes the following endpoints.

### Endpoints used by this sample

| Endpoint | Purpose |
| --- | --- |
| `POST /api/documenteditor/Import` | Imports a DOCX/SFDT file and converts it to SFDT. |
| `POST /api/documenteditor/CompareDocuments` | Compares two DOCX files server-side (DocIO `WordDocument.Compare`) and returns the result with tracked revisions as SFDT. |
| `POST /api/documenteditor/ImportFromPdfOrImage` | Converts an uploaded PDF or image to an editable Word document (Smart Data Extractor), then returns it as SFDT. |

### Additional Document Editor service endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /api/documenteditor/Save` | Saves the edited SFDT content as a DOCX. |
| `POST /api/documenteditor/LoadDocument` | Loads an existing SFDT by document name. |
| `POST /api/documenteditor/SpellCheck` | Spell check support. |
| `POST /api/documenteditor/SpellCheckByPage` | Spell check, page-scoped. |
| `POST /api/documenteditor/SystemClipboard` | Server-side clipboard (paste with formatting) support. |
| `POST /api/documenteditor/RestrictEditing` | Hashes a protection password for restrict-editing support. |
| `POST /api/documenteditor/MailMerge` | Server-side mail merge execution. |
| `POST /api/documenteditor/ExportSFDT` / `Export` | Export the document in various formats. |

## Resources

- **Documentation:** [Syncfusion React DOCX Editor - Documentation](https://help.syncfusion.com/document-processing/word/word-processor/react/getting-started)
- **Compare feature docs:** [Document comparison](https://help.syncfusion.com/document-processing/word/word-library/net/word-document/compare-word-documents)
- **Document protection docs:** [Editable regions](https://help.syncfusion.com/document-processing/word/word-processor/react/restrict-editing#insert-editable-region)
- **PDF to Word docs:** [Smart Data Extractor - PDF to Word](https://help.syncfusion.com/document-processing/data-extraction/net/conversions/pdf-to-word#convert-pdf-or-image-to-word-document)
- **Online demo:** [Syncfusion React DOCX Editor - Online demo](https://document.syncfusion.com/demos/docx-editor/react/#/tailwind3/document-editor/default)

## Support and feedback

For any other queries, reach our [Syncfusion support team](https://support.syncfusion.com/?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples) or post the queries through the [community forums](https://www.syncfusion.com/forums?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples).

Request new feature through [Syncfusion feedback portal](https://www.syncfusion.com/feedback?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples).

## License

This is a commercial product and requires a paid license for possession or use. Syncfusion's licensed software, including this component, is subject to the terms and conditions of [Syncfusion's EULA](https://www.syncfusion.com/license/studio/35.1.37/syncfusion_essential_studio_eula.pdf?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples). You can purchase a license [here](https://www.syncfusion.com/sales/products?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples) or start a free 30-day trial [here](https://www.syncfusion.com/account/manage-trials/start-trials?utm_source=github&utm_medium=listing&utm_campaign=github-github-documenteditor-examples).
