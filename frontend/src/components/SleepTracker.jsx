import { useState, useEffect } from 'react';
import { sleepAPI } from '../services/api';
import '../styles/SleepTracker.css';

export default function SleepTracker({ showToast }) {
    const [activeTab, setActiveTab] = useState('log');
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form state with improved defaults
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        bedtime: '22:00',
        wakeTime: '07:00',
        duration: 480,
        quality: 'good',
        interruptions: 0,
        notes: '',
        environment: 'dark',
        temperature: 'cool'
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setIsFetching(true);
            const response = await sleepAPI.getSessions();
            setSessions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            showToast('Failed to load sleep sessions', 'error');
            setSessions([]);
        } finally {
            setIsFetching(false);
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

        if (!formData.bedtime || !/^\d{2}:\d{2}$/.test(formData.bedtime)) {
            newErrors.bedtime = 'Bedtime must be in HH:MM format';
        }

        if (!formData.wakeTime || !/^\d{2}:\d{2}$/.test(formData.wakeTime)) {
            newErrors.wakeTime = 'Wake time must be in HH:MM format';
        }

        if (formData.duration < 0 || formData.duration > 1440) {
            newErrors.duration = 'Duration must be between 0 and 1440 minutes';
        }

        if (formData.duration < 120) {
            newErrors.duration = 'Sleep duration should be at least 2 hours for health';
        }

        if (!['poor', 'normal', 'good', 'excellent'].includes(formData.quality)) {
            newErrors.quality = 'Please select a valid quality';
        }

        if (formData.interruptions < 0 || formData.interruptions > 10) {
            newErrors.interruptions = 'Interruptions must be between 0 and 10';
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

        if ((name === 'bedtime' || name === 'wakeTime') && formData.bedtime && formData.wakeTime) {
            calculateDuration({
                ...formData,
                [name]: value
            });
        }
    };

    const handleFieldBlur = (fieldName) => {
        setTouched(prev => ({
            ...prev,
            [fieldName]: true
        }));
    };

    const calculateDuration = (data) => {
        if (!data.bedtime || !data.wakeTime) return;

        const [bedHour, bedMin] = data.bedtime.split(':').map(Number);
        const [wakeHour, wakeMin] = data.wakeTime.split(':').map(Number);

        let bedMinutes = bedHour * 60 + bedMin;
        let wakeMinutes = wakeHour * 60 + wakeMin;

        if (wakeMinutes <= bedMinutes) {
            wakeMinutes += 24 * 60;
        }

        const duration = wakeMinutes - bedMinutes;
        setFormData(prev => ({
            ...prev,
            duration: Math.max(0, duration)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors above', 'error');
            return;
        }

        try {
            setIsLoading(true);
            const response = await sleepAPI.createSession(formData);

            if (response.status === 201 || response.status === 200) {
                showToast('✅ Sleep session logged successfully!', 'success');

                // Reset form
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    bedtime: '22:00',
                    wakeTime: '07:00',
                    duration: 480,
                    quality: 'good',
                    interruptions: 0,
                    notes: '',
                    environment: 'dark',
                    temperature: 'cool'
                });
                setTouched({});

                // Refresh sessions and switch to history
                await fetchSessions();
                setActiveTab('history');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to log sleep session';
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
            await sleepAPI.deleteSession(id);
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
        return `${hours}h ${mins}m`;
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

    return (
        <div className="sleep-tracker">
            {/* Header */}
            <div className="tracker-header">
                <h1>😴 Sleep Tracker</h1>
                <p>Track and optimize your sleep patterns for better health</p>
            </div>

            {/* Tabs */}
            <div className="tracker-tabs" role="tablist">
                <button
                    role="tab"
                    aria-selected={activeTab === 'log'}
                    className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
                    onClick={() => setActiveTab('log')}
                >
                    ➕ Log Sleep
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
                {/* Log Sleep Tab */}
                {activeTab === 'log' && (
                    <div className="log-sleep-container">
                        <form onSubmit={handleSubmit} className="sleep-form" noValidate>
                            {/* Date Section */}
                            <div className="form-section">
                                <h3>📅 Sleep Date</h3>
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

                            {/* Sleep Time Section - IMPROVED ALIGNMENT */}
                            <div className="form-section">
                                <h3>⏰ Sleep Time</h3>

                                <div className="time-inputs-wrapper">
                                    {/* Bedtime */}
                                    <div className="time-input-group">
                                        <div className="form-group">
                                            <label htmlFor="bedtime">
                                                🛏️ Bedtime
                                                <span className="required">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                id="bedtime"
                                                name="bedtime"
                                                value={formData.bedtime}
                                                onChange={handleInputChange}
                                                onBlur={() => handleFieldBlur('bedtime')}
                                                className={`form-input time-input ${touched.bedtime && errors.bedtime ? 'error' : ''}`}
                                            />
                                            {touched.bedtime && errors.bedtime && (
                                                <span className="error-text">❌ {errors.bedtime}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Divider Arrow - PERFECTLY ALIGNED */}
                                    <div className="time-divider">
                                        <span aria-label="to">→</span>
                                    </div>

                                    {/* Wake Time */}
                                    <div className="time-input-group">
                                        <div className="form-group">
                                            <label htmlFor="wakeTime">
                                                ⏰ Wake Time
                                                <span className="required">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                id="wakeTime"
                                                name="wakeTime"
                                                value={formData.wakeTime}
                                                onChange={handleInputChange}
                                                onBlur={() => handleFieldBlur('wakeTime')}
                                                className={`form-input time-input ${touched.wakeTime && errors.wakeTime ? 'error' : ''}`}
                                            />
                                            {touched.wakeTime && errors.wakeTime && (
                                                <span className="error-text">❌ {errors.wakeTime}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Duration Display */}
                                <div className="duration-display">
                                    <div className="duration-box">
                                        <span className="duration-label">Total Sleep</span>
                                        <span className="duration-value">{formatDuration(formData.duration)}</span>
                                        {formData.duration < 420 && (
                                            <span className="duration-warning">⚠️ Less than 7 hours</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quality Section */}
                            <div className="form-section">
                                <h3>⭐ Sleep Quality</h3>
                                <div className="quality-selector">
                                    {[
                                        { value: 'poor', label: 'Poor', emoji: '😞' },
                                        { value: 'normal', label: 'Normal', emoji: '😐' },
                                        { value: 'good', label: 'Good', emoji: '😊' },
                                        { value: 'excellent', label: 'Excellent', emoji: '🤩' }
                                    ].map(quality => (
                                        <label key={quality.value} className="quality-option">
                                            <input
                                                type="radio"
                                                name="quality"
                                                value={quality.value}
                                                checked={formData.quality === quality.value}
                                                onChange={handleInputChange}
                                            />
                                            <span className="quality-label">
                                                {quality.emoji} {quality.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Interruptions Section */}
                            <div className="form-section">
                                <h3>🔔 Sleep Interruptions</h3>
                                <div className="form-group">
                                    <label htmlFor="interruptions">
                                        Number of Interruptions
                                        <span className="value-badge">{formData.interruptions}</span>
                                    </label>
                                    <input
                                        type="range"
                                        id="interruptions"
                                        name="interruptions"
                                        min="0"
                                        max="10"
                                        value={formData.interruptions}
                                        onChange={handleInputChange}
                                        className="form-range"
                                    />
                                    <div className="range-labels">
                                        <span>None</span>
                                        <span>10+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Environment Section */}
                            <div className="form-section">
                                <h3>🌍 Sleep Environment</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="environment">Light Level</label>
                                        <select
                                            id="environment"
                                            name="environment"
                                            value={formData.environment}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="dark">🌑 Dark</option>
                                            <option value="dim">🌙 Dim</option>
                                            <option value="bright">☀️ Bright</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="temperature">Temperature</label>
                                        <select
                                            id="temperature"
                                            name="temperature"
                                            value={formData.temperature}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="cold">❄️ Cold</option>
                                            <option value="cool">🧊 Cool</option>
                                            <option value="comfortable">😌 Comfortable</option>
                                            <option value="warm">🔥 Warm</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="form-section">
                                <h3>📝 Notes</h3>
                                <div className="form-group">
                                    <label htmlFor="notes">Add any additional notes</label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="How did you feel? Any issues? (Optional)"
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
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳ Logging...' : '✅ Log Sleep Session'}
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
                                            <div className="session-date">
                                                <span className="date-icon">📅</span>
                                                <span className="date-text">
                                                    {new Date(session.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(session._id)}
                                                title="Delete session"
                                                aria-label={`Delete session for ${session.date}`}
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="session-details">
                                            <div className="detail-item">
                                                <span className="detail-icon">🛏️</span>
                                                <div>
                                                    <p className="detail-label">Sleep Time</p>
                                                    <p className="detail-value">{session.bedtime} - {session.wakeTime}</p>
                                                </div>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-icon">⏱️</span>
                                                <div>
                                                    <p className="detail-label">Duration</p>
                                                    <p className="detail-value">{formatDuration(session.duration)}</p>
                                                </div>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-icon">⭐</span>
                                                <div>
                                                    <p className="detail-label">Quality</p>
                                                    <p className={`detail-value quality-${session.quality}`}>
                                                        {getQualityEmoji(session.quality)} {session.quality.charAt(0).toUpperCase() + session.quality.slice(1)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="detail-item">
                                                <span className="detail-icon">🔔</span>
                                                <div>
                                                    <p className="detail-label">Interruptions</p>
                                                    <p className="detail-value">{session.interruptions}</p>
                                                </div>
                                            </div>

                                            {session.notes && (
                                                <div className="detail-item full-width">
                                                    <span className="detail-icon">📝</span>
                                                    <div>
                                                        <p className="detail-label">Notes</p>
                                                        <p className="detail-value">{session.notes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">😴</span>
                                <p className="empty-message">No sleep sessions logged yet</p>
                                <p className="empty-subtext">Start tracking your sleep to see your history</p>
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
                                    <h3>📊 Average Sleep Duration</h3>
                                    <div className="analysis-value">
                                        {formatDuration(
                                            Math.round(
                                                sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
                                            )
                                        )}
                                    </div>
                                    <p className="analysis-meta">{sessions.length} sessions tracked</p>
                                </div>

                                <div className="analysis-card">
                                    <h3>⭐ Average Quality</h3>
                                    <div className="analysis-value">
                                        {getQualityEmoji(
                                            ['poor', 'normal', 'good', 'excellent'][
                                            Math.round(
                                                sessions.reduce((sum, s) => {
                                                    const scores = { poor: 1, normal: 2, good: 3, excellent: 4 };
                                                    return sum + scores[s.quality];
                                                }, 0) / sessions.length
                                            ) - 1
                                            ]
                                        )}
                                    </div>
                                    <p className="analysis-meta">
                                        {['poor', 'normal', 'good', 'excellent'][
                                            Math.round(
                                                sessions.reduce((sum, s) => {
                                                    const scores = { poor: 1, normal: 2, good: 3, excellent: 4 };
                                                    return sum + scores[s.quality];
                                                }, 0) / sessions.length
                                            ) - 1
                                        ]?.charAt(0).toUpperCase() +
                                            ['poor', 'normal', 'good', 'excellent'][
                                                Math.round(
                                                    sessions.reduce((sum, s) => {
                                                        const scores = { poor: 1, normal: 2, good: 3, excellent: 4 };
                                                        return sum + scores[s.quality];
                                                    }, 0) / sessions.length
                                                ) - 1
                                            ]?.slice(1) || 'N/A'
                                        } </p>
                                </div>

                                <div className="analysis-card">
                                    <h3>🔔 Total Interruptions</h3>
                                    <div className="analysis-value">
                                        {sessions.reduce((sum, s) => sum + s.interruptions, 0)}
                                    </div>
                                    <p className="analysis-meta">Across all sessions</p>
                                </div>

                                <div className="analysis-card">
                                    <h3>📈 Best Night</h3>
                                    <div className="analysis-value">
                                        {formatDuration(
                                            Math.max(...sessions.map(s => s.duration), 0)
                                        )}
                                    </div>
                                    <p className="analysis-meta">Your longest sleep</p>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <span className="empty-icon">📊</span>
                                <p className="empty-message">No data to analyze yet</p>
                                <p className="empty-subtext">Log more sleep sessions to see insights</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}