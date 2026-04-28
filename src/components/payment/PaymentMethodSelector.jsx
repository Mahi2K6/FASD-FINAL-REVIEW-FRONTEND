import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Check, Lock, AlertCircle } from 'lucide-react';
import { paymentService, detectCardBrand } from '../../services/paymentService';

const PaymentMethodSelector = ({ amount, onMethodSelect }) => {
    const [activeTab, setActiveTab] = useState('card');
    const [savedCards] = useState(() => paymentService.getSavedCards());
    const [selectedCardId, setSelectedCardId] = useState(savedCards.find(c => c.isDefault)?.id || null);
    
    // Form states
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');
    const [saveCard, setSaveCard] = useState(true);
    const [upiId, setUpiId] = useState('');

    const [errors, setErrors] = useState({});

    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        // Format as groups of 4
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted.substring(0, 19));
        
        if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: null }));
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setExpiry(val);
        if (errors.expiry) setErrors(prev => ({ ...prev, expiry: null }));
    };

    const validateAndSelect = () => {
        const newErrors = {};
        let selectedMethod = null;

        if (activeTab === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 15) newErrors.cardNumber = 'Valid card number required';
            if (expiry.length < 5) newErrors.expiry = 'MM/YY required';
            if (cvv.length < 3) newErrors.cvv = 'Required';
            if (!name.trim()) newErrors.name = 'Name on card required';

            if (Object.keys(newErrors).length === 0) {
                selectedMethod = {
                    type: 'card',
                    cardNumber: cardNumber.replace(/\s/g, ''),
                    expiry,
                    name,
                    cvv,
                    saveCard
                };
            }
        } else if (activeTab === 'saved') {
            if (!selectedCardId) newErrors.saved = 'Please select a card';
            else {
                const card = savedCards.find(c => c.id === selectedCardId);
                selectedMethod = {
                    type: 'saved_card',
                    cardId: card.id,
                    last4: card.last4,
                    brand: card.brand
                };
            }
        } else if (activeTab === 'upi') {
            if (!upiId.includes('@')) newErrors.upiId = 'Valid UPI ID required (e.g. name@bank)';
            else {
                selectedMethod = {
                    type: 'upi',
                    upiId
                };
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            onMethodSelect(null);
        } else {
            setErrors({});
            onMethodSelect(selectedMethod);
        }
    };

    // Auto-validate when fields change if there are no current errors, or run it manually via button?
    // Let's rely on the parent requesting validation via a ref, OR we can pass the method up immediately if valid.
    // For simplicity, we'll run validate on blur or change, and lift state up.
    React.useEffect(() => {
        const newErrors = {};
        let selectedMethod = null;
        let isValid = false;

        if (activeTab === 'card') {
            if (cardNumber.replace(/\s/g, '').length >= 15 && expiry.length === 5 && cvv.length >= 3 && name.trim()) {
                isValid = true;
                selectedMethod = {
                    type: 'card',
                    cardNumber: cardNumber.replace(/\s/g, ''),
                    expiry,
                    name,
                    cvv,
                    saveCard
                };
            }
        } else if (activeTab === 'saved' && selectedCardId) {
            isValid = true;
            const card = savedCards.find(c => c.id === selectedCardId);
            if (card) {
                selectedMethod = {
                    type: 'saved_card',
                    cardId: card.id,
                    last4: card.last4,
                    brand: card.brand
                };
            }
        } else if (activeTab === 'upi') {
            if (upiId.includes('@') && upiId.length > 5) {
                isValid = true;
                selectedMethod = {
                    type: 'upi',
                    upiId
                };
            }
        }

        if (isValid) {
            onMethodSelect(selectedMethod);
        } else {
            onMethodSelect(null);
        }
    }, [activeTab, cardNumber, expiry, cvv, name, saveCard, selectedCardId, upiId, savedCards, onMethodSelect]);


    const cardBrand = detectCardBrand(cardNumber);

    return (
        <div className="flex flex-col gap-5">
            {/* Payment Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-[20px] backdrop-blur-sm border border-slate-200/50">
                {savedCards.length > 0 && (
                    <TabButton 
                        active={activeTab === 'saved'} 
                        onClick={() => setActiveTab('saved')}
                        icon={CreditCard}
                        label="Saved Cards"
                    />
                )}
                <TabButton 
                    active={activeTab === 'card'} 
                    onClick={() => setActiveTab('card')}
                    icon={CreditCard}
                    label="New Card"
                />
                <TabButton 
                    active={activeTab === 'upi'} 
                    onClick={() => setActiveTab('upi')}
                    icon={Smartphone}
                    label="UPI"
                />
            </div>

            {/* Forms Container */}
            <div className="relative min-h-[220px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'saved' && savedCards.length > 0 && (
                        <motion.div
                            key="saved"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-3"
                        >
                            {savedCards.map(card => (
                                <button
                                    key={card.id}
                                    onClick={() => setSelectedCardId(card.id)}
                                    className={`relative flex items-center p-4 rounded-2xl border transition-all duration-200 ${
                                        selectedCardId === card.id 
                                        ? 'bg-blue-50/50 border-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.1)]' 
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center mr-4 shadow-sm border border-slate-200/60">
                                        {/* Simple brand text or icon */}
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{card.brand}</span>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-slate-800">•••• •••• •••• {card.last4}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{card.name}</p>
                                    </div>
                                    {selectedCardId === card.id && (
                                        <motion.div
                                            layoutId="selectedCheck"
                                            className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center"
                                        >
                                            <Check size={12} strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'card' && (
                        <motion.div
                            key="card"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Card Number" 
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    className={`input-field pr-12 ${errors.cardNumber ? '!border-red-400 !bg-red-50/50' : ''}`}
                                    maxLength={19}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-5 bg-slate-100 rounded border border-slate-200">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{cardBrand !== 'unknown' ? cardBrand : 'CARD'}</span>
                                </div>
                                {errors.cardNumber && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.cardNumber}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        value={expiry}
                                        onChange={handleExpiryChange}
                                        className={`input-field ${errors.expiry ? '!border-red-400 !bg-red-50/50' : ''}`}
                                        maxLength={5}
                                    />
                                    {errors.expiry && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.expiry}</p>}
                                </div>
                                <div>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            placeholder="CVV" 
                                            value={cvv}
                                            onChange={(e) => {
                                                setCvv(e.target.value.replace(/\D/g, '').substring(0, 4));
                                                if (errors.cvv) setErrors(prev => ({...prev, cvv: null}));
                                            }}
                                            className={`input-field pr-10 ${errors.cvv ? '!border-red-400 !bg-red-50/50' : ''}`}
                                        />
                                        <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    {errors.cvv && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.cvv}</p>}
                                </div>
                            </div>

                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Name on Card" 
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(prev => ({...prev, name: null}));
                                    }}
                                    className={`input-field ${errors.name ? '!border-red-400 !bg-red-50/50' : ''}`}
                                />
                                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name}</p>}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
                                <div className="relative flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={saveCard}
                                        onChange={(e) => setSaveCard(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors flex items-center justify-center">
                                        <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Save card for future payments</span>
                            </label>
                        </motion.div>
                    )}

                    {activeTab === 'upi' && (
                        <motion.div
                            key="upi"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                <Smartphone className="text-blue-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Pay with UPI Apps</h4>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Enter your UPI ID. You will receive a payment request on your UPI app.</p>
                                </div>
                            </div>

                            <div>
                                <input 
                                    type="text" 
                                    placeholder="e.g. username@okhdfcbank" 
                                    value={upiId}
                                    onChange={(e) => {
                                        setUpiId(e.target.value.toLowerCase());
                                        if (errors.upiId) setErrors(prev => ({...prev, upiId: null}));
                                    }}
                                    className={`input-field ${errors.upiId ? '!border-red-400 !bg-red-50/50' : ''}`}
                                />
                                {errors.upiId && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.upiId}</p>}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-2">
                <Lock size={12} className="text-emerald-500" />
                <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Payments are secure and encrypted</span>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-colors z-10 ${
            active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
        }`}
    >
        {active && (
            <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white rounded-[16px] shadow-sm border border-slate-200/50"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                style={{ zIndex: -1 }}
            />
        )}
        <Icon size={16} className={active ? 'text-blue-600' : 'text-slate-400'} />
        {label}
    </button>
);

export default PaymentMethodSelector;
