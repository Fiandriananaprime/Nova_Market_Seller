export const formatMGA = (amount: number):string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M Ar`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K Ar`;
  }
  return `${amount.toLocaleString()} Ar`;
};

export const formatFullMGA = (amount: number):string => {
  return `${amount.toLocaleString("fr-MG")} Ar`;
};