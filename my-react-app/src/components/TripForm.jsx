import React, { useState } from 'react';

const TripForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    days: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // send form data to parent (App.jsx)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-1">
          Country
        </label>
        <input
          type="text"
          name="country"
          id="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <div>
        <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-1">
          State
        </label>
        <input
          type="text"
          name="state"
          id="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <div>
        <label htmlFor="days" className="block text-sm font-semibold text-gray-700 mb-1">
          Number of Days
        </label>
        <input
          type="number"
          name="days"
          id="days"
          placeholder="Number of Days"
          value={formData.days}
          onChange={handleChange}
          required
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-lg"
      >
        Plan Trip
      </button>
    </form>
  );
};

export default TripForm;
