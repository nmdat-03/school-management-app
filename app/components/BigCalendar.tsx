// "use client";

// import {
//   Calendar,
//   momentLocalizer,
//   View,
//   Views,
//   EventProps,
// } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { useMemo, useState } from "react";
// import { startOfWeek, addDays } from "date-fns";

// const localizer = momentLocalizer(moment);

// /* ===================================================== */
// /*                         TYPES                          */
// /* ===================================================== */

// type Schedule = {
//   subjectId: number;
//   subject: { name: string };
//   class: { name: string };
//   day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
//   startTime: string;
//   endTime: string;
// };

// type Exam = {
//   title: string;
//   startTime: Date;
//   endTime: Date;
// };

// type Assignment = {
//   title: string;
//   startDate: Date;
//   dueDate: Date;
// };

// type CalendarEvent = {
//   title: string;
//   start: Date;
//   end: Date;
//   subject: string;
//   className?: string;
//   type: "schedule" | "exam" | "assignment";
// };

// interface Props {
//   type: "teacherId" | "classId";
//   schedules: Schedule[];
//   exams: Exam[];
//   assignments: Assignment[];
// }

// /* ===================================================== */
// /*                 CUSTOM EVENT COMPONENT                */
// /* ===================================================== */

// const CustomEvent = ({
//   event,
// }: EventProps<CalendarEvent>) => {
//   return (
//     <div className="flex flex-col gap-1 h-full justify-center px-1 text-xs">

//       <span className="font-semibold">{event.subject}</span>

//       {event.className && (
//         <span className="text-gray-600">
//           Class: {event.className}
//         </span>
//       )}

//       {event.type !== "schedule" && (
//         <span className="text-[10px] italic opacity-80">
//           {event.type === "exam" ? "Exam" : "Assignment"}
//         </span>
//       )}
//     </div>
//   );
// };

// const eventStyleGetter = (event: CalendarEvent) => {
//   let backgroundColor = "#e2f8ff"; // default schedule (xanh dương nhạt)

//   if (event.type === "exam") {
//     backgroundColor = "#fef9c3"; // vàng nhạt
//   }

//   if (event.type === "assignment") {
//     backgroundColor = "#dcfce7"; // xanh lá nhạt
//   }

//   return {
//     style: {
//       backgroundColor,
//       border: "none",
//       borderRadius: "8px",
//       color: "#000",
//     },
//   };
// };

// /* ===================================================== */
// /*                    MAIN COMPONENT                     */
// /* ===================================================== */

// const BigCalendar = ({
//   type,
//   schedules,
//   exams,
//   assignments,
// }: Props) => {
//   const [view, setView] = useState<View>(Views.WORK_WEEK);
//   const [currentDate, setCurrentDate] = useState(new Date());

//   /* ----------------------------------------------------- */
//   /*                WEEKLY RECURRING EVENTS                */
//   /* ----------------------------------------------------- */

//   const weeklyEvents: CalendarEvent[] = useMemo(() => {
//     if (!schedules) return [];

//     const startWeek = startOfWeek(currentDate, {
//       weekStartsOn: 1,
//     });

//     const dayMap = {
//       MONDAY: 0,
//       TUESDAY: 1,
//       WEDNESDAY: 2,
//       THURSDAY: 3,
//       FRIDAY: 4,
//     };

//     return schedules.map((schedule) => {
//       const targetDate = addDays(
//         startWeek,
//         dayMap[schedule.day]
//       );

//       const [sh, sm] = schedule.startTime
//         .split(":")
//         .map(Number);
//       const [eh, em] = schedule.endTime
//         .split(":")
//         .map(Number);

//       const start = new Date(targetDate);
//       start.setHours(sh, sm);

//       const end = new Date(targetDate);
//       end.setHours(eh, em);

//       return {
//         title: schedule.subject.name,
//         subject: schedule.subject.name,
//         className:
//           type === "teacherId"
//             ? schedule.class.name
//             : undefined,
//         start,
//         end,
//         type: "schedule",
//       };
//     });
//   }, [schedules, currentDate, type]);

//   /* ----------------------------------------------------- */
//   /*                    EXAM EVENTS                        */
//   /* ----------------------------------------------------- */

//   const examEvents: CalendarEvent[] = exams.map((exam) => ({
//     title: exam.title,
//     subject: exam.title,
//     start: new Date(exam.startTime),
//     end: new Date(exam.endTime),
//     type: "exam",
//   }));

//   /* ----------------------------------------------------- */
//   /*                 ASSIGNMENT EVENTS                     */
//   /* ----------------------------------------------------- */

//   const assignmentEvents: CalendarEvent[] =
//     assignments.map((assignment) => ({
//       title: assignment.title,
//       subject: assignment.title,
//       start: new Date(assignment.startDate),
//       end: new Date(assignment.dueDate),
//       type: "assignment",
//     }));

//   const allEvents: CalendarEvent[] = [
//     ...weeklyEvents,
//     ...examEvents,
//     ...assignmentEvents,
//   ];

//   console.log({
//     weeklyEvents,
//     examEvents,
//     assignmentEvents,
//   });

//   /* ----------------------------------------------------- */

//   return (
//     <Calendar<CalendarEvent>
//       localizer={localizer}
//       events={allEvents}
//       startAccessor="start"
//       endAccessor="end"
//       views={[Views.WORK_WEEK, Views.DAY]}
//       view={view}
//       date={currentDate}
//       onNavigate={(date) => setCurrentDate(date)}
//       onView={(selectedView) => setView(selectedView)}
//       eventPropGetter={eventStyleGetter}
//       components={{ event: CustomEvent, }}
//       style={{ height: 1200 }}
//       step={60}
//       timeslots={1}
//       min={new Date(0, 0, 0, 7, 0, 0)}
//       max={new Date(0, 0, 0, 18, 0, 0)}
//     />
//   );
// };

// export default BigCalendar;

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

/* ===================================================== */
/* TYPES */
/* ===================================================== */

type Schedule = {
  subject: { name: string };
  class: { name: string };
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
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

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  className?: string;
  type: "schedule" | "exam" | "assignment";
};

interface Props {
  type: "teacherId" | "classId";
  schedules: Schedule[];
  exams: Exam[];
  assignments: Assignment[];
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
          {event.type === "exam" ? "Exam" : "Assignment"}
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
}: Props) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  /* ---------------- WEEKLY SCHEDULE ---------------- */

  const weeklyEvents: CalendarEvent[] = useMemo(() => {
    const dayMap = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
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

  const examEvents: CalendarEvent[] = exams.map((exam) => ({
    title: exam.title,
    start: new Date(exam.startTime),
    end: new Date(exam.endTime),
    type: "exam",
  }));

  /* ---------------- ASSIGNMENTS ---------------- */

  const assignmentEvents: CalendarEvent[] = assignments.map(
    (assignment) => ({
      title: assignment.title,
      start: new Date(assignment.startDate),
      end: new Date(assignment.dueDate),
      type: "assignment",
    })
  );

  const allEvents: CalendarEvent[] = [
    ...weeklyEvents,
    ...examEvents,
    ...assignmentEvents,
  ];

  console.log(examEvents)

  /* ===================================================== */

  return (
    <Calendar
      localizer={localizer}
      events={allEvents}
      startAccessor="start"
      endAccessor="end"
      views={[Views.WORK_WEEK, Views.DAY]}
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