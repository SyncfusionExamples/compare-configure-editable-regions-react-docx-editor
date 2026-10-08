import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-react-documenteditor';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';


import { originalDocument, revisedDocument } from '../data/compareData';
import { useNavigate } from 'react-router-dom';
import LogPanel from '../components/LogPanel';

const CompareDocumentsFunctional = () => {
    const navigate = useNavigate();
    const editorRef1 = useRef(null);
    const editorRef2 = useRef(null);
    const changeSummaryRef = useRef(null);
    const auditHistoryRef = useRef(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [revisedFile, setRevisedFile] = useState(null);
    const [showResult, setShowResult] = useState(true);
    const [compareClicked, setCompareClicked] = useState(false);
    const [showRevisions, setShowRevisions] = useState(false);
    const isDev = import.meta.env.DEV;
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : import.meta.env.BASE_URL + '/';
    let serviceUrl = isDev
        ? 'http://localhost:62870/api/documenteditor/'
        : baseUrl + 'api/documenteditor/';

    /**
     * Logs each accept/reject revision action into the Revision Audit History
     * panel in the format: User, action (accepted/rejected), content.
     */
    const beforeAcceptRejectChanges = (args) => {
        const auditHistory = auditHistoryRef.current;
        if (!auditHistory) {
            return;
        }
        const user = args.author || 'Unknown user';
        const action = args.actionType === 'Accept' ? 'Accept' : 'Reject';
        // Get the revision text content (strip any HTML markup like <span>)
        let content = '';
        try {
            if (args.source && typeof args.source.getContent === 'function') {
                const raw = args.source.getContent();
                content = raw
                    ? String(raw).replace(/<[^>]*>/g, '')
                    : '';
            }
        }
        catch (e) {
            content = '';
        }
        const revisionType = args.revisionType ? ` (${args.revisionType})` : '';
        const level = args.actionType === 'Accept' ? 'success' : 'error';
        auditHistory.addEntry(`User : "${user}"\nContent: "${content}"${revisionType}\nAction: ${action}`, level);
    };

    const openFileInEditor = async (file, editorRef) => {
        if (file.name.endsWith('.sfdt')) {
            const reader = new FileReader();
            reader.onload = e => {
                const docData = e.target?.result;
                if (docData && editorRef.current?.documentEditor) {
                    editorRef.current.documentEditor.showRevisions = false;
                    editorRef.current.documentEditor.open(docData);
                }
            };
            reader.readAsText(file);
        }
        else {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch(serviceUrl + 'Import', {
                    method: 'POST',
                    body: formData
                });
                const sfdtString = await response.text();
                let sfdtObject = null;
                try {
                    sfdtObject = JSON.parse(sfdtString);
                }
                catch (e) {
                    alert("Failed to process the compared document due to no valid JSON. Please try again.");
                }
                if (sfdtObject && editorRef.current?.documentEditor) {
                    editorRef.current.documentEditor.showRevisions = false;
                    editorRef.current.documentEditor.open(sfdtObject);
                }
                else {
                    alert("Unable to display the compared document. Please try again.");
                }
            }
            catch (e) {
                alert('This Compare Documents demo supports only DOCX and SFDT file formats. Please select a valid DOCX or SFDT document and try again.');
            }
        }
    };
    const onCompare = async () => {
        setCompareClicked(false); // Reset to re-mount editors
        setShowRevisions(false);
        setTimeout(async () => {
            if (originalFile != null && revisedFile != null) {
                const isOriginalSupported = originalFile.name.endsWith('.sfdt') || originalFile.name.endsWith('.docx');
                const isRevisedSupported = revisedFile.name.endsWith('.sfdt') || revisedFile.name.endsWith('.docx');
                if (isOriginalSupported && isRevisedSupported) {
                    setCompareClicked(true);
                    showHideWaitingIndicator(true);
                    if (showResult) {
                        if (originalFile)
                            await openFileInEditor(originalFile, editorRef1);
                        if (originalFile && revisedFile) {
                            await loadComparedDocumentAndOpen(editorRef2, originalFile, revisedFile);
                        }
                    }
                    else {
                        if (originalFile)
                            await openFileInEditor(originalFile, editorRef1);
                        if (revisedFile)
                            await openFileInEditor(revisedFile, editorRef2);
                    }
                    showHideWaitingIndicator(false);
                    // Populate the Change Summary with all revisions from the result document
                    populateChangeSummary();
                }
                else {
                    alert('This Compare Documents demo supports only DOCX and SFDT file formats. Please select a valid DOCX or SFDT document and try again.');
                }
            }
        }, 0);
    };
    // open the compared document in the editor (right editor)
    async function loadComparedDocumentAndOpen(editorRef2, originalFile, revisedFile) {
        const formData = new FormData();
        formData.append("originalFile", originalFile);
        formData.append("revisedFile", revisedFile);
        formData.append("author", "Author");
        formData.append("dateTime", new Date().toISOString());
        const response = await fetch(serviceUrl + 'CompareDocuments', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            alert("Failed to compare the selected documents. Please try again.");
            return;
        }
        const sfdtString = await response.text();
        let sfdtObject = null;
        try {
            sfdtObject = JSON.parse(sfdtString);
        }
        catch {
            alert("The comparison could not be completed due to no valid JSON. Please try again.");
            return;
        }
        if (sfdtObject && editorRef2.current?.documentEditor) {
            editorRef2.current.documentEditor.showRevisions = false;
            editorRef2.current.documentEditor.open(sfdtObject);
        }
        else {
            alert("Unable to display the comparison result. Please try again.");
        }
    }
    const showHideWaitingIndicator = (show) => {
        let waitingPopUp = document.getElementById("waiting-popup");
        let inActiveDiv = document.getElementById("popup-overlay");
        if (waitingPopUp && inActiveDiv) {
            inActiveDiv.style.display = show ? "block" : "none";
            waitingPopUp.style.display = show ? "block" : "none";
        }
    };
    /**
     * Reads all tracked revisions from the result document (editor2) and
     * populates the Change Summary log panel.
     * Reference: https://help.syncfusion.com/document-processing/word/word-processor/react/track-changes#get-all-tracked-revisions
     */
    const populateChangeSummary = () => {
        const changeSummary = changeSummaryRef.current;
        if (!changeSummary) {
            return;
        }
        changeSummary.clearEntries();
        const editor = editorRef2.current?.documentEditor;
        if (!editor) {
            return;
        }
        // Get revisions collection from the result document
        const revisions = editor.revisions;
        if (!revisions || revisions.length === 0) {
            changeSummary.addEntry('No tracked revisions found in the result document.', 'warning');
            return;
        }
        for (let i = 0; i < revisions.length; i++) {
            const revision = revisions.get(i);
            try {
                const author = revision.author || 'Unknown';
                const revisionType = revision.revisionType || '';
                // Strip any HTML markup from the content
                const raw = typeof revision.getContent === 'function' ? revision.getContent() : '';
                const content = raw ? String(raw).replace(/<[^>]*>/g, '') : '';
                changeSummary.addEntry(`User : "${author}"\nContent: "${content}"\nType: ${revisionType}`, 'info');
            }
            catch (e) {
                changeSummary.addEntry(`Failed to read revision ${i}.`, 'error');
            }
        }
    };
    // Download the revised/result file (right editor)
    const onDownload = () => {
        if (editorRef2.current?.documentEditor) {
            editorRef2.current.documentEditor.save('Result', 'Docx');
        }
    };
    useEffect(() => {
        const editor1 = editorRef1.current?.documentEditor;
        const editor2 = editorRef2.current?.documentEditor;
        if (editor1 && editor2) {
            editor1.open(JSON.stringify(originalDocument));
            editor2.showRevisions = false;
            editor2.open(JSON.stringify(revisedDocument));
            // Populate the Change Summary with all revisions from the initial document
            editor2.documentChange = () => {
                populateChangeSummary();
            };
            // Fallback: also populate shortly after load in case documentChange already fired
            setTimeout(() => {
                populateChangeSummary();
            }, 500);
            editor1.viewChange = () => {
                const pos = editor1.selection.getScrollPosition();
                editor2.selection.setScrollPosition(pos);
            };
            editor2.viewChange = () => {
                const pos = editor2.selection.getScrollPosition();
                editor1.selection.setScrollPosition(pos);
            };
        }
    }, []);
    const toggleRevisionPane = () => {
        setShowRevisions(!showRevisions);
        let editor2 = editorRef2.current?.documentEditor;
        if (editor2) {
            editor2.showRevisions = !showRevisions;
        }
    };
    return (<div className="control-pane">
      <div className="control-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Navigation to Protection sample */}
        <div style={{ padding: '10px 15px 0 15px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="e-btn e-primary" onClick={() => navigate('/document-protection')}>
            Open Protection Sample
          </button>
        </div>

        {/* Shared Container */}
        <div style={{
            width: '760px',
            margin: '10px auto'
        }}>
          {/* Upload Row */}
          <div style={{ display: 'flex', gap: '6px' }}>

            {/* Original */}
            <div style={{
            width: '360px',
            borderRadius: 6,
            padding: 14,
            border: '1px dashed #ccc'
        }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Original document</span>

                <label style={{
            padding: '4px 10px',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer'
        }}>
                  Choose file
                  <input type="file" style={{ display: 'none' }} accept=".docx,.sfdt" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                setOriginalFile(file);
                setCompareClicked(false);
            }
        }}/>
                </label>
              </div>

              {/* Filename + Delete */}
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
            fontSize: 12,
            color: '#666'
        }}>
                <span>
                  {originalFile
            ? `${originalFile.name} (${Math.round(originalFile.size / 1024)} KB)`
            : 'Supported formats: SFDT, DOCX'}
                </span>

                {originalFile && (<span className="e-icons e-trash" onClick={() => setOriginalFile(null)} style={{
                cursor: 'pointer'
            }} title="Remove file"/>)}
              </div>
            </div>

            {/* Revised */}
            <div style={{
            width: 360,
            borderRadius: 6,
            padding: 14,
            border: '1px dashed #ccc'
        }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>Revised document</span>

                <label style={{
            padding: '4px 10px',
            border: '1px solid #ccc',
            borderRadius: 4,
            cursor: 'pointer'
        }}>
                  Choose file
                  <input type="file" style={{ display: 'none' }} accept=".docx,.sfdt" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                setRevisedFile(file);
                setCompareClicked(false);
            }
        }}/>
                </label>
              </div>

              {/* Filename + Delete */}
              <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
            fontSize: 12,
            color: '#666'
        }}>
                <span>
                  {revisedFile
            ? `${revisedFile.name} (${Math.round(revisedFile.size / 1024)} KB)`
            : 'Supported formats: SFDT, DOCX'}
                </span>

                {revisedFile && (<span className="e-icons e-trash" onClick={() => setRevisedFile(null)} style={{
                cursor: 'pointer'
            }} title="Remove file"/>)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12
        }}>
            {/* Checkbox */}
            <div>
              <label htmlFor="showResultCheckbox" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input id="showResultCheckbox" type="checkbox" checked={showResult} onChange={(e) => setShowResult(e.target.checked)} style={{ marginRight: 6 }}/>
                <span>Show comparison results with tracked changes</span>
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginRight: 32 }}>
              <ButtonComponent cssClass="e-primary" disabled={!originalFile || !revisedFile} onClick={onCompare}>
                Compare
              </ButtonComponent>

              <ButtonComponent cssClass="e-outline e-flat e-primary" disabled={!compareClicked} onClick={onDownload} iconCss="e-icons e-download">
                Download Result Document
              </ButtonComponent>
            </div>
          </div>
        </div>

        {/* Editors */}
        <div style={{
            display: 'flex',
            gap: 6,
            flex: 1,
            minHeight: 200,
            padding: '0px 10px'
        }}>
          {/* Left Editor */}
          <div style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ddd',
            overflow: 'hidden'
        }}>
            <div className="e-de-ctn-title" style={{ padding: '8px', fontWeight: 600 }}>
              Original Document
            </div>

            <div style={{ flex: 1, display: "block" }}>
              <DocumentEditorContainerComponent id="editor1" ref={editorRef1} serviceUrl={serviceUrl} height="100%" width="100%" enableToolbar={false} showPropertiesPane={false}/>
            </div>
          </div>

          {/* Right Editor */}
          <div style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ddd',
            overflow: 'hidden'
        }}>
            <div className="e-de-ctn-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ float: 'left', padding: '8px', fontWeight: 600, flex: 1 }}>
                {showResult
            ? 'Result Document (with tracked changes)'
            : 'Revised Document'}
              </div>
              {showResult &&
            <ButtonComponent style={{ float: 'right', fontWeight: 400,
                    background: 'transparent', boxShadow: 'none',
                    borderColor: 'transparent', borderRadius: '0px',
                    color: 'inherit', fontSize: '12px' }} className='e-de-ctn-title' title="Show/Hide Revisions Pane" onClick={toggleRevisionPane}>
                    <span className='e-icons e-eye'></span>
                    {showRevisions ? ' Hide Review Pane' : ' Show Review Pane'}
                </ButtonComponent>}
            </div>

            <div style={{ flex: 1, display: "block" }}>
              <DocumentEditorContainerComponent id="editor2" ref={editorRef2} serviceUrl={serviceUrl} height="100%" width="100%" enableToolbar={false} showPropertiesPane={false} beforeAcceptRejectChanges={beforeAcceptRejectChanges}/>
            </div>
          </div>
        </div>

        {/* Change Summary & Revision Audit History logs */}
        <div style={{ display: 'flex', gap: 6, padding: '0px 10px 10px 10px', height: 220, flex: 'none', marginTop: 10 }}>
          {/* Change Summary */}
          <div style={{ width: '50%' }}>
            <LogPanel ref={changeSummaryRef} title="Change Summary" accentColor="#0078d4"/>
          </div>

          {/* Revision Audit History */}
          <div style={{ width: '50%' }}>
            <LogPanel ref={auditHistoryRef} title="Revision Audit History" accentColor="#107c10"/>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="overlay" id="popup-overlay"></div>
        <div id="waiting-popup">
          <svg className="circular" height="40" width="40">
            <circle className="circle-path" cx="25" cy="25" r="20" fill="none" strokeWidth="6" strokeMiterlimit="10"/>
          </svg>
        </div>    
    
        {/* Sample Description */}
      </div>          
    </div>);
};
export default CompareDocumentsFunctional;