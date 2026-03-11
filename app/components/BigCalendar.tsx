"use client";

import {
  Calendar,
  momentLocalizer,
  Views,
  View,
  EventProps,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo, useState } from "react";

const localizer = momentLocalizer(moment);

moment.updateLocale("en", { week: { dow: 1, }, });

/* ===================================================== */
/* TYPES */
/* ===================================================== */

type Schedule = {
  subject: { name: string };
  class: { name: string };
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime: string;
  endTime: string;
};

type Exam = {
  title: string;
  startTime: Date;
  endTime: Date;
};

type Assignment = {
  title: string;
  startDate: Date;
  dueDate: Date;
};

type Event = {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  className?: string;
  type: "schedule" | "exam" | "assignment" | "event";
};

interface Props {
  type: "teacherId" | "classId";
  schedules: Schedule[];
  exams: Exam[];
  assignments: Assignment[];
  events: Event[];
}

/* ===================================================== */
/* CUSTOM EVENT */
/* ===================================================== */

const CustomEvent = ({ event }: EventProps<CalendarEvent>) => {
  return (
    <div className="flex flex-col text-xs">
      <span className="font-semibold">{event.title}</span>

      {event.className && (
        <span className="text-gray-600">Class: {event.className}</span>
      )}

      {event.type !== "schedule" && (
        <span className="italic text-[10px] opacity-70">
          {event.type === "exam"
            ? "Exam"
            : event.type === "assignment"
              ? "Assignment"
              : "Event"}
        </span>
      )}
    </div>
  );
};

/* ===================================================== */
/* EVENT COLOR */
/* ===================================================== */

const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = "#e2f8ff";

  if (event.type === "exam") backgroundColor = "#fef9c3";
  if (event.type === "assignment") backgroundColor = "#dcfce7";
  if (event.type === "event") backgroundColor = "#fde68a";

  return {
    style: {
      backgroundColor,
      borderRadius: "8px",
      border: "none",
      color: "#000",
    },
  };
};

/* ===================================================== */
/* MAIN COMPONENT */
/* ===================================================== */

const BigCalendar = ({
  type,
  schedules,
  exams,
  assignments,
  events,
}: Props) => {
  const [view, setView] = useState<View>(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  /* ---------------- WEEKLY SCHEDULE ---------------- */

  const weeklyEvents: CalendarEvent[] = useMemo(() => {
    const dayMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    return schedules.map((schedule) => {
      const [sh, sm] = schedule.startTime.split(":").map(Number);
      const [eh, em] = schedule.endTime.split(":").map(Number);

      const start = moment(currentDate)
        .startOf("week")
        .day(dayMap[schedule.day])
        .hour(sh)
        .minute(sm)
        .toDate();

      const end = moment(currentDate)
        .startOf("week")
        .day(dayMap[schedule.day])
        .hour(eh)
        .minute(em)
        .toDate();

      return {
        title: schedule.subject.name,
        start,
        end,
        className: type === "teacherId" ? schedule.class.name : undefined,
        type: "schedule",
      };
    });
  }, [schedules, currentDate, type]);

  /* ---------------- EXAMS ---------------- */

  const examEvents = useMemo(
    () =>
      exams.map((exam) => ({
        title: exam.title,
        start: new Date(exam.startTime),
        end: new Date(exam.endTime),
        type: "exam" as const,
      })),
    [exams]
  );

  /* ---------------- ASSIGNMENTS ---------------- */

  const assignmentEvents = useMemo(
    () =>
      assignments.map((assignment) => ({
        title: assignment.title,
        start: new Date(assignment.startDate),
        end: new Date(assignment.dueDate),
        type: "assignment" as const,
      })),
    [assignments]
  );

  /* ---------------- EVENTS ---------------- */

  const eventEvents = useMemo(
    () =>
      events.map((event) => ({
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        type: "event" as const,
      })),
    [events]
  );

  const allEvents: CalendarEvent[] = [
    ...weeklyEvents,
    ...examEvents,
    ...assignmentEvents,
    ...eventEvents,
  ];

  /* ===================================================== */

  return (
    <Calendar
      localizer={localizer}
      events={allEvents}
      startAccessor="start"
      endAccessor="end"
      views={[Views.WEEK, Views.DAY]}
      view={view}
      date={currentDate}
      onNavigate={(date) => setCurrentDate(date)}
      onView={(v) => setView(v)}
      components={{ event: CustomEvent }}
      eventPropGetter={eventStyleGetter}
      step={60}
      timeslots={1}
      min={new Date(0, 0, 0, 7)}
      max={new Date(0, 0, 0, 18)}
      style={{ height: 1200 }}
    />
  );
};

export default BigCalendar;