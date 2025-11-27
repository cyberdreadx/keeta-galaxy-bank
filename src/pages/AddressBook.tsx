import { useState } from "react";
import { StarField } from "@/components/StarField";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { StarWarsPanel } from "@/components/StarWarsPanel";
import { useAddressBook, Contact } from "@/hooks/useAddressBook";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { 
  Plus, Search, User, Copy, Trash2, Edit2, X, Check, 
  Send, BookUser 
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AddressBook = () => {
  const navigate = useNavigate();
  const { play } = useSoundEffects();
  const { contacts, addContact, updateContact, deleteContact, searchContacts } = useAddressBook();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const filteredContacts = searchQuery ? searchContacts(searchQuery) : contacts;

  const resetForm = () => {
    setFormName("");
    setFormAddress("");
    setFormNotes("");
    setShowAddForm(false);
    setEditingContact(null);
  };

  const handleAddContact = () => {
    if (!formName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!formAddress.trim()) {
      toast.error("Please enter an address");
      return;
    }
    if (!formAddress.startsWith("keeta_")) {
      toast.error("Invalid Keeta address format");
      return;
    }

    play('click');
    addContact(formName, formAddress, formNotes);
    toast.success("Contact added");
    resetForm();
  };

  const handleUpdateContact = () => {
    if (!editingContact) return;
    if (!formName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    play('click');
    updateContact(editingContact.id, {
      name: formName,
      address: formAddress,
      notes: formNotes,
    });
    toast.success("Contact updated");
    resetForm();
  };

  const handleDeleteContact = (contact: Contact) => {
    play('click');
    deleteContact(contact.id);
    toast.success(`${contact.name} deleted`);
  };

  const handleEditContact = (contact: Contact) => {
    play('click');
    setEditingContact(contact);
    setFormName(contact.name);
    setFormAddress(contact.address);
    setFormNotes(contact.notes || "");
    setShowAddForm(true);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    play('click');
    toast.success("Address copied");
  };

  const sendToContact = (contact: Contact) => {
    play('navigate');
    navigate(`/send?to=${encodeURIComponent(contact.address)}&name=${encodeURIComponent(contact.name)}`);
  };

  return (
    <div className="min-h-screen relative">
      <StarField />
      <Header />

      <main className="relative z-10 pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sw-materialize">
            <p className="font-mono text-xs text-sw-blue/60 tracking-[0.5em] mb-2">
              // CONTACTS
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wider sw-title">
              ADDRESS BOOK
            </h2>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative sw-materialize">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sw-blue/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-3 bg-sw-blue/5 border border-sw-blue/30 rounded font-mono text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-sw-blue"
              />
            </div>

            {/* Add Contact Button */}
            {!showAddForm && (
              <button
                onClick={() => {
                  play('click');
                  setShowAddForm(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-sw-green/40 rounded hover:border-sw-green hover:bg-sw-green/5 transition-all group sw-materialize"
              >
                <Plus className="w-5 h-5 text-sw-green/60 group-hover:text-sw-green" />
                <span className="font-mono text-sm text-sw-green/70 group-hover:text-sw-green">
                  ADD NEW CONTACT
                </span>
              </button>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
              <StarWarsPanel title={editingContact ? "EDIT CONTACT" : "NEW CONTACT"} className="sw-materialize">
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-xs text-sw-blue/60 mb-1 block">NAME</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contact name"
                      className="w-full p-3 bg-background border border-sw-blue/30 rounded font-mono text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-sw-blue"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-sw-blue/60 mb-1 block">ADDRESS</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder="keeta_..."
                      className="w-full p-3 bg-background border border-sw-blue/30 rounded font-mono text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-sw-blue"
                      disabled={!!editingContact}
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs text-sw-blue/60 mb-1 block">NOTES (OPTIONAL)</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Add a note..."
                      rows={2}
                      className="w-full p-3 bg-background border border-sw-blue/30 rounded font-mono text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-sw-blue resize-none"
                      maxLength={200}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={editingContact ? handleUpdateContact : handleAddContact}
                      className="flex-1 py-3 bg-sw-green/20 border border-sw-green text-sw-green font-mono text-sm rounded hover:bg-sw-green/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {editingContact ? "UPDATE" : "SAVE"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex-1 py-3 bg-sw-red/10 border border-sw-red/30 text-sw-red/70 font-mono text-sm rounded hover:bg-sw-red/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      CANCEL
                    </button>
                  </div>
                </div>
              </StarWarsPanel>
            )}

            {/* Contacts List */}
            {filteredContacts.length === 0 ? (
              <StarWarsPanel className="sw-materialize">
                <div className="text-center py-8">
                  <BookUser className="w-12 h-12 mx-auto text-sw-blue/30 mb-3" />
                  <p className="font-mono text-sm text-sw-blue/50">
                    {searchQuery ? "No contacts found" : "No contacts yet"}
                  </p>
                  <p className="font-mono text-xs text-sw-blue/30 mt-1">
                    {searchQuery ? "Try a different search" : "Add your first contact above"}
                  </p>
                </div>
              </StarWarsPanel>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <StarWarsPanel 
                    key={contact.id} 
                    className="sw-materialize"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 flex items-center justify-center border border-sw-blue/40 bg-sw-blue/10 rounded">
                        <User className="w-5 h-5 text-sw-blue/70" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm tracking-wider text-sw-yellow">
                          {contact.name}
                        </h3>
                        <p className="font-mono text-[10px] text-sw-blue/60 truncate mt-0.5">
                          {contact.address}
                        </p>
                        {contact.notes && (
                          <p className="font-mono text-[10px] text-foreground/50 mt-1 line-clamp-1">
                            {contact.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => sendToContact(contact)}
                          className="p-2 hover:bg-sw-green/20 rounded transition-colors"
                          title="Send KTA"
                        >
                          <Send className="w-4 h-4 text-sw-green/60 hover:text-sw-green" />
                        </button>
                        <button
                          onClick={() => copyAddress(contact.address)}
                          className="p-2 hover:bg-sw-blue/20 rounded transition-colors"
                          title="Copy address"
                        >
                          <Copy className="w-4 h-4 text-sw-blue/60 hover:text-sw-blue" />
                        </button>
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="p-2 hover:bg-sw-yellow/20 rounded transition-colors"
                          title="Edit contact"
                        >
                          <Edit2 className="w-4 h-4 text-sw-yellow/60 hover:text-sw-yellow" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact)}
                          className="p-2 hover:bg-sw-red/20 rounded transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4 text-sw-red/60 hover:text-sw-red" />
                        </button>
                      </div>
                    </div>
                  </StarWarsPanel>
                ))}
              </div>
            )}

            {/* Contact Count */}
            {contacts.length > 0 && (
              <p className="text-center font-mono text-[10px] text-sw-blue/40 tracking-wider">
                {contacts.length} CONTACT{contacts.length !== 1 ? 'S' : ''} STORED
              </p>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AddressBook;
