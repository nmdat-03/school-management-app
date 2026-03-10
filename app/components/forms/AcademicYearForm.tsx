"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField } from "../FormField";
import {
    AcademicYearFormInput,
    academicYearSchema,
    AcademicYearSchema,
} from "@/lib/formValidationSchemas";
import {
    createAcademicYear,
    updateAcademicYear,
} from "@/lib/actions/academicYear.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

interface AcademicYearFormProps {
    type: "create" | "update";
    data?: AcademicYearSchema;
}

const AcademicYearForm = ({ type, data }: AcademicYearFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AcademicYearFormInput>({
        resolver: zodResolver(academicYearSchema),
        defaultValues: data
            ? {
                ...data,
                semester1Start: data.semester1Start ? data.semester1Start.toISOString().split("T")[0] : "",
                semester1End: data.semester1End ? data.semester1End.toISOString().split("T")[0] : "",
                semester2Start: data.semester2Start ? data.semester2Start.toISOString().split("T")[0] : "",
                semester2End: data.semester2End ? data.semester2End.toISOString().split("T")[0] : "",
            }
            : undefined,
    });

    const onSubmit = handleSubmit((data) => {
        setIsPending(true);

        startTransition(async () => {
            try {
                const parsed = academicYearSchema.parse(data);

                let result: { success: boolean };

                if (type === "create") {
                    result = await createAcademicYear(parsed);

                    if (result.success) {
                        reset();
                    }
                } else {
                    result = await updateAcademicYear(parsed);
                }

                if (result.success) {
                    toast.success(
                        `Academic Year has been ${type === "create" ? "created" : "updated"
                        }!`
                    );

                    router.refresh();
                } else {
                    toast.error("Operation failed!");
                }
            } catch (error) {
                toast.error("Something went wrong!");
                console.log(error);
            } finally {
                setIsPending(false);
            }
        });
    });

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create"
                    ? "Create a new academic year"
                    : "Update academic year"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField<AcademicYearFormInput>
                    label="Academic Year Name"
                    name="name"
                    register={register}
                    error={errors?.name}
                />
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="font-medium text-gray-600">
                    Semester 1
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField<AcademicYearFormInput>
                        label="Start Date"
                        name="semester1Start"
                        type="date"
                        register={register}
                        error={errors?.semester1Start}
                    />

                    <InputField<AcademicYearFormInput>
                        label="End Date"
                        name="semester1End"
                        type="date"
                        register={register}
                        error={errors?.semester1End}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h2 className="font-medium text-gray-600">
                    Semester 2
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField<AcademicYearFormInput>
                        label="Start Date"
                        name="semester2Start"
                        type="date"
                        register={register}
                        error={errors?.semester2Start}
                    />

                    <InputField<AcademicYearFormInput>
                        label="End Date"
                        name="semester2End"
                        type="date"
                        register={register}
                        error={errors?.semester2End}
                    />
                </div>
            </div>

            {data && (
                <InputField<AcademicYearFormInput>
                    label="Id"
                    name="id"
                    register={register}
                    error={errors?.id}
                    hidden
                />
            )}

            <button
                disabled={isPending}
                className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
            >
                {isPending
                    ? "Saving..."
                    : type === "create"
                        ? "Create"
                        : "Update"}
            </button>
        </form>
    );
};

export default AcademicYearForm;