"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { InputField, SearchableSelectField, SelectField } from "../FormField";
import { ImageUp } from "lucide-react";
import { createStudentSchema, StudentSchema, updateStudentSchema } from "@/lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createStudent, updateStudent } from "@/lib/actions/student.action";
import { z } from "zod";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";



export type StudentRelatedData = {
  grades: {
    id: number;
    level: string;
  }[];
  classes: {
    id: number;
    name: string;
    capacity: number;
    _count: {
      students: number;
    }
  }[];
  parents: {
    id: string;
    name: string;
    surname: string;
    phone: string;
  }[];
}

interface StudentFormProps {
  type: "create" | "update";
  data?: StudentSchema;
  relatedData?: StudentRelatedData;
}

type CreateStudentFormInput = z.input<typeof createStudentSchema>;
type UpdateStudentFormInput = z.input<typeof updateStudentSchema>;

type StudentFormInput = | CreateStudentFormInput | UpdateStudentFormInput;

const StudentForm = ({ type, data, relatedData }: StudentFormProps) => {

  const formSchema = type === "create" ? createStudentSchema : updateStudentSchema

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const [img, setImg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudentFormInput>({
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
      parentId: data?.parentId,
      gradeId: data?.gradeId,
      classId: data?.classId,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        birthday: data.birthday
          ? data.birthday.toISOString().split("T")[0]
          : "",
      });

      setImg(data.img ?? null);
    }
  }, [data, reset]);



  const onSubmit = handleSubmit(async (formData) => {
    setIsPending(true);

    try {
      if (type === "create") {
        const parsed = createStudentSchema.parse({
          ...formData,
          img: img ?? data?.img,
        });

        await createStudent(parsed);
        reset();
        setImg(null);
      } else {
        const parsed = updateStudentSchema.parse({
          ...formData,
          img: img ?? data?.img,
        });

        await updateStudent(parsed);
      }

      toast.success(`Student has been ${type === "create" ? "created" : "updated"}!`);
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong!");
      console.log(err)
    } finally {
      setIsPending(false);
    }
  });

  const grades = relatedData?.grades ?? [];
  const classes = relatedData?.classes ?? [];
  const parents = relatedData?.parents ?? [];

  const parentOptions = parents.map((p) => ({
    label: `${p.name} ${p.surname} - ${p.phone}`,
    value: p.id,
  }));

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update student"}
      </h1>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-500 font-medium">
          Authentication Information
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField<StudentFormInput> label="Username" name="username" register={register} error={errors?.username} />
          <InputField<StudentFormInput> label="Email" name="email" register={register} error={errors?.email} />
          <InputField<StudentFormInput>
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
          <InputField<StudentFormInput> label="First Name" name="name" register={register} error={errors?.name} />
          <InputField<StudentFormInput> label="Last Name" name="surname" register={register} error={errors?.surname} />
          <SelectField<StudentFormInput>
            label="Gender"
            name="gender"
            register={register}
            error={errors?.gender}
            options={[
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
            ]}
          />
          <InputField<StudentFormInput> label="Phone" name="phone" register={register} error={errors?.phone} />
          <InputField<StudentFormInput> label="Address" name="address" register={register} error={errors?.address} />
          <InputField<StudentFormInput> label="Birthday" name="birthday" type="date" register={register} error={errors?.birthday} />
          <InputField<StudentFormInput> label="Id" name="id" register={register} error={errors?.id} hidden />
          <SelectField<StudentFormInput>
            label="Class"
            name="classId"
            register={register}
            error={errors?.classId}
            options={[
              { label: "Select class", value: "" },
              ...classes.map((c) => ({
                label: `(${c.name} - ${c._count.students}/${c.capacity} Capacity)`,
                value: c.id.toString(),
              }))
            ]}
          />
          <SelectField<StudentFormInput>
            label="Grade"
            name="gradeId"
            register={register}
            error={errors?.gradeId}
            options={[
              { label: "Select grade", value: "" },
              ...grades.map((g) => ({
                label: g.level,
                value: g.id.toString(),
              }))
            ]}
          />
          <SearchableSelectField<StudentFormInput>
            label="Parent"
            name="parentId"
            control={control}
            options={parentOptions}
            error={errors.parentId}
            placeholder="Select parent"
          />
          {errors.parentId && (
            <p className="text-xs text-red-500">{errors.parentId.message}</p>
          )}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-xs text-gray-500">Image</span>
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
                  <div className="flex flex-col justify-center cursor-pointer" onClick={() => open()}>
                    <div className="text-gray-500 flex gap-2 p-2 border-2 rounded-md">
                      <ImageUp />
                      <span>Upload a photo</span>
                    </div>
                  </div>
                );
              }}
            </CldUploadWidget>
          </div>
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

export default StudentForm;