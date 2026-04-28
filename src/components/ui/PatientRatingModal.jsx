import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, MessageSquare, Clock, Stethoscope, Send } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import API from '../../api';
import { useToast } from './ToastNotification';

const StarRating = ({ value, onChange, size = 24 }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(star)}
                    className={`p-1 transition-colors outline-none ${
                        star <= value ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
                    }`}
                >
                    <Star size={size} fill={star <= value ? "currentColor" : "none"} strokeWidth={star <= value ? 1 : 2} />
                </motion.button>
            ))}
        </div>
    );
};

const PatientRatingModal = ({ isOpen, onClose, appointment, currentUser, onSuccess }) => {
    const toast = useToast();
    
    // Core rating is required, sub-ratings are optional but default to core rating
    const [rating, setRating] = useState(0);
    const [consultationQuality, setConsultationQuality] = useState(0);
    const [communication, setCommunication] = useState(0);
    const [waitTime, setWaitTime] = useState(0);
    const [review, setReview] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Auto-fill sub ratings when main rating is clicked (if they haven't been explicitly set)
    const handleMainRating = (val) => {
        setRating(val);
        if (consultationQuality === 0) setConsultationQuality(val);
        if (communication === 0) setCommunication(val);
        if (waitTime === 0) setWaitTime(val);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Rating Required', 'Please provide an overall star rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                appointmentId: appointment.id || appointment.appointmentId,
                patientId: currentUser.id,
                doctorId: appointment.doctorId,
                rating: rating,
                review: review.trim() || 'No written review provided.',
                consultationQuality: consultationQuality || rating,
                communication: communication || rating,
                waitTime: waitTime || rating
            };

            await API.post('/reviews', payload);
            
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);
            
        } catch (err) {
            console.error('Rating Error:', err);
            const msg = err.response?.data?.message || 'Failed to submit review. It may have already been submitted.';
            toast.error('Submission Failed', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!appointment) return null;

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={() => {}} title="" size="sm">
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-inner"
                    >
                        <CheckCircle size={40} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800">Thank You!</h3>
                    <p className="text-sm text-slate-500 text-center">Your feedback helps us improve telemedicine for everyone.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Consultation" size="md">
            <div className="space-y-6">
                
                {/* Doctor Context */}
                <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-2xl font-bold">{appointment.doctorName ? appointment.doctorName.replace('Dr. ', '').charAt(0) : 'D'}</span>
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-lg text-slate-800">{appointment.doctorName || 'Your Doctor'}</h4>
                        <p className="text-sm text-slate-500">{appointment.doctorSpecialty || 'Consultation Completed'}</p>
                    </div>
                    <div className="pt-2">
                        <StarRating value={rating} onChange={handleMainRating} size={32} />
                    </div>
                </div>

                {/* Sub Ratings */}
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: rating > 0 ? 1 : 0, height: rating > 0 ? 'auto' : 0 }}
                    className="space-y-4 overflow-hidden"
                >
                    <div className="space-y-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Feedback</h5>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <Stethoscope size={16} className="text-blue-400" /> Medical Quality
                            </span>
                            <StarRating value={consultationQuality} onChange={setConsultationQuality} size={20} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <MessageSquare size={16} className="text-indigo-400" /> Communication
                            </span>
                            <StarRating value={communication} onChange={setCommunication} size={20} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <Clock size={16} className="text-emerald-400" /> Wait Time
                            </span>
                            <StarRating value={waitTime} onChange={setWaitTime} size={20} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Written Review (Optional)</label>
                        <textarea 
                            value={review} 
                            onChange={e => setReview(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                            placeholder="How was your experience?"
                            rows={3}
                        />
                    </div>
                </motion.div>

                <div className="flex gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Skip</Button>
                    <Button 
                        icon={Send} 
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-blue-500/30"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting || rating === 0}
                    >
                        Submit Review
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PatientRatingModal;
