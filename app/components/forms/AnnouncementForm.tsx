"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import {
    AnnouncementFormInput,
    announcementSchema,
    AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import {
    createAnnouncement,
    updateAnnouncement,
} from "@/lib/actions/announcement.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

export type AnnouncementRelatedData = {
    classes: { id: number; name: string }[];
};

interface AnnouncementFormProps {
    type: "create" | "update";
    data?: AnnouncementSchema;
    relatedData?: AnnouncementRelatedData;
}

const AnnouncementForm = ({
    type,
    data,
    relatedData,
}: AnnouncementFormProps) => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnnouncementFormInput>({
        resolver: zodResolver(announcementSchema),
        defaultValues: data
            ? {
                ...data,
                classId: data.classId ? data.classId.toString() : "all",
                id: data.id,
            }
            : {
                classId: "all",
            },
    });

    const classes = relatedData?.classes ?? [];

    /* ================= HANDLE SUBMIT ================= */

    const onSubmit = handleSubmit((formData) => {
        setIsPending(true);

        startTransition(async () => {
            try {
                const parsed: AnnouncementSchema =
                    announcementSchema.parse(formData);

                if (type === "create") {
                    await createAnnouncement(parsed);
                    reset();
                } else {
                    await updateAnnouncement(parsed);
                }

                toast.success(
                    `Announcement has been ${type === "create" ? "created" : "updated"
                    }!`
                );

                router.refresh();
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
                    ? "Create a new announcement"
                    : "Update the announcement"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField<AnnouncementFormInput>
                    label="Title"
                    name="title"
                    register={register}
                    error={errors.title}
                />

                <InputField<AnnouncementFormInput>
                    label="Description"
                    name="description"
                    register={register}
                    error={errors.description}
                />

                <SelectField<AnnouncementFormInput>
                    label="Class"
                    name="classId"
                    register={register}
                    error={errors.classId}
                    options={[
                        { label: "All Classes", value: "all" },
                        ...classes.map((c) => ({
                            label: c.name,
                            value: c.id.toString(),
                        })),
                    ]}
                />

                <InputField<AnnouncementFormInput>
                    label="Date"
                    name="date"
                    type="date"
                    register={register}
                    error={errors.date}
                />

                {data && (
                    <InputField<AnnouncementFormInput>
                        label="Id"
                        name="id"
                        register={register}
                        error={errors.id}
                        hidden
                    />
                )}
            </div>

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

export default AnnouncementForm;