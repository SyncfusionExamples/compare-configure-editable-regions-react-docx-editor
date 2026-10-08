import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { DocumentEditorContainerComponent, Toolbar, Ribbon } from '@syncfusion/ej2-react-documenteditor';
import { TitleBar } from '../components/TitleBar';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';

import { dataProtection } from '../data/protectionData';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
DocumentEditorContainerComponent.Inject(Toolbar, Ribbon);
// tslint:disable:max-line-length
const DocumentProtection = () => {
    const navigate = useNavigate();
    useEffect(() => {
        rendereComplete();
    }, []);
    let hostUrl = "http://localhost:62870/api/documenteditor/";
    let container = useRef(null);
    let titleBar;
    let settings = { showRuler: true };
    let userList = ["engineer@mycompany.com", "manager@mycompany.com"];
    /**
     * Each user is mapped to a distinct editable-range highlight color so
     * regions of different users are visually distinguishable.
     */
    const userColorMap = {
        'engineer@mycompany.com': '#0078d4',
        'manager@mycompany.com': '#e3008c'
    };
    const onChange = (event) => {
        container.current.documentEditor.currentUser = event.value;
        // Update the editable range highlight color to the color of the
        // newly selected user so the difference is visible.
        container.current.documentEditor.userColor = userColorMap[event.value] || '#0078d4';
    };
    /**
     * Inserts an editable region over the current selection for the
     * currently selected user (from the title bar dropdown).
     */
    const onInsertEditableRegion = () => {
        const editor = container.current?.documentEditor;
        if (!editor) {
            return;
        }
        const currentUser = editor.currentUser;
        if (!currentUser) {
            alert('Please select a user before inserting an editable region.');
            return;
        }
        // Inserts the editing region where the mentioned user can edit.
        editor.editor.insertEditingRegion(currentUser);
        // Highlight the editable range so it is visible.
        editor.documentEditorSettings.highlightEditableRanges = true;
    };
    /**
     * Handles the "Open PDF/Image" file selection. Uploads the selected
     * PDF/image file to the server (api/documenteditor/ImportFromPdfOrImage)
     * which converts it to SFDT, and opens the result in the editor.
     */
    const onOpenPdfImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        // Reset so selecting the same file again re-triggers the change event.
        e.target.value = '';
        const editor = container.current?.documentEditor;
        if (!editor) {
            return;
        }
        // Show a wait indicator while the server converts the file.
        createSpinner({ target: document.getElementById('container') });
        showSpinner(document.getElementById('container'));
        const formData = new FormData();
        formData.append('file', file);
        const http = new XMLHttpRequest();
        http.open('POST', editor.serviceUrl + 'ImportFromPdfOrImage');
        // Note: do NOT set the Content-Type header manually.
        // The browser sets it automatically with the required multipart boundary.
        http.onload = () => {
            hideSpinner(document.getElementById('container'));
            if (http.status === 200) {
                const sfdtString = http.responseText;
                let sfdtObject = null;
                try {
                    sfdtObject = JSON.parse(sfdtString);
                }
                catch (err) {
                    alert('Failed to convert the selected file. Please try again.');
                    return;
                }
                if (sfdtObject) {
                    editor.open(sfdtObject);
                    editor.documentName = file.name.replace(/\.[^.]+$/, '');
                    titleBar.updateDocumentTitle();
                    editor.focusIn();
                }
                else {
                    alert('Unable to open the converted document. Please try again.');
                }
            }
            else {
                alert('Failed to convert the selected file. Please try again.');
            }
        };
        http.onerror = () => {
            hideSpinner(document.getElementById('container'));
            alert('Failed to reach the conversion service. Please try again.');
        };
        http.send(formData);
    };
    const onLoadDefault = () => {
        container.current.documentEditor.open(JSON.stringify(dataProtection));
        container.current.documentEditor.documentName = "Document Protection";
        titleBar.updateDocumentTitle();
        container.current.documentChange = () => {
            titleBar.updateDocumentTitle();
            container.current.documentEditor.focusIn();
        };
    };
    const rendereComplete = () => {
        container.current.showPropertiesPane = false;
        container.current.documentEditor.currentUser = "engineer@mycompany.com";
        // Highlight editable ranges with the color of the initial user.
        container.current.documentEditor.userColor = userColorMap['engineer@mycompany.com'] || '#0078d4';
        // container.documentEditor.pageOutline = '#E0E0E0';
        // container.documentEditor.acceptTab = true;
        container.current.documentEditor.resize();
        titleBar = new TitleBar(document.getElementById("documenteditor_titlebar"), container.current.documentEditor, true);
        onLoadDefault();
        titleBar.showButtons(false);
    };
    const fileMenuItemClick = (args) => {
        if (args.item.id) {
            let value = args.item.id;
            let sampleName = container.current.documentEditor.documentName === '' ? 'sample' : container.current.documentEditor.documentName;
            switch (value) {
                case 'docx':
                    container.current.documentEditor.save(sampleName, 'Docx');
                    break;
                case 'sfdt':
                    container.current.documentEditor.save(sampleName, 'Sfdt');
                    break;
                case 'text':
                    container.current.documentEditor.save(sampleName, 'Txt');
                    break;
                case 'dotx':
                    container.current.documentEditor.save(sampleName, 'Dotx');
                    break;
                case 'pdf':
                    formatSave('Pdf');
                    break;
                case 'html':
                    formatSave('Html');
                    break;
                case 'odt':
                    formatSave('Odt');
                    break;
                case 'md':
                    formatSave('Md');
                    break;
                case 'rtf':
                    formatSave('Rtf');
                    break;
                case 'wordml':
                    formatSave('Xml');
                    break;
            }
        }
    };
    const formatSave = (type) => {
        createSpinner({
            target: document.getElementById('container')
        });
        showSpinner(document.getElementById('container'));
        let format = type;
        let url = container.current.documentEditor.serviceUrl + 'Export';
        let http = new XMLHttpRequest();
        http.open('POST', url);
        http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        http.responseType = 'blob';
        let sfdt = {
            Content: container.current.documentEditor.serialize(),
            Filename: container.current.documentEditor.documentName,
            Format: '.' + format,
        };
        http.onload = () => {
            if (http.status === 200) {
                let responseData = http.response;
                let blobUrl = URL.createObjectURL(responseData);
                let downloadLink = document.createElement('a');
                downloadLink.href = blobUrl;
                downloadLink.download = container.current.documentEditor.documentName + '.' + format.toLowerCase();
                document.body.appendChild(downloadLink);
                hideSpinner(document.getElementById('container'));
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(blobUrl);
            }
            else {
                console.error('Request failed with status:', http.status);
                hideSpinner(document.getElementById('container'));
            }
        };
        http.send(JSON.stringify(sfdt));
    };
    return (<div className="control-pane">
            <div style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="nav-button" onClick={() => navigate('/')} style={{
                    padding: '8px 16px',
                    border: '1px solid #0078d4',
                    borderRadius: 4,
                    background: '#0078d4',
                    color: '#fff',
                    cursor: 'pointer'
                }}>Load Compare Sample</button>
                <button id="insert-editable-region-btn" onClick={onInsertEditableRegion} style={{
                    padding: '8px 16px',
                    border: '1px solid #0078d4',
                    borderRadius: 4,
                    background: '#0078d4',
                    color: '#fff',
                    cursor: 'pointer'
                }} title="Insert an editable region for the current user over the selected content">
                    Insert Editable Region
                </button>
                <label id="open-pdf-image-btn" style={{
                    padding: '8px 16px',
                    border: '1px solid #0078d4',
                    borderRadius: 4,
                    background: '#0078d4',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'inline-block'
                }} title="Open a PDF or image file">
                    Open PDF/Image
                    <input id="open-pdf-image-input" type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={onOpenPdfImage}/>
                </label>
            </div>
            <div className="col-lg-12 control-section">
                <div id="documenteditor_titlebar" className="e-de-ctn-title">
                    <div id="current-user-wrapper" style={{ float: 'right' }}>
                        <span id="current-user-label" style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'inherit'
                        }} title="Current user">
                            Current User:
                        </span>
                        <DropDownListComponent id="user-ddl" dataSource={userList} change={onChange.bind(this)} value={userList[0]} width="220px" cssClass="e-de-ctn-title-user-ddl" placeholder="Select user"/>
                    </div>
                </div>
                <div id="documenteditor_container_body" style={{ "display": "block", "height": "calc(100vh - 230px)" }}>
                    <DocumentEditorContainerComponent id="container" ref={container} style={{ display: "block" }} height={"100%"} toolbarMode={"Ribbon"} serviceUrl={hostUrl} enableToolbar={true} locale="en-US" documentEditorSettings={settings} fileMenuItems={['New', 'Open', {
                text: 'Export',
                id: 'custom_item',
                iconCss: 'e-icons e-export',
                items: [
                    { id: 'sfdt', text: 'Syncfusion Document Text (*.sfdt)' },
                    { id: 'docx', text: 'Word Document (*.docx)' },
                    { id: 'dotx', text: 'Word Template (*.dotx)' },
                    { id: 'text', text: 'Plain Text (*.txt)' },
                    { id: 'pdf', text: 'PDF (*.pdf)' },
                    { id: 'html', text: 'HyperText Markup Language (*.html)' },
                    { id: 'rtf', text: 'Rich Text Format (*.rtf)' },
                    { id: 'md', text: 'Markdown (*.md)' },
                    { id: 'odt', text: 'OpenDocument Text (*.odt)' },
                    { id: 'wordml', text: 'Word XML Document (*.xml)' }
                ]
            }, 'Print']} fileMenuItemClick={fileMenuItemClick}/>
                </div>
            </div>
        </div>);
};

export default DocumentProtection;
