// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

export async function getDestinations(country, state, days) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/destinations?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}&days=${encodeURIComponent(days)}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch destinations');
    }
    
    const data = await response.json();
    return data.destinations;
  } catch (error) {
    console.error("Error fetching destinations:", error);
    throw error;
  }
}