// Utility functions for raffle status management
export const getRaffleStatus = (raffle) => {
  const now = new Date().getTime();
  const startTime = new Date(raffle.startDate).getTime();
  const endTime = new Date(raffle.endDate).getTime();

  if (now < startTime) {
    return 'pending';
  } else if (now >= endTime) {
    return 'ended';
  } else {
    return 'active';
  }
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const updateRaffleStatuses = async () => {
  try {
    const response = await fetch(`${API_URL}/api/raffles`);
    if (!response.ok) {
      throw new Error('Failed to fetch raffles');
    }
    const raffles = await response.json();
    return raffles.map(raffle => ({
      ...raffle,
      status: getRaffleStatus(raffle)
    }));
  } catch (error) {
    console.error('Error fetching raffles:', error);
    return [];
  }
};

export const filterRafflesByStatus = (raffles, status) => {
  return raffles.filter(raffle => getRaffleStatus(raffle) === status);
};
