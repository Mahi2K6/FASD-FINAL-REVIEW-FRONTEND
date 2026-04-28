import api from '../api';

/**
 * Service to handle payment operations.
 * Simulates endpoints that don't exist yet on the backend.
 */
export const paymentService = {
    /**
     * Fetch real transaction history from backend
     */
    fetchPaymentHistory: async () => {
        try {
            const response = await api.get('/api/payments/history');
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            throw error;
        }
    },

    /**
     * Compute summary statistics from history data client-side
     */
    getPaymentSummary: (history = []) => {
        const summary = {
            totalSpent: 0,
            refundsReceived: 0,
            pendingCount: 0,
            failedCount: 0
        };

        history.forEach(tx => {
            const amount = Number(tx.amount) || 0;
            switch(tx.status?.toLowerCase()) {
                case 'completed':
                case 'success':
                    summary.totalSpent += amount;
                    break;
                case 'refunded':
                    summary.refundsReceived += amount;
                    break;
                case 'pending':
                case 'processing':
                    summary.pendingCount++;
                    break;
                case 'failed':
                case 'cancelled':
                    summary.failedCount++;
                    break;
                default:
                    break;
            }
        });

        return summary;
    },

    /**
     * Simulate a payment processing flow since POST /api/payments doesn't exist
     */
    processPayment: async (paymentData) => {
        return new Promise((resolve, reject) => {
            // Simulate 2-3s network delay
            setTimeout(() => {
                // Mock failure scenario (10% chance for realism, or if explicit fail card is used)
                const isFailCard = paymentData.cardNumber && paymentData.cardNumber.endsWith('0000');
                if (isFailCard || Math.random() < 0.05) {
                    reject(new Error('Card declined. Please check your details or try a different method.'));
                    return;
                }
                
                resolve({
                    success: true,
                    transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    status: 'completed',
                    amount: paymentData.amount,
                    timestamp: new Date().toISOString()
                });
            }, 2500);
        });
    },

    /**
     * Saved Cards Management (localStorage)
     */
    getSavedCards: () => {
        try {
            const cards = localStorage.getItem('medconnect_saved_cards');
            return cards ? JSON.parse(cards) : [];
        } catch {
            return [];
        }
    },

    saveCard: (cardData) => {
        try {
            const cards = paymentService.getSavedCards();
            
            // Generate a fake ID
            const newCard = {
                ...cardData,
                id: `card_${Date.now()}`,
                addedAt: new Date().toISOString(),
                isDefault: cards.length === 0 ? true : !!cardData.isDefault
            };
            
            // Mask card number for storage
            if (newCard.cardNumber) {
                const clean = newCard.cardNumber.replace(/\D/g, '');
                newCard.last4 = clean.slice(-4);
                newCard.brand = detectCardBrand(clean);
                delete newCard.cardNumber; // don't store full number
                delete newCard.cvv; // never store CVV
            }

            if (newCard.isDefault) {
                cards.forEach(c => c.isDefault = false);
            }

            cards.push(newCard);
            localStorage.setItem('medconnect_saved_cards', JSON.stringify(cards));
            return newCard;
        } catch (error) {
            console.error('Failed to save card:', error);
            throw error;
        }
    },

    deleteCard: (cardId) => {
        try {
            let cards = paymentService.getSavedCards();
            cards = cards.filter(c => c.id !== cardId);
            
            // Assign new default if we deleted the default
            if (cards.length > 0 && !cards.some(c => c.isDefault)) {
                cards[0].isDefault = true;
            }
            
            localStorage.setItem('medconnect_saved_cards', JSON.stringify(cards));
        } catch (error) {
            console.error('Failed to delete card:', error);
            throw error;
        }
    },

    setDefaultCard: (cardId) => {
        try {
            const cards = paymentService.getSavedCards();
            cards.forEach(c => c.isDefault = (c.id === cardId));
            localStorage.setItem('medconnect_saved_cards', JSON.stringify(cards));
        } catch (error) {
            console.error('Failed to set default card:', error);
            throw error;
        }
    }
};

/**
 * Utility to detect card brand from number
 */
export function detectCardBrand(number) {
    const clean = number.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'visa';
    if (/^5[1-5]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^6(?:011|5)/.test(clean)) return 'discover';
    // Basic RuPay detection
    if (/^6(0|52|53)/.test(clean)) return 'rupay';
    return 'unknown';
}
