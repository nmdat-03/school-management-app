"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import { ExamFormInput, examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions/exam.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { toDateTimeLocal } from "@/lib/utils";

export type ExamRelatedData = {
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
    teachers: {
        id: string;
        name: string;
        surname: string;
        schedules: {
            subjectId: number;
            class: { id: number; name: string };
        }[];
    }[];
    semesters: { id: number; name: string }[];
};

interface ExamFormProps {
    type: "create" | "update";
    data?: ExamSchema;
    relatedData?: ExamRelatedData
}

const ExamForm = ({ type, data, relatedData }: ExamFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ExamFormInput>({
        resolver: zodResolver(examSchema),
        defaultValues: data
            ? {
                ...data,
                startTime: toDateTimeLocal(data.startTime),
                endTime: toDateTimeLocal(data.endTime),
                classId: data.classId.toString(),
                subjectId: data.subjectId.toString(),
                teacherId: data.teacherId,
                id: data.id,
            }
            : undefined,
    });

    const subjects = relatedData?.subjects ?? [];
    const semesters = relatedData?.semesters ?? [];

    /* ================= SELECT SUBJECT => TEACHER ================= */

    const selectedSubjectId = watch("subjectId");

    const initialSubjectId = data?.subjectId?.toString();

    useEffect(() => {
        if (selectedSubjectId && selectedSubjectId !== initialSubjectId) {
            setValue("teacherId", "");
        }
    }, [selectedSubjectId, initialSubjectId, setValue]);

    const filteredTeachers = useMemo(() => {
        if (!selectedSubjectId) return [];

        const teacherList = relatedData?.teachers ?? [];

        return teacherList.filter((teacher) =>
            teacher.schedules.some(
                (s) => s.subjectId === Number(selectedSubjectId)
            )
        );
    }, [selectedSubjectId, relatedData?.teachers]);

    /* ================= SELECT SUBJECT => TEACHER ================= */

    const selectedTeacherId = watch("teacherId");

    const initialTeacherId = data?.teacherId;

    useEffect(() => {
        if (selectedTeacherId && selectedTeacherId !== initialTeacherId) {
            setValue("classId", "");
        }
    }, [selectedTeacherId, initialTeacherId, setValue]);

    const filteredClasses = useMemo(() => {
        if (!selectedTeacherId || !selectedSubjectId) return [];

        const teacher = relatedData?.teachers?.find(
            (t) => t.id === selectedTeacherId
        );

        if (!teacher) return [];

        const classMap = new Map<number, { id: number; name: string }>();

        teacher.schedules.forEach((s) => {
            if (s.subjectId.toString() === selectedSubjectId) {
                classMap.set(s.class.id, s.class);
            }
        });

        return Array.from(classMap.values());
    }, [selectedTeacherId, selectedSubjectId, relatedData?.teachers]);

    /* ================= HANDLE SUBMIT ================= */

    const onSubmit = handleSubmit((data) => {
        setIsPending(true);

        startTransition(async () => {
            try {
                const parsed = examSchema.parse(data);

                if (type === "create") {
                    await createExam(parsed);
                    reset();
                } else {
                    await updateExam(parsed);
                }

                toast.success(
                    `Exam has been ${type === "create" ? "created" : "updated"}!`
                );

                router.refresh();
            } catch {
                toast.error("Something went wrong!");
            } finally {
                setIsPending(false);
            }
        });
    });

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new exam" : "Update the exam"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField<ExamFormInput>
                    label="Exam Title"
                    name="title"
                    register={register}
                    error={errors?.title}
                />

                <SelectField<ExamFormInput>
                    label="Subject"
                    name="subjectId"
                    register={register}
                    error={errors.subjectId}
                    options={[
                        { label: "Select subject", value: "" },
                        ...subjects.map((s) => ({
                            label: s.name,
                            value: s.id.toString(),
                        }))]}
                />

                <SelectField<ExamFormInput>
                    disabled={!selectedSubjectId}
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

                <SelectField<ExamFormInput>
                    disabled={!selectedTeacherId || filteredClasses.length === 0}
                    label="Class"
                    name="classId"
                    register={register}
                    error={errors.classId}
                    options={[
                        { label: "Select class", value: "" },
                        ...filteredClasses.map((c) => ({
                            label: c.name,
                            value: c.id.toString(),
                        }))]}

                />

                <InputField<ExamFormInput>
                    label="Start Date"
                    name="startTime"
                    type="datetime-local"
                    register={register}
                    error={errors?.startTime}
                />

                <InputField<ExamFormInput>
                    label="End Date"
                    name="endTime"
                    type="datetime-local"
                    register={register}
                    error={errors?.endTime}
                />

                {data && (
                    <InputField<ExamFormInput>
                        label="Id"
                        name="id"
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                <SelectField<ExamFormInput>
                    label="Semester"
                    name="semesterId"
                    register={register}
                    error={errors.semesterId}
                    options={[
                        { label: "Select semester", value: "" },
                        ...semesters.map((s) => ({
                            label: s.name,
                            value: s.id.toString(),
                        }))]}
                />

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

export default ExamForm;
