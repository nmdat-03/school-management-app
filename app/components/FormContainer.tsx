import { TableType } from "@/lib/form";
import FormModal from "./FormModal";

interface FormContainerProps {
  table: TableType;
  type: "create" | "update" | "delete";
  data?: unknown;
  id?: number | string;
  relatedData?: Record<string, unknown>;
}

const FormContainer = ({
  table,
  type,
  data,
  id,
  relatedData = {},
}: FormContainerProps) => {
  return (
    <div>
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;