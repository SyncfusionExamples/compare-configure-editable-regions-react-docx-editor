import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerLicense } from '@syncfusion/ej2-base';
import './index.css';
import App from './App';

// Register your Syncfusion license key here.
registerLicense('Add Syncfusion license here');

// Vite serves the base path both with and without a trailing slash, but
// BrowserRouter requires the URL to start exactly with the basename.
// Redirect "/<base>" to "/<base>/" so the router can match in both cases.
const base = import.meta.env.BASE_URL; // e.g. "/compare-configure-.../"
const baseNoSlash = base.replace(/\/+$/, '');
if (baseNoSlash && window.location.pathname === baseNoSlash) {
    const url = window.location.pathname + '/' +
        window.location.search + window.location.hash;
    window.history.replaceState({}, '', url);
}

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
