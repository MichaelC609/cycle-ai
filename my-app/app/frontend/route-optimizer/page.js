'use client';

import { useState } from 'react';

export default function RouteOptimizer() {
  const [formData, setFormData] = useState({
    startAddress: '',
    endAddress: '',
    routePreferences: [],
    avoidTraffic: '',
    roadTypes: [],
    avoidDetours: '',
    avoidSteepHills: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <div className="route-optimizer-container">
      <h1>Plan Your Route:</h1>
      <p className="description">Enter your route preferences to get the most <br />
      optimal route<br /></p>
      
      <form onSubmit={handleSubmit} className="route-form">
        {/* Location Inputs */}
        <div className="locations-section">
          <h2>Enter Locations:</h2>
          
          <div className="input-group">
            <label htmlFor="startAddress">Start Address:</label>
            <input
              type="text"
              id="startAddress"
              name="startAddress"
              value={formData.startAddress}
              onChange={handleInputChange}
              className="address-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="endAddress">End Address:</label>
            <input
              type="text"
              id="endAddress"
              name="endAddress"
              value={formData.endAddress}
              onChange={handleInputChange}
              className="address-input"
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="preferences-section">
          <h2>Enter Preferences:</h2>
          
          {/* Route Preferences */}
          <div className="preference-group">
            <label>Route Preferences:</label>
            <div className="checkbox-group">
              {['Safest', 'Fastest', 'Balanced', 'Scenic'].map((option) => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option.toLowerCase()}
                    onChange={(e) => handleCheckboxChange(e, 'routePreferences')}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Avoid Traffic */}
          <div className="preference-group">
            <label>Avoid Traffic:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="avoidTraffic"
                  value="yes"
                  onChange={handleInputChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="avoidTraffic"
                  value="no"
                  onChange={handleInputChange}
                />
                No
              </label>
            </div>
          </div>

          {/* Road Types */}
          <div className="preference-group">
            <label>Road Types:</label>
            <div className="checkbox-group">
              {['Paved', 'Gravel', 'Dirt'].map((option) => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option.toLowerCase()}
                    onChange={(e) => handleCheckboxChange(e, 'roadTypes')}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Avoid Detours */}
          <div className="preference-group">
            <label>Avoid Detours:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="avoidDetours"
                  value="yes"
                  onChange={handleInputChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="avoidDetours"
                  value="no"
                  onChange={handleInputChange}
                />
                No
              </label>
            </div>
          </div>

          {/* Avoid Steep Hills */}
          <div className="preference-group">
            <label>Avoid Steep Hills:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="avoidSteepHills"
                  value="yes"
                  onChange={handleInputChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="avoidSteepHills"
                  value="no"
                  onChange={handleInputChange}
                />
                No
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      <style jsx>{`
        .route-optimizer-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        h1 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #333;
        }

        .description {
          margin-bottom: 20px;
          color: #666;
          font-style: italic;
        }

        .route-form {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .locations-section,
        .preferences-section {
          margin-bottom: 25px;
        }

        h2 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #333;
        }

        .input-group {
          margin-bottom: 15px;
        }

        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }

        .address-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .preference-group {
          margin-bottom: 20px;
        }

        .preference-group > label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #555;
        }

        .checkbox-group,
        .radio-group {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .checkbox-label,
        .radio-label {
          display: flex;
          align-items: center;
          font-weight: normal;
          cursor: pointer;
        }

        .checkbox-label input,
        .radio-label input {
          margin-right: 8px;
        }

        .submit-button {
          background-color: #007cba;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .submit-button:hover {
          background-color: #005a87;
        }

        @media (max-width: 768px) {
          .route-optimizer-container {
            padding: 15px;
          }
          
          .checkbox-group,
          .radio-group {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}