export const timeAgo = (value, isHindi) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return isHindi ? "अभी" : "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return isHindi ? `${minutes} मिनट पहले` : `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isHindi ? `${hours} घंटे पहले` : `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return isHindi ? `${days} दिन पहले` : `${days} d ago`;
};