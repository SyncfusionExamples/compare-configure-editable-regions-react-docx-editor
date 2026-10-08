import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CompareDocuments from './pages/CompareDocuments';
import DocumentProtection from './pages/DocumentProtection';

/**
 * Base path of the deployed app (must match `base` in vite.config.js).
 * Default to '/' during local dev when Vite serves at the root.
 */
const basename = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + '/';

/**
 * Root application component.
 * Route '/'           -> Document Compare sample
 * Route '/document-protection' -> Document Protection sample
 */
const App = () => {
    return (
        <BrowserRouter basename={basename}>
            <Routes>
                <Route path="/" element={<CompareDocuments />} />
                <Route path="/document-protection" element={<DocumentProtection />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
