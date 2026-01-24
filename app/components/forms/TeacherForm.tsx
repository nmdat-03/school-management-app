"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputField, SelectField } from "../FormField";
import { ImageUp } from "lucide-react";

/* ================= TYPES ================= */

export const teacherSchema = z.object({
  username: z.string().min(3, { message: "User must be at least 3 characters long!" }).max(20, { message: "User must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  birthday: z.date({ message: "Birthday is required!" }),
  gender: z.enum(["male", "female"], { message: "Gender is required!" }),
  img: z.union([
    z.instanceof(File, { message: "Image is required!" }),
    z.string().url("Image is required!"),
  ])
});

export type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  type: "create" | "update";
  data?: TeacherFormData;
}

/* ================= COMPONENT ================= */

const TeacherForm = ({ type, data }: TeacherFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data,
  });

  const onSubmit = handleSubmit((formData) => {
    console.log("TEACHER:", formData);
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update teacher"}
      </h1>

      <span className="text-xs text-gray-500 font-medium">
        Authentication Information
      </span>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField<TeacherFormData> label="Username" name="username" register={register} error={errors.username} />
        <InputField<TeacherFormData> label="Email" name="email" register={register} error={errors.email} />
        {type === "create" && (
          <InputField<TeacherFormData>
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
          />
        )}
      </div>

      <span className="text-xs text-gray-500 font-medium">
        Personal Information
      </span>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField<TeacherFormData> label="First Name" name="firstName" register={register} error={errors.firstName} />
        <InputField<TeacherFormData> label="Last Name" name="lastName" register={register} error={errors.lastName} />
        <SelectField<TeacherFormData>
          label="Gender"
          name="gender"
          register={register}
          error={errors.gender}
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
        />
        <InputField<TeacherFormData> label="Phone" name="phone" register={register} error={errors.phone} />
        <InputField<TeacherFormData> label="Address" name="address" register={register} error={errors.address} />
        <InputField<TeacherFormData>
          label="Birthday"
          name="birthday"
          type="date"
          register={register}
          error={errors.birthday}
        />
        <div className="flex flex-col gap-2 justify-center">
          <label htmlFor="img" className="flex gap-2 items-center cursor-pointer">
            <ImageUp />
            <span>Upload a photo</span>
          </label>
          <input id="img" type="file" className="hidden" {...register("img")} />
        </div>
      </div>

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
