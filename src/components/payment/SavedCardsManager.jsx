import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Trash2, Plus, Star, AlertCircle, X } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../ui/ToastNotification';

const SavedCardsManager = () => {
    const [cards, setCards] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const toast = useToast();

    // New card form state
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        loadCards();
    }, []);

    const loadCards = () => {
        setCards(paymentService.getSavedCards());
    };

    const handleDelete = (id) => {
        paymentService.deleteCard(id);
        loadCards();
        toast.info('Card removed', 'The saved card has been removed successfully.');
    };

    const handleSetDefault = (id) => {
        paymentService.setDefaultCard(id);
        loadCards();
        toast.success('Default updated', 'This card will now be selected by default.');
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        if (cardNumber.replace(/\s/g, '').length < 15 || expiry.length < 5 || !name.trim()) {
            toast.error('Validation Error', 'Please check your card details.');
            return;
        }

        try {
            paymentService.saveCard({
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiry,
                name
            });
            loadCards();
            setIsAddModalOpen(false);
            setCardNumber('');
            setExpiry('');
            setName('');
            toast.success('Card added', 'Your card has been saved securely.');
        } catch (error) {
            toast.error('Failed to add card', error.message);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Saved Payment Methods</h3>
                    <p className="text-sm text-slate-500">Manage your saved cards for faster checkouts</p>
                </div>
                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    variant="secondary"
                    icon={Plus}
                    size="sm"
                >
                    Add New
                </Button>
            </div>

            {cards.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 p-6 shadow-[var(--shadow-xs)]">
                    <EmptyState 
                        icon={CreditCard}
                        title="No Saved Cards"
                        description="Add a debit or credit card to checkout faster on your next booking."
                        action={<Button onClick={() => setIsAddModalOpen(true)} variant="primary" icon={Plus} size="sm">Add Card</Button>}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {cards.map((card) => (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 shadow-sm relative overflow-hidden group"
                            >
                                {card.isDefault && (
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl z-10">
                                        Default
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="w-12 h-8 bg-slate-100 rounded border border-slate-200/50 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{card.brand}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!card.isDefault && (
                                            <button 
                                                onClick={() => handleSetDefault(card.id)}
                                                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Set as Default"
                                            >
                                                <Star size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(card.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Card"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <p className="text-lg font-mono font-bold text-slate-700 tracking-widest">
                                        •••• •••• •••• {card.last4}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{card.name}</p>
                                        <p className="text-xs font-mono text-slate-400">Exp: {card.expiry}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <Modal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Card"
                size="sm"
            >
                <form onSubmit={handleAddCard} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-xl flex gap-3 items-start mb-2 border border-blue-100">
                        <AlertCircle className="text-blue-500 shrink-0" size={18} />
                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            For your security, we encrypt your card details. We will charge a refundable ₹1 to verify this card.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Card Number</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                setCardNumber(formatted.substring(0, 19));
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Expiry Date</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                    setExpiry(val);
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">CVV</label>
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="***"
                                maxLength={4}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Name on Card</label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="JOHN DOE"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Securely Save Card</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SavedCardsManager;
