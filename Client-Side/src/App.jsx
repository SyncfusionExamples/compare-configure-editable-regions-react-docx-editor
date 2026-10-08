import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CompareDocuments from './pages/CompareDocuments';
import DocumentProtection from './pages/DocumentProtection';

/**
 * Root application component.
 * Route '/'           -> Document Compare sample
 * Route '/document-protection' -> Document Protection sample
 */
const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CompareDocuments />} />
                <Route path="/document-protection" element={<DocumentProtection />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
