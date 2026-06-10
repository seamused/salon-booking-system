module.exports = {
  // Buffer time in minutes between appointments
  bufferTime: 15,

  // Slot interval for booking grid (minutes)
  slotInterval: 15,

  // How far in advance clients can book (days)
  bookingWindowDays: 60,

  // Minimum notice required to book (hours)
  minNoticeHours: 2,

  // Days of week: 0=Sunday, 1=Monday, ... 6=Saturday
  hours: {
    0: { isOpen: false }, // Sunday
    1: { isOpen: true, open: "09:00", close: "18:00" }, // Monday
    2: { isOpen: true, open: "09:00", close: "18:00" }, // Tuesday
    3: { isOpen: true, open: "09:00", close: "20:00" }, // Wednesday
    4: { isOpen: true, open: "09:00", close: "20:00" }, // Thursday
    5: { isOpen: true, open: "09:00", close: "18:00" }, // Friday
    6: { isOpen: true, open: "10:00", close: "16:00" }, // Saturday
  },
};
