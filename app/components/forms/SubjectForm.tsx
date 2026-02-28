"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField } from "../FormField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions/subject.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export type SubjectRelatedData = {
    teachers: {
        id: string;
        name: string;
        surname: string;
    }[];
};

interface SubjectFormProps {
    type: "create" | "update";
    data?: SubjectSchema;
    relatedData?: SubjectRelatedData
}

const SubjectForm = ({ type, data, relatedData }: SubjectFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            ...data,
            teachers: data?.teachers ?? [],
        },
    });

    const onSubmit = handleSubmit((data) => {
        setIsPending(true);

        startTransition(async () => {
            try {
                if (type === "create") {
                    await createSubject(data);
                    reset();
                } else {
                    await updateSubject(data);
                }

                toast.success(
                    `Subject has been ${type === "create" ? "created" : "updated"}!`
                );
                router.refresh();
            } catch {
                toast.error("Something went wrong!");
            } finally {
                setIsPending(false);
            }
        });
    });

    const teachers = relatedData?.teachers ?? [];

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new subject" : "Update the subject"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField<SubjectSchema>
                    label="Subject name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />
                {data && (
                    <InputField<SubjectSchema>
                        label="Id"
                        name="id"
                        defaultValue={data?.id}
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Teachers</label>

                    <select
                        multiple
                        className="ring-[1.5px] p-2 rounded-md text-sm w-full"
                        {...register("teachers")}
                    >
                        {teachers.map((t) => (
                            <option key={t.id} value={String(t.id)}>
                                {t.name + " " + t.surname}
                            </option>
                        ))}
                    </select>

                    {errors.teachers?.message && (
                        <p className="text-xs text-red-400">
                            {errors.teachers.message.toString()}
                        </p>
                    )}
                </div>
            </div>


            <button
                disabled={isPending}
                className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
            >
                {isPending ? "Saving..." : type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default SubjectForm;
