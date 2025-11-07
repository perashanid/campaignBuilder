import { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaLightbulb, FaBullseye, FaCommentDots } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { improveTextWithGemini, GeminiSuggestion } from '../services/gemini';
import styles from './AIWritingAssistant.module.css';

interface AIWritingAssistantProps {
  text: string;
  fieldType: 'title' | 'description';
  campaignType: 'fundraising' | 'blood-donation';
  onApply: (text: string) => void;
}

export function AIWritingAssistant({ 
  text, 
  fieldType, 
  campaignType, 
  onApply 
}: AIWritingAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<GeminiSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestions = async () => {
    if (!text.trim()) {
      setError('Please enter some text first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await improveTextWithGemini(text, fieldType, campaignType);
      setSuggestion(result);
      setShowSuggestions(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (text: string) => {
    onApply(text);
    setShowSuggestions(false);
    setSuggestion(null);
  };

  return (
    <div className={styles.aiAssistant}>
      <button
        type="button"
        className={styles.aiButton}
        onClick={handleGetSuggestions}
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Getting AI suggestions...
          </>
        ) : (
          <>
            <HiSparkles className={styles.icon} />
            Improve with AI
          </>
        )}
      </button>

      {error && (
        <div className={styles.error}>
          <FaExclamationTriangle className={styles.errorIcon} />
          {error}
        </div>
      )}

      {showSuggestions && suggestion && (
        <div className={styles.suggestions}>
          <div className={styles.suggestionsHeader}>
            <h4>AI Suggestions</h4>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setShowSuggestions(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.improvedVersion}>
            <div className={styles.suggestionLabel}>
              <FaLightbulb className={styles.labelIcon} />
              Improved Version
            </div>
            <div className={styles.suggestionText}>
              {suggestion.improvedText}
            </div>
            <button
              type="button"
              className={styles.applyButton}
              onClick={() => handleApplySuggestion(suggestion.improvedText)}
            >
              Apply This
            </button>
          </div>

          {suggestion.suggestions.length > 0 && (
            <div className={styles.alternatives}>
              <div className={styles.suggestionLabel}>
                <FaBullseye className={styles.labelIcon} />
                Alternative Suggestions
              </div>
              {suggestion.suggestions.map((alt, index) => (
                <div key={index} className={styles.alternative}>
                  <div className={styles.alternativeText}>{alt}</div>
                  <button
                    type="button"
                    className={styles.applyButtonSmall}
                    onClick={() => handleApplySuggestion(alt)}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.tips}>
            <div className={styles.tipsLabel}>
              <FaCommentDots className={styles.tipsIcon} /> Tips for improvement:
            </div>
            <ul className={styles.tipsList}>
              {fieldType === 'title' ? (
                <>
                  <li>Keep it concise and impactful</li>
                  <li>Include emotional appeal</li>
                  <li>Make it specific and clear</li>
                </>
              ) : (
                <>
                  <li>Start with a compelling hook</li>
                  <li>Be specific about the need</li>
                  <li>Include a clear call to action</li>
                  <li>Show impact and urgency</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
