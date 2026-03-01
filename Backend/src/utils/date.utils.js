const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getNextDay = (date = new Date()) => {
  const d = getStartOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
};

const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDateRange = (date = new Date()) => {
  const start = getStartOfDay(date);
  const end = getNextDay(date);
  return { start, end };
};

const getDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
  getNextDay,
  getWeekStart,
  getDateRange,
  getDaysAgo
};
