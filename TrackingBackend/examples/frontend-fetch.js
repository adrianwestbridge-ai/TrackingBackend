/**
 * Frontend Integration Helper for TrackingBackend
 * Base URL of your backend API
 */
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 1. Send Credentials from Frontend to Backend
 * @param {Object} credentials - { username, email, password, token, siteUrl }
 */
export async function sendCredentials(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to save credentials');
    console.log('Credentials stored:', data);
    return data;
  } catch (error) {
    console.error('Error storing credentials:', error);
    throw error;
  }
}

/**
 * 2. Send Session Tracking Data from Frontend
 * @param {Object} sessionData - { landingPage, mobile, ipAddress, device, os, browser, trafficSource, adPlatform, events }
 */
export async function trackSession(sessionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send tracking data');
    console.log('Session tracked:', data);
    return data;
  } catch (error) {
    console.error('Error tracking session:', error);
    throw error;
  }
}

/**
 * 3. Log a Specific User Event to Existing Session
 * @param {string} sessionId
 * @param {string} eventName - e.g. "CALL_BUTTON_CLICK", "FORM_SUBMIT"
 * @param {Object} details - optional metadata object
 */
export async function logSessionEvent(sessionId, eventName, details = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: eventName, details }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to log event');
    return data;
  } catch (error) {
    console.error('Error logging session event:', error);
    throw error;
  }
}
