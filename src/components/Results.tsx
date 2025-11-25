import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Result {
  attempt_id: number;
  score: number;
  date: string;
  time_taken: number;
  title: string;
}

interface AttemptDetail {
  question_text: string;
  selected_answer: string;
  correct_answer: string;
}

interface ResultsProps {
  user_id: string;
}

const Results: React.FC<ResultsProps> = ({ user_id }) => {
  const [results, setResults] = useState<Result[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptDetail[] | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results?user_id=${user_id}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user_id]);

  const handleResultClick = async (attempt_id: number) => {
    if (selectedAttemptId === attempt_id) {
      setSelectedAttemptId(null);
      setSelectedAttempt(null);
      return;
    }

    try {
      const response = await fetch(`/api/results/${attempt_id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedAttempt(data.data);
        setSelectedAttemptId(attempt_id);
      } else {
        // Handle case where no details are found
        setSelectedAttempt([]);
        setSelectedAttemptId(attempt_id);
      }
    } catch (error) {
      console.error('Error fetching attempt details:', error);
      // Handle network errors
      setSelectedAttempt([]);
      setSelectedAttemptId(attempt_id);
    }
  };

  if (loading) {
    return <div>Loading results...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result) => (
          <motion.div
            key={result.attempt_id}
            layout
            initial={{ borderRadius: 10 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            onClick={() => handleResultClick(result.attempt_id)}
          >
            <motion.h3 layout="position" className="text-2xl font-bold text-white mb-2">{result.title}</motion.h3>
            <motion.p layout="position" className="text-lg text-gray-400">Score: {result.score}</motion.p>
            <motion.p layout="position" className="text-md text-gray-500">Date: {new Date(result.date).toLocaleDateString()}</motion.p>
            <AnimatePresence>
              {selectedAttemptId === result.attempt_id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-4"
                >
                  {selectedAttempt && selectedAttempt.length > 0 ? (
                    <ul className="space-y-4">
                      {selectedAttempt.map((detail, index) => (
                        <li key={index} className="bg-gray-700 p-4 rounded-md">
                          <p className="font-semibold text-white"><strong>Question:</strong> {detail.question_text}</p>
                          <p className="text-gray-300"><strong>Your Answer:</strong> {detail.selected_answer || 'No answer provided'}</p>
                          <p className="text-green-400"><strong>Correct Answer:</strong> {detail.correct_answer}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-gray-700 p-4 rounded-md text-center text-gray-300">
                      No detailed attempt information available for this quiz.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Results;