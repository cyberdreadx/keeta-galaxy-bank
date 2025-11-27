import { useState, useEffect, useCallback } from 'react';

export interface Contact {
  id: string;
  name: string;
  address: string;
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = 'keeta_address_book';

export const useAddressBook = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load contacts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setContacts(JSON.parse(stored));
      } catch {
        setContacts([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever contacts change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts, isLoaded]);

  const addContact = useCallback((name: string, address: string, notes?: string) => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
      notes: notes?.trim(),
      createdAt: Date.now(),
    };
    setContacts(prev => [...prev, newContact]);
    return newContact;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt'>>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id 
        ? { ...contact, ...updates }
        : contact
    ));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  }, []);

  const getContactByAddress = useCallback((address: string) => {
    return contacts.find(c => c.address.toLowerCase() === address.toLowerCase());
  }, [contacts]);

  const searchContacts = useCallback((query: string) => {
    const q = query.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.address.toLowerCase().includes(q)
    );
  }, [contacts]);

  return {
    contacts,
    isLoaded,
    addContact,
    updateContact,
    deleteContact,
    getContactByAddress,
    searchContacts,
  };
};
