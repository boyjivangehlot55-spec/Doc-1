import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { LegalDocument } from './types';
import { AuthView } from './components/AuthView';
import { Navbar } from './components/Navbar';
import { DocumentList } from './components/DocumentList';
import { DocumentDashboard } from './components/DocumentDashboard';
import { UploadModal } from './components/UploadModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Documents state
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  // Navigation state
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setSelectedDoc(null);
        setDocuments([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore documents for current user
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setDocsLoading(false);
      return;
    }

    setDocsLoading(true);
    const docsRef = collection(db, `users/${user.uid}/documents`);
    const q = query(docsRef, orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: LegalDocument[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LegalDocument, 'id'>),
        }));
        setDocuments(loaded);
        setDocsLoading(false);

        // Keep selectedDoc in sync if updated
        if (selectedDoc) {
          const updated = loaded.find((item) => item.id === selectedDoc.id);
          if (updated) {
            setSelectedDoc(updated);
          }
        }
      },
      (err) => {
        console.error('Firestore documents snapshot error:', err);
        setDocsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Loading Splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-white">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-400">Loading ClauseClear...</p>
      </div>
    );
  }

  // Not authenticated: render Login / Sign-up view
  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      <Navbar
        user={user}
        currentDocTitle={selectedDoc ? selectedDoc.title : null}
        onBackToHistory={() => setSelectedDoc(null)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {selectedDoc ? (
          <DocumentDashboard
            document={selectedDoc}
            userId={user.uid}
            onBack={() => setSelectedDoc(null)}
          />
        ) : (
          <DocumentList
            documents={documents}
            loading={docsLoading}
            onSelectDocument={(doc) => setSelectedDoc(doc)}
            onOpenUpload={() => setIsUploadOpen(true)}
            userId={user.uid}
          />
        )}
      </main>

      {/* Upload & Analysis Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        userId={user.uid}
        onDocumentCreated={(newDoc) => {
          setSelectedDoc(newDoc);
        }}
      />
    </div>
  );
}
