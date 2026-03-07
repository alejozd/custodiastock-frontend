export const getAvatarColor = (name) => {
  const colors = [
    '#0f4c81', // Primary
    '#00a896', // Secondary
    '#f9a826', // Accent
    '#d9534f', // Danger
    '#5bc0de', // Info
    '#5cb85c', // Success
    '#428bca', // Blue
    '#6a1b9a', // Purple
    '#c2185b', // Pink
    '#00796b', // Teal
  ];

  if (!name) return colors[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
