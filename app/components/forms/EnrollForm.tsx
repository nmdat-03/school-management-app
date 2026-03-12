"use client";

import { useState } from "react";
import { createEnrollment, updateEnrollment } from "@/lib/actions/enroll.action";
import { toast } from "react-toastify";
import { EnrollFormInput, enrollmentSchema, EnrollSchema } from "@/lib/formValidationSchemas";
import { useRouter } from "next/navigation";
import { InputField, SelectField } from "../FormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";



export type EnrollRelatedData = {
    classes: {
        id: number;
        name: string;
    }[];
    academicYears: {
        id: number;
        name: string;
    }[];
}

interface EnrollFormProps {
    type: "create" | "update";
    data?: EnrollSchema;
    relatedData?: EnrollRelatedData;
}

const EnrollForm = ({ type, data, relatedData }: EnrollFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const classes = relatedData?.classes ?? [];
    const academicYears = relatedData?.academicYears ?? [];

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EnrollFormInput>({
        resolver: zodResolver(enrollmentSchema),
        defaultValues: {
            studentId: data?.studentId,
            classId: data?.classId,
            academicYearId: data?.academicYearId,
        },
    });

    const onSubmit = handleSubmit(async (formData) => {
        setIsPending(true);

        try {
            const parsed = enrollmentSchema.parse(formData);

            let res;

            if (type === "create") {
                res = await createEnrollment(
                    parsed.studentId,
                    parsed.classId,
                    parsed.academicYearId
                );
            } else {
                res = await updateEnrollment(
                    parsed.studentId,
                    parsed.classId,
                    parsed.academicYearId
                );
            }

            if (!res.success) {
                toast.error("Enrollment failed");
                return;
            }

            toast.success(
                type === "create"
                    ? "Student enrolled successfully!"
                    : "Enrollment updated!"
            );

            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsPending(false);
        }
    });

    return (
        <form className="flex flex-col gap-6 p-2" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Enroll Student" : "Update Enrollment"}
            </h1>

            <div className="flex flex-col gap-3">
                <span className="text-sm text-gray-500 font-medium">
                    Enrollment Information
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField<EnrollFormInput>
                        label="Student ID"
                        name="studentId"
                        register={register}
                        error={errors.studentId}
                        hidden
                    />

                    <SelectField<EnrollFormInput>
                        label="Class"
                        name="classId"
                        register={register}
                        error={errors.classId}
                        options={classes.map((c) => ({
                            label: c.name,
                            value: c.id.toString(),
                        }))}
                    />

                    <SelectField<EnrollFormInput>
                        label="Academic Year"
                        name="academicYearId"
                        register={register}
                        error={errors.academicYearId}
                        options={academicYears.map((y) => ({
                            label: y.name,
                            value: y.id.toString(),
                        }))}
                    />
                </div>
            </div>

            <button
                disabled={isPending}
                className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
            >
                {isPending
                    ? "Saving..."
                    : type === "create"
                        ? "Enroll"
                        : "Update"}
            </button>
        </form>
    );
};

export default EnrollForm;