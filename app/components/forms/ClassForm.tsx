"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SearchableSelectField, SelectField } from "../FormField";
import { ClassFormInput, classFormSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions/class.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export type ClassRelatedData = {
    teachers: {
        id: string;
        name: string;
        surname: string;
    }[];
    grades: {
        id: number;
        level: string;
    }[];
};

interface ClassFormProps {
    type: "create" | "update";
    data?: ClassSchema;
    relatedData?: ClassRelatedData
}

const ClassForm = ({ type, data, relatedData }: ClassFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<ClassFormInput>({
        resolver: zodResolver(classFormSchema),
        defaultValues: {
            id: data?.id?.toString(),
            name: data?.name ?? "",
            capacity: data?.capacity?.toString() ?? "",
            gradeId: data?.gradeId?.toString() ?? "",
            supervisorId: data?.supervisorId,
        },
    });


    const onSubmit = handleSubmit((formData) => {
        setIsPending(true);

        const parsed: ClassSchema = {
            id: formData.id ? Number(formData.id) : undefined,
            name: formData.name,
            capacity: Number(formData.capacity),
            gradeId: Number(formData.gradeId),
            supervisorId: formData.supervisorId,
        };

        startTransition(async () => {
            try {
                if (type === "create") {
                    await createClass(parsed);
                    reset();
                } else {
                    await updateClass(parsed);
                }

                toast.success(
                    `Class has been ${type === "create" ? "created" : "updated"}!`
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
    const grades = relatedData?.grades ?? [];

    const teacherOptions = teachers.map((t) => ({
        label: `${t.name} ${t.surname}`,
        value: t.id,
    }));

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new class" : "Update the class"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField<ClassFormInput>
                    label="Class name"
                    name="name"
                    register={register}
                    error={errors?.name}
                />
                <InputField<ClassFormInput>
                    label="Capacity"
                    name="capacity"
                    register={register}
                    error={errors?.capacity}
                />
                {data && (
                    <InputField<ClassFormInput>
                        label="Id"
                        name="id"
                        register={register}
                        error={errors?.id}
                        hidden
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelectField<ClassFormInput>
                    label="Supervisor"
                    name="supervisorId"
                    control={control}
                    options={teacherOptions}
                    error={errors.supervisorId}
                    placeholder="Select teacher"
                />
                <SelectField<ClassFormInput>
                    label="Grade"
                    name="gradeId"
                    register={register}
                    error={errors?.gradeId}
                    options={[
                        { label: "", value: "" },
                        ...grades.map((g) => ({
                            label: `Grade ${g.level}`,
                            value: g.id.toString(),
                        }))
                    ]}
                />
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

export default ClassForm;
