"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import {
  EventFormInput,
  eventSchema,
  EventSchema,
} from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions/event.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toDateTimeLocal } from "@/lib/utils";

export type EventRelatedData = {
  classes: { id: number; name: string }[];
};

interface EventFormProps {
  type: "create" | "update";
  data?: EventSchema;
  relatedData?: EventRelatedData;
}

const EventForm = ({ type, data, relatedData }: EventFormProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: data
      ? {
        ...data,
        startTime: toDateTimeLocal(data.startTime),
        endTime: toDateTimeLocal(data.endTime),
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
        const parsed: EventSchema = eventSchema.parse(formData);

        if (type === "create") {
          await createEvent(parsed);
          reset();
        } else {
          await updateEvent(parsed);
        }

        toast.success(
          `Event has been ${type === "create" ? "created" : "updated"}!`
        );

        router.refresh();
      } catch (error) {
        toast.error("Something went wrong!");
        console.log(error)
      } finally {
        setIsPending(false);
      }
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField<EventFormInput>
          label="Event Title"
          name="title"
          register={register}
          error={errors.title}
        />

        <InputField<EventFormInput>
          label="Description"
          name="description"
          register={register}
          error={errors.description}
        />

        <SelectField<EventFormInput>
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

        <InputField<EventFormInput>
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
        />

        <InputField<EventFormInput>
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
        />

        {data && (
          <InputField<EventFormInput>
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
        {isPending ? "Saving..." : type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventForm;