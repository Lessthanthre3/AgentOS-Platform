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

export const updateRaffleStatuses = () => {
  const allRaffles = JSON.parse(localStorage.getItem('activeRaffles') || '[]');
  const updatedRaffles = allRaffles.map(raffle => ({
    ...raffle,
    status: getRaffleStatus(raffle)
  }));

  localStorage.setItem('activeRaffles', JSON.stringify(updatedRaffles));
  return updatedRaffles;
};

export const filterRafflesByStatus = (raffles, status) => {
  return raffles.filter(raffle => getRaffleStatus(raffle) === status);
};
