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
    console.log('Fetching raffles from:', `${API_URL}/api/raffles`);
    const response = await fetch(`${API_URL}/api/raffles`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch raffles:', errorText);
      throw new Error(`Failed to fetch raffles: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Fetched raffles:', data);
    
    // Handle both paginated and non-paginated responses
    const raffles = data.raffles || data;
    
    const processedRaffles = raffles.map(raffle => ({
      ...raffle,
      status: getRaffleStatus(raffle)
    }));
    
    console.log('Processed raffles:', processedRaffles);
    return processedRaffles;
  } catch (error) {
    console.error('Error in updateRaffleStatuses:', error);
    return [];
  }
};

export const filterRafflesByStatus = (raffles, status) => {
  return raffles.filter(raffle => getRaffleStatus(raffle) === status);
};
