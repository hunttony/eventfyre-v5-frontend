import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAttendee } from '../../../contexts/AttendeeContext';

const FeedbackModal = ({ event, isOpen, onClose, onSubmit }) => {
  const { submitFeedback } = useAttendee();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal is opened/closed or event changes
  useEffect(() => {
    if (isOpen && event) {
      setRating(0);
      setComment('');
      setError('');
    }
  }, [isOpen, event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!event) return;
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const feedbackData = {
        eventId: event._id || event.id,
        rating,
        comment: comment.trim(),
        anonymous: false // Could be made configurable
      };
      
      await submitFeedback(feedbackData);
      
      // Call the parent's onSubmit callback if provided
      if (onSubmit) {
        onSubmit(feedbackData);
      }
      
      // Close the modal after successful submission
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Event Feedback
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-500">
                    {event.startDate && new Date(event.startDate).toLocaleDateString()}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you rate this event? *
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`p-1 rounded-full focus:outline-none ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          onClick={() => setRating(star)}
                          disabled={isSubmitting}
                        >
                          <svg
                            className="h-8 w-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {error && rating === 0 && (
                      <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Your feedback (optional)
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                      placeholder="What did you like or think could be improved?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && error !== 'Please select a rating' && (
                    <div className="mb-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={isSubmitting || rating === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

FeedbackModal.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    startDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

export default FeedbackModal;
