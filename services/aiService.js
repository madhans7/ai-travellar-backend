// Mock AI service - replace with OpenAI integration later
const generateTrip = async ({ destination, days = 3, interests = [] } = {}) => {
  // Simple deterministic mock based on inputs
  const itinerary = {};
  for (let i = 1; i <= days; i++) {
    itinerary[`day${i}`] = [
      `${destination} sight-seeing day ${i}`,
      `${interests[0] || 'Local food'} experience ${i}`,
    ];
  }

  const budget = {
    flights: 300,
    hotel: 100 * days,
    food: 50 * days,
    total: 300 + 100 * days + 50 * days,
  };

  const hotels = [
    `${destination} Budget Inn`,
    `${destination} City Hotel`,
    `${destination} Luxury Resort`,
  ];

  return { itinerary, budget, hotels };
};

const regenerateDay = async ({ day, destination }) => {
  // Return a small mock replacement for a day
  return [`${destination} refreshed activity 1 for ${day}`, `${destination} refreshed activity 2 for ${day}`];
};

module.exports = {
  generateTrip,
  regenerateDay,
};
