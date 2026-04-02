import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';
import '../styles/StudyTracker.css';

export default function StudyTracker({ showToast }) {
  const [activeTab, setActiveTab] = useState('log');
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [suggestedSubjects, setSuggestedSubjects] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    customSubject: '',
    duration: 60,
    focusLevel: 'medium',
    topicsLearned: '',
    notes: '',
    difficulty: 'medium',
    resources: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Common subjects with emojis
  const commonSubjects = [
    '📚 Literature',
    '🔬 Physics',
    '⚗️ Chemistry',
    '🧮 Mathematics',
    '🌍 History',
    '🗺️ Geography',
    '💻 Computer Science',
    '🎨 Art',
    '🎵 Music',
    '📖 Languages',
    '⚙️ Engineering',
    '💰 Economics',
    '🧬 Biology',
    '🏛️ Philosophy'
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsFetching(true);
      const response = await studyAPI.getSessions();
      setSessions(response.data.data || []);
      loadSuggestedSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast('Failed to load study sessions', 'error');
      setSessions([]);
    } finally {
      setIsFetching(false);
    }
  };

  const loadSuggestedSubjects = (sessionsList) => {
    try {
      const uniqueSubjects = Array.from(
        new Set(sessionsList.map(s => s.subject).filter(Boolean))
      );
      setSuggestedSubjects(uniqueSubjects.slice(0, 5));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Cannot select future date';
      }
    }

    const selectedSubject = formData.subject?.trim() || formData.customSubject?.trim();
    if (!selectedSubject) {
      newErrors.subject = 'Please select or enter a subject';
    } else if (selectedSubject.length < 2) {
      newErrors.subject = 'Subject must be at least 2 characters';
    } else if (selectedSubject.length > 100) {
      newErrors.subject = 'Subject must not exceed 100 characters';
    }

    if (formData.duration < 5 || formData.duration > 480) {
      newErrors.duration = 'Duration must be between 5 and 480 minutes';
    }

    if (!['low', 'medium', 'high'].includes(formData.focusLevel)) {
      newErrors.focusLevel = 'Please select a valid focus level';
    }

    if (!['easy', 'medium', 'hard'].includes(formData.difficulty)) {
      newErrors.difficulty = 'Please select a valid difficulty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleSubjectSelect = (subject) => {
    // Remove emoji from subject
    const cleanSubject = subject.replace(/[\p{So}\p{Sk}]/gu, '').trim();
    setFormData(prev => ({
      ...prev,
      subject: cleanSubject,
      customSubject: ''
    }));
    setShowCustomInput(false);
    setTouched(prev => ({
      ...prev,
      [subject]: true
    }));

    if (errors.subject) {
      setErrors(prev => ({
        ...prev,
        subject: ''
      }));
    }
  };

  const handleCustomSubjectChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      customSubject: value,
      subject: ''
    }));

    setTouched(prev => ({
      ...prev,
      subject: true
    }));

    if (errors.subject && value.trim().length > 0) {
      setErrors(prev => ({
        ...prev,
        subject: ''
      }));
    }
  };

  const clearSubjectSelection = () => {
    setFormData(prev => ({
      ...prev,
      subject: '',
      customSubject: ''
    }));
    setShowCustomInput(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors above', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const submitData = {
        ...formData,
        subject: formData.customSubject?.trim() || formData.subject?.trim()
      };

      const response = await studyAPI.createSession(submitData);

      if (response.status === 201 || response.status === 200) {
        showToast('✅ Study session logged successfully!', 'success');

        setFormData({
          date: new Date().toISOString().split('T')[0],
          subject: '',
          customSubject: '',
          duration: 60,
          focusLevel: 'medium',
          topicsLearned: '',
          notes: '',
          difficulty: 'medium',
          resources: ''
        });
        setShowCustomInput(false);
        setTouched({});

        await fetchSessions();
        setActiveTab('history');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to log study session';
      showToast(message, 'error');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      setIsLoading(true);
      await studyAPI.deleteSession(id);
      showToast('✅ Session deleted successfully', 'success');
      await fetchSessions();
    } catch (error) {
      showToast('Failed to delete session', 'error');
      console.error('Delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'poor':
        return '#ef4444';
      case 'normal':
        return '#0ea5e9';
      case 'good':
        return '#22c55e';
      case 'excellent':
        return '#a855f7';
      default:
        return '#0ea5e9';
    }
  };

  const getQualityEmoji = (quality) => {
    switch (quality) {
      case 'poor':
        return '😞';
      case 'normal':
        return '😐';
      case 'good':
        return '😊';
      case 'excellent':
        return '🤩';
      default:
        return '😐';
    }
  };

  const selectedSubject = formData.customSubject || formData.subject;

  return (
    <div className="study-tracker">
      {/* Header */}
      <div className="tracker-header">
        <h1>📚 Study Tracker</h1>
        <p>Track your learning progress and study patterns</p>
      </div>

      {/* Tabs */}
      <div className="tracker-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'log'}
          className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          ➕ Log Study
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 History
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'analysis'}
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📊 Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Log Study Tab */}
        {activeTab === 'log' && (
          <div className="log-study-container">
            <form onSubmit={handleSubmit} className="study-form" noValidate>
              {/* Date Section */}
              <div className="form-section">
                <h3>📅 Study Date</h3>
                <div className="form-group">
                  <label htmlFor="date">
                    Date
                    <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('date')}
                    className={`form-input ${touched.date && errors.date ? 'error' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {touched.date && errors.date && (
                    <span className="error-text">❌ {errors.date}</span>
                  )}
                </div>
              </div>

              {/* Subject Section - IMPROVED CUSTOM INPUT */}
              <div className="form-section">
                <h3>📖 Subject</h3>

                {/* Subject Button Grid */}
                <div className="subject-selector">
                  {commonSubjects.map(subject => {
                    const cleanSubject = subject.replace(/[\p{So}\p{Sk}]/gu, '').trim();
                    return (
                      <button
                        key={subject}
                        type="button"
                        className={`subject-btn ${formData.subject === cleanSubject ? 'active' : ''}`}
                        onClick={() => handleSubjectSelect(subject)}
                        title={`Select ${cleanSubject}`}
                      >
                        {subject}
                      </button>
                    );
                  })}

                  {/* Custom Subject Button */}
                  <button
                    type="button"
                    className={`subject-btn custom-btn ${showCustomInput || formData.customSubject ? 'active' : ''}`}
                    onClick={() => {
                      setShowCustomInput(!showCustomInput);
                      if (!showCustomInput && formData.customSubject) {
                        setFormData(prev => ({
                          ...prev,
                          subject: '',
                          customSubject: ''
                        }));
                      }
                    }}
                    title="Enter your own subject"
                  >
                    ✏️ Custom
                  </button>
                </div>

                {/* Custom Subject Input Field */}
                {showCustomInput && (
                  <div className="custom-subject-input-wrapper">
                    <input
                      type="text"
                      name="customSubject"
                      value={formData.customSubject}
                      onChange={handleCustomSubjectChange}
                      onBlur={() => handleFieldBlur('customSubject')}
                      placeholder="Enter your own subject (e.g., Web Development, Photography, etc.)"
                      className={`form-input custom-subject-input ${touched.subject && errors.subject ? 'error' : ''}`}
                      maxLength="100"
                      autoFocus
                      aria-label="Custom subject input"
                    />
                    <span className="char-count">{formData.customSubject.length}/100</span>
                  </div>
                )}

                {/* Display Selected Subject */}
                {selectedSubject && !showCustomInput && (
                  <div className="selected-subject-display">
                    <span className="selected-subject">
                      ✅ Selected: {selectedSubject}
                    </span>
                    <button
                      type="button"
                      className="btn-clear"
                      onClick={clearSubjectSelection}
                      title="Clear subject selection"
                    >
                      ✕ Clear
                    </button>
                  </div>
                )}

                {/* Subject Error */}
                {touched.subject && errors.subject && (
                  <span className="error-text">❌ {errors.subject}</span>
                )}

                {/* Suggested Subjects */}
                {suggestedSubjects.length > 0 && !showCustomInput && (
                  <div className="suggested-subjects">
                    <p className="suggested-title">💡 Your previous subjects:</p>
                    <div className="suggestion-tags">
                      {suggestedSubjects.map(subject => (
                        <button
                          key={subject}
                          type="button"
                          className="suggestion-tag"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              subject: subject,
                              customSubject: ''
                            }));
                            setShowCustomInput(false);
                            setTouched(prev => ({
                              ...prev,
                              subject: true
                            }));
                          }}
                          title={`Select ${subject}`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Duration Section */}
              <div className="form-section">
                <h3>⏱️ Study Duration</h3>
                <div className="form-group">
                  <label htmlFor="duration">
                    Duration (minutes)
                    <span className="value-badge">{formatDuration(formData.duration)}</span>
                  </label>
                  <input
                    type="range"
                    id="duration"
                    name="duration"
                    min="5"
                    max="480"
                    step="5"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="form-range"
                  />
                  <div className="range-labels">
                    <span>5 min</span>
                    <span>8 hrs</span>
                  </div>
                </div>
              </div>

              {/* Focus Level Section */}
              <div className="form-section">
                <h3>🎯 Focus Level</h3>
                <div className="focus-selector">
                  {[
                    { value: 'low', label: 'Low', emoji: '😐' },
                    { value: 'medium', label: 'Medium', emoji: '😊' },
                    { value: 'high', label: 'High', emoji: '🔥' }
                  ].map(level => (
                    <label key={level.value} className="focus-option">
                      <input
                        type="radio"
                        name="focusLevel"
                        value={level.value}
                        checked={formData.focusLevel === level.value}
                        onChange={handleInputChange}
                      />
                      <span className="focus-label">
                        {level.emoji} {level.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Section */}
              <div className="form-section">
                <h3>📈 Difficulty Level</h3>
                <div className="difficulty-selector">
                  {[
                    { value: 'easy', label: 'Easy', stars: '⭐' },
                    { value: 'medium', label: 'Medium', stars: '⭐⭐' },
                    { value: 'hard', label: 'Hard', stars: '⭐⭐⭐' }
                  ].map(diff => (
                    <label key={diff.value} className="difficulty-option">
                      <input
                        type="radio"
                        name="difficulty"
                        value={diff.value}
                        checked={formData.difficulty === diff.value}
                        onChange={handleInputChange}
                      />
                      <span className="difficulty-label">
                        {diff.stars} {diff.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Topics Learned Section */}
              <div className="form-section">
                <h3>🎓 Topics Learned</h3>
                <div className="form-group">
                  <label htmlFor="topicsLearned">What did you learn?</label>
                  <textarea
                    id="topicsLearned"
                    name="topicsLearned"
                    value={formData.topicsLearned}
                    onChange={handleInputChange}
                    placeholder="List the topics you covered (e.g., Chapter 5, Functions, Variables)"
                    className="form-textarea"
                    maxLength="500"
                  ></textarea>
                  <span className="char-count">{formData.topicsLearned.length}/500</span>
                </div>
              </div>

              {/* Resources Section */}
              <div className="form-section">
                <h3>📚 Resources Used</h3>
                <div className="form-group">
                  <label htmlFor="resources">What resources did you use?</label>
                  <input
                    type="text"
                    id="resources"
                    name="resources"
                    value={formData.resources}
                    onChange={handleInputChange}
                    placeholder="e.g., Textbook, YouTube, Khan Academy, Udemy"
                    className="form-input"
                    maxLength="200"
                  />
                  <span className="char-count">{formData.resources.length}/200</span>
                </div>
              </div>

              {/* Notes Section */}
              <div className="form-section">
                <h3>📝 Additional Notes</h3>
                <div className="form-group">
                  <label htmlFor="notes">Any extra notes?</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="How did the study session go? Any challenges?"
                    className="form-textarea"
                    maxLength="500"
                  ></textarea>
                  <span className="char-count">{formData.notes.length}/500</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-submit"
                disabled={isLoading || !selectedSubject}
              >
                {isLoading ? '⏳ Logging...' : '✅ Log Study Session'}
              </button>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-container">
            {isFetching ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading sessions...</p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="sessions-grid">
                {sessions.map(session => (
                  <div key={session._id} className="session-card">
                    <div className="session-header">
                      <div className="session-info">
                        <span className="session-subject">📖 {session.subject}</span>
                        <span className="session-date">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(session._id)}
                        title={`Delete ${session.subject} session`}
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="session-details">
                      <div className="detail-row">
                        <span>⏱️ Duration</span>
                        <span className="detail-value">{formatDuration(session.duration)}</span>
                      </div>
                      <div className="detail-row">
                        <span>🎯 Focus</span>
                        <span className="detail-value">{session.focusLevel.charAt(0).toUpperCase() + session.focusLevel.slice(1)}</span>
                      </div>
                      <div className="detail-row">
                        <span>📈 Difficulty</span>
                        <span className="detail-value">{session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}</span>
                      </div>

                      {session.topicsLearned && (
                        <div className="detail-full">
                          <span className="detail-label">🎓 Topics Learned:</span>
                          <p>{session.topicsLearned}</p>
                        </div>
                      )}

                      {session.resources && (
                        <div className="detail-full">
                          <span className="detail-label">📚 Resources:</span>
                          <p>{session.resources}</p>
                        </div>
                      )}

                      {session.notes && (
                        <div className="detail-full">
                          <span className="detail-label">📝 Notes:</span>
                          <p>{session.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📚</span>
                <p className="empty-message">No study sessions logged yet</p>
                <p className="empty-subtext">Start tracking your study to see your history</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('log')}
                >
                  ➕ Log Your First Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-container">
            {isFetching ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Analyzing your data...</p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="analysis-grid">
                <div className="analysis-card">
                  <h3>📚 Total Study Time</h3>
                  <div className="analysis-value">
                    {formatDuration(
                      sessions.reduce((sum, s) => sum + s.duration, 0)
                    )}
                  </div>
                  <p className="analysis-meta">Across all sessions</p>
                </div>

                <div className="analysis-card">
                  <h3>🔥 Average Focus</h3>
                  <div className="analysis-value">
                    {sessions.reduce((sum, s) => {
                      const scores = { low: 1, medium: 2, high: 3 };
                      return sum + scores[s.focusLevel];
                    }, 0) / sessions.length >= 2.5 ? '🔥 High' : '😊 Medium'}
                  </div>
                  <p className="analysis-meta">Your typical focus level</p>
                </div>

                <div className="analysis-card">
                  <h3>📖 Subjects Studied</h3>
                  <div className="analysis-value">
                    {new Set(sessions.map(s => s.subject)).size}
                  </div>
                  <p className="analysis-meta">Different subjects</p>
                </div>

                <div className="analysis-card">
                  <h3>📈 Sessions Logged</h3>
                  <div className="analysis-value">{sessions.length}</div>
                  <p className="analysis-meta">Total sessions</p>
                </div>

                {/* Subject Breakdown */}
                <div className="analysis-card full-width">
                  <h3>📚 Study Breakdown by Subject</h3>
                  <div className="subject-breakdown">
                    {Array.from(
                      new Set(sessions.map(s => s.subject))
                    ).map(subject => {
                      const totalMinutes = sessions
                        .filter(s => s.subject === subject)
                        .reduce((sum, s) => sum + s.duration, 0);
                      const percentage = (
                        (totalMinutes / sessions.reduce((sum, s) => sum + s.duration, 0)) *
                        100
                      ).toFixed(1);

                      return (
                        <div key={subject} className="breakdown-item">
                          <span className="breakdown-subject" title={subject}>
                            {subject}
                          </span>
                          <div className="breakdown-bar">
                            <div
                              className="breakdown-fill"
                              style={{ width: `${percentage}%` }}
                              role="progressbar"
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <span className="breakdown-time">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p className="empty-message">No data to analyze yet</p>
                <p className="empty-subtext">Log more study sessions to see insights</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}