"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import { ScheduleFormInput, scheduleSchema, ScheduleSchema } from "@/lib/formValidationSchemas";
import { createSchedule, updateSchedule } from "@/lib/actions/schedule.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type ScheduleRelatedData = {
    classes: {
        id: number;
        name: string;
        grade: { level: number }
    }[];
    grades: {
        id: number;
        level: number;
    }[];
    subjects: {
        id: number;
        name: string;
    }[];
    teachers: {
        id: string;
        name: string;
        surname: string;
        subjects: {
            id: number;
        }[];
    }[];

};

interface ScheduleFormProps {
    type: "create" | "update";
    data?: ScheduleSchema;
    relatedData?: ScheduleRelatedData
}

const ScheduleForm = ({ type, data, relatedData }: ScheduleFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ScheduleFormInput>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: data
            ? {
                ...data,
                gradeLevel: relatedData?.classes
                    ?.find((c) => c.id === data.classId)
                    ?.grade.level.toString(),

                classId: data.classId.toString(),
                subjectId: data.subjectId.toString(),
                teacherId: data.teacherId,

                startTime: data.startTime,
                endTime: data.endTime,

                id: data.id?.toString(),
            }
            : undefined,
    });

    const classes = relatedData?.classes ?? [];
    const grades = relatedData?.grades ?? [];
    const subjects = relatedData?.subjects ?? [];

    /*========== SELECT GRADE => CLASS ==========*/

    const selectedGrade = watch("gradeLevel");

    useEffect(() => {
        if (!selectedGrade || type === "update") return;

        reset((prev) => ({
            ...prev,
            classId: "",
        }));
    }, [selectedGrade]);

    const filteredClasses = useMemo(() => {
        if (!selectedGrade) return [];

        return classes.filter(
            (c) => c.grade.level.toString() === selectedGrade
        );
    }, [selectedGrade, classes]);

    /*========== SELECT SUBJECT => TEACHER ==========*/

    const selectedSubjectId = watch("subjectId");

    useEffect(() => {
        if (!selectedSubjectId || type === "update") return;

        reset((prev) => ({
            ...prev,
            teacherId: "",
        }));
    }, [selectedSubjectId]);

    const filteredTeachers = useMemo(() => {
        if (!selectedSubjectId) return [];

        const teacherList = relatedData?.teachers ?? [];

        return teacherList.filter((teacher) =>
            (teacher.subjects ?? []).some(
                (subject) => subject.id.toString() === selectedSubjectId
            )
        );
    }, [selectedSubjectId, relatedData?.teachers]);

    /*========== HANDLE SUBMIT ==========*/

    const onSubmit = handleSubmit(async (data) => {
        setIsPending(true);

        try {
            const parsed = scheduleSchema.parse(data);

            const res =
                type === "create"
                    ? await createSchedule(parsed)
                    : await updateSchedule(parsed);

            if (!res.success) {
                toast.error(res.error);
                return;
            }

            toast.success(
                `Schedule has been ${type === "create" ? "created" : "updated"}!`
            );

            if (type === "create") reset();

            router.refresh();
        } catch (error) {
            toast.error("Something went wrong!");
            console.log(error)
        } finally {
            setIsPending(false);
        }
    });


    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new schedule" : "Update the schedule"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField<ScheduleFormInput>
                    label="Grade"
                    name="gradeLevel"
                    register={register}
                    error={errors?.gradeLevel}
                    options={[
                        { label: "Select grade", value: "" },
                        ...grades.map((g) => ({
                            label: `Grade ${g.level}`,
                            value: g.level.toString(),
                        })),
                    ]}
                />
                <SelectField<ScheduleFormInput>
                    disabled={!selectedGrade}
                    label="Class"
                    name="classId"
                    register={register}
                    error={errors?.classId}
                    options={[
                        { label: "Select class", value: "" },
                        ...filteredClasses.map((c) => ({
                            label: `${c.name}`,
                            value: c.id.toString(),
                        }))
                    ]}
                />
                <SelectField<ScheduleFormInput>
                    label="Subject"
                    name="subjectId"
                    register={register}
                    error={errors?.subjectId}
                    options={[
                        { label: "Select subject", value: "" },
                        ...subjects.map((s) => ({
                            label: `${s.name}`,
                            value: s.id.toString(),
                        }))
                    ]}
                />
                <SelectField<ScheduleFormInput>
                    disabled={!selectedSubjectId || !watch("classId")}
                    label="Teacher"
                    name="teacherId"
                    register={register}
                    error={errors?.teacherId}
                    options={[
                        { label: "Select teacher", value: "" },
                        ...filteredTeachers.map((t) => ({
                            label: `${t.name} ${t.surname}`,
                            value: t.id,
                        })),
                    ]}
                />
                <SelectField<ScheduleFormInput>
                    label="Day"
                    name="day"
                    register={register}
                    error={errors?.day}
                    options={[
                        { label: "Select day", value: "" },
                        { label: "Monday", value: "MONDAY" },
                        { label: "Tuesday", value: "TUESDAY" },
                        { label: "Wednesday", value: "WEDNESDAY" },
                        { label: "Thursday", value: "THURSDAY" },
                        { label: "Friday", value: "FRIDAY" },
                    ]}
                />
                <InputField<ScheduleFormInput>
                    label="Start Time"
                    name="startTime"
                    type="time"
                    register={register}
                    error={errors?.startTime}
                />
                <InputField<ScheduleFormInput>
                    label="End Time"
                    name="endTime"
                    type="time"
                    register={register}
                    error={errors?.endTime}
                />
                {data && (
                    <InputField<ScheduleFormInput>
                        label="Id"
                        name="id"
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}
            </div>


            <button
                disabled={isPending}
                className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
            >
                {isPending ? "Saving..." : type === "create" ? "Create" : "Update"}
            </button>
        </form >
    );
};

export default ScheduleForm;
