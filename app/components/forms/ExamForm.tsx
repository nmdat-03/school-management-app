"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import { ExamFormInput, examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions/exam.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toDateTimeLocal } from "@/lib/utils";

export type ExamRelatedData = {
    schedules: {
        id: number;
        name: string;
    }[];
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
        formState: { errors },
    } = useForm<ExamFormInput>({
        resolver: zodResolver(examSchema),
        defaultValues: data
            ? {
                ...data,
                startTime: toDateTimeLocal(data.startTime),
                endTime: toDateTimeLocal(data.endTime),
                lessonId: data.lessonId.toString(),
                id: data.id?.toString(),
            }
            : undefined,
    });

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

    const schedules = relatedData?.schedules ?? [];

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
                    label="Lessons"
                    name="lessonId"
                    register={register}
                    error={errors?.lessonId}
                    options={schedules.map((l) => ({
                        label: l.name,
                        value: l.id.toString(),
                    }))}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
