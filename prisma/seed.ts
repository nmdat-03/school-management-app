import { PrismaClient, UserGender, Day } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  /* ------------------------------------------------ */
  /*                     ADMIN                        */
  /* ------------------------------------------------ */

  await prisma.admin.createMany({
    data: [
      { id: "admin1", username: "admin1" },
      { id: "admin2", username: "admin2" },
    ],
  });

  /* ------------------------------------------------ */
  /*                ACADEMIC YEAR                     */
  /* ------------------------------------------------ */

  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2025-2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-05-30"),
    },
  });

  /* ------------------------------------------------ */
  /*                   SEMESTER                       */
  /* ------------------------------------------------ */

  const semester1 = await prisma.semester.create({
    data: {
      name: "Semester 1",
      academicYearId: academicYear.id,
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-12-31"),
    },
  });

  const semester2 = await prisma.semester.create({
    data: {
      name: "Semester 2",
      academicYearId: academicYear.id,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-05-30"),
    },
  });

  /* ------------------------------------------------ */
  /*                     GRADE                        */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 5; i++) {
    await prisma.grade.create({
      data: { level: i },
    });
  }

  /* ------------------------------------------------ */
  /*                     CLASS                        */
  /* ------------------------------------------------ */

  const classes = [];

  for (let i = 1; i <= 5; i++) {
    const classA = await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: i,
        capacity: 25,
      },
    });

    const classB = await prisma.class.create({
      data: {
        name: `${i}B`,
        gradeId: i,
        capacity: 25,
      },
    });

    classes.push(classA, classB);
  }

  /* ------------------------------------------------ */
  /*                    SUBJECT                       */
  /* ------------------------------------------------ */

  const subjectNames = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Art",
  ];

  for (const name of subjectNames) {
    await prisma.subject.create({ data: { name } });
  }

  /* ------------------------------------------------ */
  /*                    TEACHER                       */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 15; i++) {
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@school.com`,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `Address ${i}`,
        gender: i % 2 === 0 ? UserGender.MALE : UserGender.FEMALE,
        birthday: new Date(1990, 1, 1),
        subjects: {
          connect: [{ id: (i % 10) + 1 }],
        },
      },
    });
  }

  /* ------------------------------------------------ */
  /*                    SCHEDULE                      */
  /* ------------------------------------------------ */

  const days = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
  ];

  const times = [
    { start: "08:00", end: "08:45" },
    { start: "09:00", end: "09:45" },
    { start: "10:00", end: "10:45" },
  ];

  const teachers = await prisma.teacher.findMany({
    include: { subjects: true },
  });

  for (const day of days) {
    for (const time of times) {
      const shuffledTeachers = [...teachers].sort(() => Math.random() - 0.5);

      for (let i = 0; i < classes.length; i++) {
        const cls = classes[i];

        const teacher = shuffledTeachers[i % shuffledTeachers.length];
        const subjectId = teacher.subjects[0].id;

        await prisma.schedule.create({
          data: {
            day,
            startTime: time.start,
            endTime: time.end,
            subjectId,
            classId: cls.id,
            teacherId: teacher.id,
          },
        });
      }
    }
  }

  /* ------------------------------------------------ */
  /*                     PARENT                       */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 30; i++) {
    await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        email: `parent${i}@email.com`,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `Address ${i}`,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                    STUDENT                       */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 60; i++) {
    const classId = classes[i % classes.length].id;

    const student = await prisma.student.create({
      data: {
        id: `student${i}`,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname${i}`,
        email: `student${i}@school.com`,
        phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `Address ${i}`,
        gender: i % 2 === 0 ? UserGender.MALE : UserGender.FEMALE,
        birthday: new Date(2015, 1, 1),
        parentId: `parent${(i % 30) + 1}`,
      },
    });

    /* Enrollment */

    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: classId,
        academicYearId: academicYear.id,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                     EXAM                         */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 10; i++) {
    const examDate = new Date(2026, 3, i);

    const startTime = new Date(examDate);
    startTime.setHours(14, 0, 0);

    const endTime = new Date(examDate);
    endTime.setHours(15, 0, 0);

    await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime,
        endTime,
        subjectId: (i % 10) + 1,
        classId: classes[i % classes.length].id,
        teacherId: `teacher${(i % 15) + 1}`,
        semesterId: i <= 5 ? semester1.id : semester2.id,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                  ASSIGNMENT                      */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 86400000),
        subjectId: (i % 10) + 1,
        classId: classes[i % classes.length].id,
        teacherId: `teacher${(i % 15) + 1}`,
        semesterId: i <= 5 ? semester1.id : semester2.id,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                 EXAM RESULT                      */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 20; i++) {
    await prisma.examResult.create({
      data: {
        score: Math.floor(Math.random() * 40) + 60,
        examId: (i % 10) + 1,
        studentId: `student${i}`,
      },
    });
  }

  /* ------------------------------------------------ */
  /*               ASSIGNMENT RESULT                  */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 20; i++) {
    await prisma.assignmentResult.create({
      data: {
        score: Math.floor(Math.random() * 40) + 60,
        assignmentId: (i % 10) + 1,
        studentId: `student${i}`,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                   ATTENDANCE                     */
  /* ------------------------------------------------ */

  for (let i = 1; i <= 20; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: Math.random() > 0.2,
        studentId: `student${i}`,
        classId: classes[i % classes.length].id,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                     EVENTS                       */
  /* ------------------------------------------------ */

  const eventTitles = [
    "School Opening Ceremony",
    "Sports Day",
    "Science Fair",
    "Art Exhibition",
    "Music Festival",
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.event.create({
      data: {
        title: eventTitles[i],
        description: `Description for ${eventTitles[i]}`,
        startTime: new Date(2025, 9, i + 1, 8, 0),
        endTime: new Date(2025, 9, i + 1, 12, 0),
        classId: classes[i % classes.length].id,
      },
    });
  }

  /* ------------------------------------------------ */
  /*                 ANNOUNCEMENTS                    */
  /* ------------------------------------------------ */

  const announcementTitles = [
    "Holiday Notice",
    "Parent Meeting",
    "Exam Schedule Released",
    "School Trip Announcement",
    "Uniform Policy Reminder",
  ];

  for (let i = 0; i < 5; i++) {
    await prisma.announcement.create({
      data: {
        title: announcementTitles[i],
        description: `Details about ${announcementTitles[i]}`,
        date: new Date(2025, 8, i + 10),
        classId: classes[i % classes.length].id,
      },
    });
  }

  console.log("🌱 Database seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
