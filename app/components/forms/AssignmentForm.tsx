"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import { AssignmentFormInput, assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions/assignment.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { toDateTimeLocal } from "@/lib/utils";

export type AssignmentRelatedData = {
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
    teachers: { id: string; name: string, surname: string, subjects: { id: number }[] }[];
    semesters: { id: number; name: string }[];
};

interface AssignmentFormProps {
    type: "create" | "update";
    data?: AssignmentSchema;
    relatedData?: AssignmentRelatedData
}

const AssignmentForm = ({ type, data, relatedData }: AssignmentFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<AssignmentFormInput>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: data
            ? {
                ...data,
                startDate: toDateTimeLocal(data.startDate),
                dueDate: toDateTimeLocal(data.dueDate),
                classId: data.classId.toString(),
                subjectId: data.subjectId.toString(),
                teacherId: data.teacherId,
                id: data.id,
            }
            : undefined,
    });

    const selectedSubjectId = watch("subjectId");

    const subjects = relatedData?.subjects ?? [];
    const classes = relatedData?.classes ?? [];
    const semesters = relatedData?.semesters ?? [];

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
            teacher.subjects.some(
                (subject) => subject.id.toString() === selectedSubjectId
            )
        );
    }, [selectedSubjectId, relatedData?.teachers]);

    const onSubmit = handleSubmit((data) => {
        setIsPending(true);

        startTransition(async () => {
            try {
                const parsed = assignmentSchema.parse(data);

                if (type === "create") {
                    await createAssignment(parsed);
                    reset();
                } else {
                    await updateAssignment(parsed);
                }

                toast.success(
                    `Assignment has been ${type === "create" ? "created" : "updated"}!`
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
                {type === "create" ? "Create a new assignment" : "Update the assignment"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField<AssignmentFormInput>
                    label="Assignment Title"
                    name="title"
                    register={register}
                    error={errors?.title}
                />

                <SelectField<AssignmentFormInput>
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

                <SelectField<AssignmentFormInput>
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

                <SelectField<AssignmentFormInput>
                    label="Class"
                    name="classId"
                    register={register}
                    error={errors.classId}
                    options={[
                        { label: "Select class", value: "" },
                        ...classes.map((c) => ({
                            label: c.name,
                            value: c.id.toString(),
                        }))]}

                />

                <InputField<AssignmentFormInput>
                    label="Start Date"
                    name="startDate"
                    type="datetime-local"
                    register={register}
                    error={errors?.startDate}
                />

                <InputField<AssignmentFormInput>
                    label="Due Date"
                    name="dueDate"
                    type="datetime-local"
                    register={register}
                    error={errors?.dueDate}
                />

                {data && (
                    <InputField<AssignmentFormInput>
                        label="Id"
                        name="id"
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}

                <SelectField<AssignmentFormInput>
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

export default AssignmentForm;
