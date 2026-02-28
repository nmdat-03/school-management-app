/* ----------------------------------------------------- */
/*                GET LATEST MONDAY                      */
/* ----------------------------------------------------- */

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const latestMonday = new Date(today);
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  latestMonday.setHours(0, 0, 0, 0);

  return latestMonday;
};

/* ----------------------------------------------------- */
/*         ADJUST WEEKLY SCHEDULE TO CURRENT WEEK       */
/* ----------------------------------------------------- */

type WeeklyScheduleInput = {
  title: string;
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
  startTime: string; // "07:00"
  endTime: string;   // "09:00"
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

/**
 * Convert weekly schedule (MONDAY, 07:00) 
 * → actual Date in current week
 */
export const adjustScheduleToCurrentWeek = (
  schedules: WeeklyScheduleInput[]
): CalendarEvent[] => {
  const latestMonday = getLatestMonday();

  const dayMap: Record<WeeklyScheduleInput["day"], number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
  };

  return schedules.map((schedule) => {
    const dayOffset = dayMap[schedule.day];

    const baseDate = new Date(latestMonday);
    baseDate.setDate(latestMonday.getDate() + dayOffset);

    const [startHour, startMinute] = schedule.startTime
      .split(":")
      .map(Number);

    const [endHour, endMinute] = schedule.endTime
      .split(":")
      .map(Number);

    const start = new Date(baseDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(baseDate);
    end.setHours(endHour, endMinute, 0, 0);

    return {
      title: schedule.title,
      start,
      end,
    };
  });
};

/* ----------------------------------------------------- */
/*          FORMAT DATE FOR INPUT TYPE="datetime-local" */
/* ----------------------------------------------------- */

export const toDateTimeLocal = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
};