export function getTodayMovie(movies, currentDate = new Date()) {
  const baseDate = new Date(2024, 0, 1);
  const todayStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const diffDays = Math.floor((todayStart - baseDate) / (1000 * 60 * 60 * 24));
  const safeIndex = ((diffDays % movies.length) + movies.length) % movies.length;

  return movies[safeIndex];
}
  
