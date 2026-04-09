import { useState } from "react";
import { useForm, type FieldPath, type RegisterOptions } from "react-hook-form";
import type { TenderFormValues, TenderItem, TenderMutationInput } from "../dashboard.types";
import { DashboardIcon } from "./DashboardUi";

type TenderFormProps = {
  initialTender?: Partial<TenderItem>;
  initialValues?: Partial<TenderFormValues>;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: TenderMutationInput) => Promise<void>;
  onCancel?: () => void;
  allowStatusChange?: boolean;
};

function TenderForm({
  initialTender,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
  allowStatusChange = false,
}: TenderFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<TenderFormValues>({
    defaultValues: {
      title: initialValues?.title ?? initialTender?.title ?? "",
      description: initialValues?.description ?? initialTender?.description ?? "",
      budget: initialValues?.budget ?? (initialTender?.budget ? String(initialTender.budget) : ""),
      deadline: initialValues?.deadline ?? (initialTender?.deadline ? new Date(initialTender.deadline).toISOString().slice(0, 10) : ""),
      category: initialValues?.category ?? initialTender?.category ?? "",
      location: initialValues?.location ?? initialTender?.location ?? "",
      status: initialValues?.status ?? (initialTender?.status === "closed" ? "closed" : "open"),
    },
  });

  function clearFeedback(field?: FieldPath<TenderFormValues>) {
    if (field) {
      clearErrors(field);
    }

    setFormError(null);
  }

  function registerField<TFieldName extends FieldPath<TenderFormValues>>(
    field: TFieldName,
    options?: RegisterOptions<TenderFormValues, TFieldName>,
  ) {
    return register(field, {
      ...options,
      onChange: (event) => {
        options?.onChange?.(event);
        clearFeedback(field);
      },
    });
  }

  async function handleFormSubmit(values: TenderFormValues) {
    setFormError(null);

    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        budget: Number(values.budget),
        deadline: values.deadline,
        category: values.category.trim(),
        location: values.location.trim(),
        documents: selectedFiles,
        status: allowStatusChange ? values.status : undefined,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the tender.");
    }
  }

  function inputClass(hasError: boolean) {
    return [
      "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200",
      "placeholder:text-slate-400",
      hasError
        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200",
    ].join(" ");
  }

  function fieldError(message?: string) {
    return message ? <p className="mt-2 text-sm text-rose-600">{message}</p> : null;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
          <input
            className={inputClass(Boolean(errors.title?.message))}
            placeholder="Road maintenance procurement"
            {...registerField("title", { required: "Title is required" })}
          />
          {fieldError(errors.title?.message)}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Budget</span>
          <input
            className={inputClass(Boolean(errors.budget?.message))}
            inputMode="decimal"
            placeholder="250000"
            {...registerField("budget", {
              required: "Budget is required",
              validate: (value) => Number(value) > 0 || "Budget must be greater than 0",
            })}
          />
          {fieldError(errors.budget?.message)}
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
        <textarea
          className={inputClass(Boolean(errors.description?.message))}
          rows={5}
          placeholder="Describe the scope, requirements, and expected outcome."
          {...registerField("description", { required: "Description is required" })}
        />
        {fieldError(errors.description?.message)}
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Deadline</span>
          <input
            className={inputClass(Boolean(errors.deadline?.message))}
            type="date"
            {...registerField("deadline", { required: "Deadline is required" })}
          />
          {fieldError(errors.deadline?.message)}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
          <input
            className={inputClass(Boolean(errors.category?.message))}
            placeholder="Infrastructure"
            {...registerField("category", { required: "Category is required" })}
          />
          {fieldError(errors.category?.message)}
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Location</span>
          <input
            className={inputClass(Boolean(errors.location?.message))}
            placeholder="Kathmandu"
            {...registerField("location", { required: "Location is required" })}
          />
          {fieldError(errors.location?.message)}
        </label>

        {allowStatusChange ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <select className={inputClass(Boolean(errors.status?.message))} {...registerField("status")}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
            {fieldError(errors.status?.message)}
          </label>
        ) : (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-700">Initial status</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              New tenders open immediately so businesses can start submitting bids.
            </p>
          </div>
        )}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Upload Documents</span>
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-5">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            <DashboardIcon className="h-4 w-4" name="upload" />
            Select files
            <input
              className="hidden"
              type="file"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setSelectedFiles(files);
                clearFeedback();
              }}
            />
          </label>
          <p className="mt-3 text-sm text-slate-500">
            Upload up to 5 files. Supported formats: pdf, doc, docx.
          </p>
          {selectedFiles.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedFiles.map((file) => (
                <span
                  className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                  key={file.name}
                >
                  {file.name}
                </span>
              ))}
            </div>
          ) : initialTender?.documents && initialTender.documents.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {initialTender.documents.map((document) => (
                <span
                  className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  key={document.url}
                >
                  {document.originalname}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}

        <button
          className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-wait disabled:bg-sky-400"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TenderForm;
