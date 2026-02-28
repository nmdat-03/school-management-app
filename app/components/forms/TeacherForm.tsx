"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SelectField } from "../FormField";
import { ImageUp } from "lucide-react";
import { createTeacherSchema, TeacherSchema, updateTeacherSchema } from "@/lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createTeacher, updateTeacher } from "@/lib/actions/teacher.action";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";



export type TeacherRelatedData = {
  subjects: {
    id: string;
    name: string;
  }[];
}

interface TeacherFormProps {
  type: "create" | "update";
  data?: TeacherSchema;
  relatedData?: TeacherRelatedData;
}

type CreateTeacherFormInput = z.input<typeof createTeacherSchema>;
type UpdateTeacherFormInput = z.input<typeof updateTeacherSchema>;
type TeacherFormInput = | CreateTeacherFormInput | UpdateTeacherFormInput;

const TeacherForm = ({ type, data, relatedData }: TeacherFormProps) => {

  const formSchema = type === "create" ? createTeacherSchema : updateTeacherSchema

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const [img, setImg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<TeacherFormInput>({
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
      gender: data?.gender ?? "MALE",
      birthday: data?.birthday
        ? data.birthday.toISOString().split("T")[0]
        : "",
      subjects: data?.subjects?.map(String) ?? [],

    },
  });

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        birthday: data.birthday
          ? data.birthday.toISOString().split("T")[0]
          : "",
        subjects: data.subjects?.map(String) ?? [],
      });

      setImg(data.img ?? null);
    }
  }, [data, reset]);


  const onSubmit = handleSubmit(async (formData) => {
    setIsPending(true);

    try {
      let res;

      if (type === "create") {
        const parsed = createTeacherSchema.parse({
          ...formData,
          img: img ?? data?.img,
        });

        res = await createTeacher(parsed);

        if (res.success) {
          reset();
          setImg(null);
        }
      } else {
        const parsed = updateTeacherSchema.parse({
          ...formData,
          img: img ?? data?.img,
        });

        res = await updateTeacher(parsed, {
          updateSubjects: !!dirtyFields.subjects,
        });
      }

      if (res?.success) {
        toast.success(
          `Teacher has been ${type === "create" ? "created" : "updated"}!`
        );
        router.refresh();
      } else {
        toast.error("Operation failed!");
      }
    } catch (err) {
      toast.error("Something went wrong!");
      console.log(err);
    } finally {
      setIsPending(false);
    }
  });


  const subjects = relatedData?.subjects ?? [];

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update teacher"}
      </h1>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-500 font-medium">
          Authentication Information
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Username */}
          <InputField<TeacherFormInput> label="Username" name="username" register={register} error={errors?.username} />
          {/* Email */}
          <InputField<TeacherFormInput> label="Email" name="email" register={register} error={errors?.email} />
          {/* Password */}
          <InputField<TeacherFormInput> label="Password" name="password" type="password" register={register} error={errors?.password} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-500 font-medium">
          Personal Information
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First Name */}
          <InputField<TeacherFormInput> label="First Name" name="name" register={register} error={errors?.name} />
          {/* Last Name */}
          <InputField<TeacherFormInput> label="Last Name" name="surname" register={register} error={errors?.surname} />
          {/* Gender */}
          <SelectField<TeacherFormInput>
            label="Gender"
            name="gender"
            register={register}
            error={errors?.gender}
            options={[
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
            ]}
          />
          {/* Phone */}
          <InputField<TeacherFormInput> label="Phone" name="phone" register={register} error={errors?.phone} />
          {/* Address */}
          <InputField<TeacherFormInput> label="Address" name="address" register={register} error={errors?.address} />
          {/* Birthday */}
          <InputField<TeacherFormInput> label="Birthday" name="birthday" type="date" register={register} error={errors?.birthday} />
          {/* Subjects */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Subjects</label>
            <select
              multiple
              className="ring-[1.5px] p-2 rounded-md text-sm w-full"
              {...register("subjects")}
            >
              {subjects.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subjects?.message && (
              <p className="text-xs text-red-400">
                {errors.subjects.message.toString()}
              </p>
            )}
          </div>
          {/* Image */}
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              const info = result.info;

              if (typeof info !== "string" && info?.secure_url) {
                setImg(info.secure_url);
              }

              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <div className="flex flex-col items-center justify-center">
                  <button type="button" className="text-gray-500 flex gap-2 p-2 border-2 rounded-md" onClick={() => open()}>
                    <ImageUp />
                    <span>Upload a photo</span>
                  </button>
                </div>
              );
            }}
          </CldUploadWidget>

          <div className="flex flex-col justify-center">
            {img && (
              <Image
                src={img}
                alt="Preview"
                width={96}
                height={96}
                className="object-cover rounded-md"
              />
            )}
          </div>
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

export default TeacherForm;