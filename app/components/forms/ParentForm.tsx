"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField } from "../FormField";
import {
  createParentSchema,
  ParentSchema,
  updateParentSchema,
} from "@/lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createParent, updateParent } from "@/lib/actions/parent.action";
import { z } from "zod";


interface ParentFormProps {
  type: "create" | "update";
  data?: ParentSchema;
  relatedData?: unknown;
}

type CreateParentFormInput = z.input<typeof createParentSchema>;
type UpdateParentFormInput = z.input<typeof updateParentSchema>;

type ParentFormInput =
  | CreateParentFormInput
  | UpdateParentFormInput;

const ParentForm = ({ type, data }: ParentFormProps) => {
  const formSchema =
    type === "create" ? createParentSchema : updateParentSchema;

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParentFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username ?? "",
      password: "",
      email: data?.email ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      phone: data?.phone ?? "",
      address: data?.address ?? "",
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        password: "",
      });
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    setIsPending(true);

    try {
      if (type === "create") {
        const parsed = createParentSchema.parse(formData);
        await createParent(parsed);
        reset();
      } else {
        const parsed = updateParentSchema.parse(formData);
        await updateParent(parsed);
      }

      toast.success(
        `Parent has been ${type === "create" ? "created" : "updated"
        }!`
      );

      router.refresh();
    } catch (err) {
      toast.error("Something went wrong!");
      console.log(err);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new parent"
          : "Update parent"}
      </h1>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-500 font-medium">
          Authentication Information
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField<ParentFormInput>
            label="Username"
            name="username"
            register={register}
            error={errors?.username}
          />

          <InputField<ParentFormInput>
            label="Email"
            name="email"
            register={register}
            error={errors?.email}
          />

          <InputField<ParentFormInput>
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors?.password}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-500 font-medium">
          Personal Information
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField<ParentFormInput>
            label="First Name"
            name="name"
            register={register}
            error={errors?.name}
          />

          <InputField<ParentFormInput>
            label="Last Name"
            name="surname"
            register={register}
            error={errors?.surname}
          />

          <InputField<ParentFormInput>
            label="Phone"
            name="phone"
            register={register}
            error={errors?.phone}
          />

          <InputField<ParentFormInput>
            label="Address"
            name="address"
            register={register}
            error={errors?.address}
            className="md:col-span-2"
          />

          <InputField<ParentFormInput>
            label="Id"
            name="id"
            register={register}
            error={errors?.id}
            hidden
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
            ? "Create"
            : "Update"}
      </button>
    </form>
  );
};

export default ParentForm;