import { useState } from "react";
import { useForm, type FieldPath, type RegisterOptions } from "react-hook-form";
import type { TenderFormValues, TenderItem, TenderMutationInput } from "../dashboard.types";
import { CardSurface, DashboardIcon } from "./DashboardUi";

type TenderFormProps = {
  initialTender?: Partial<TenderItem>;
  initialValues?: Partial<TenderFormValues>;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: TenderMutationInput) => Promise<void>;
  onSaveDraft?: (values: TenderFormValues) => void;
  onCancel?: () => void;
  allowStatusChange?: boolean;
};

function TenderForm({
  initialTender,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onSaveDraft,
  onCancel,
  allowStatusChange = false,
}: TenderFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    trigger,
    watch,
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
      eligibilityCriteria: initialValues?.eligibilityCriteria ?? initialTender?.eligibilityCriteria ?? "",
      requiredDocuments: initialValues?.requiredDocuments ?? initialTender?.requiredDocuments ?? "",
      tenderType: initialValues?.tenderType ?? initialTender?.tenderType ?? "Open Competitive",
      contactInformation: initialValues?.contactInformation ?? initialTender?.contactInformation ?? "",
    },
  });

  const watchedValues = watch();
  const steps = [
    { title: "Tender details", fields: ["title", "category", "tenderType", "location"] as FieldPath<TenderFormValues>[] },
    { title: "Scope and criteria", fields: ["description", "budget", "deadline", "eligibilityCriteria", "requiredDocuments"] as FieldPath<TenderFormValues>[] },
    { title: "Documents and review", fields: ["contactInformation"] as FieldPath<TenderFormValues>[] },
  ];

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
        eligibilityCriteria: values.eligibilityCriteria.trim(),
        requiredDocuments: values.requiredDocuments.trim(),
        tenderType: values.tenderType.trim(),
        contactInformation: values.contactInformation.trim(),
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the tender.");
    }
  }

  function inputClass(hasError: boolean) {
    return [
      "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200",
      "placeholder:text-slate-400 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500",
      hasError
        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        : "border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:focus:border-sky-400",
    ].join(" ");
  }

  function fieldError(message?: string) {
    return message ? <p className="mt-2 text-sm text-rose-600">{message}</p> : null;
  }

  async function goToNextStep() {
    const isValid = await trigger(steps[currentStep].fields);
    if (isValid) {
      setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
    }
  }

  function handleSaveDraft() {
    onSaveDraft?.(watchedValues);
  }

  function fieldLabel(label: string) {
    return <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      {formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => (
          <button
            className={[
              "rounded-lg border px-4 py-3 text-left text-sm transition",
              index === currentStep
                ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-950/40 dark:text-sky-100"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400",
            ].join(" ")}
            key={step.title}
            type="button"
            onClick={() => setCurrentStep(index)}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">Step {index + 1}</span>
            <span className="mt-1 block font-semibold">{step.title}</span>
          </button>
        ))}
      </div>

      {currentStep === 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            {fieldLabel("Tender Title")}
            <input
              className={inputClass(Boolean(errors.title?.message))}
              placeholder="Road maintenance procurement"
              {...registerField("title", { required: "Tender title is required" })}
            />
            {fieldError(errors.title?.message)}
          </label>

          <label className="block">
            {fieldLabel("Tender Category")}
            <select className={inputClass(Boolean(errors.category?.message))} {...registerField("category", { required: "Tender category is required" })}>
              <option value="">Select category</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Public Works">Public Works</option>
              <option value="Consulting">Consulting</option>
            </select>
            {fieldError(errors.category?.message)}
          </label>

          <label className="block">
            {fieldLabel("Tender Type")}
            <select className={inputClass(Boolean(errors.tenderType?.message))} {...registerField("tenderType", { required: "Tender type is required" })}>
              <option value="Open Competitive">Open Competitive</option>
              <option value="Selective">Selective</option>
              <option value="Expression of Interest">Expression of Interest</option>
              <option value="Request for Proposal">Request for Proposal</option>
            </select>
            {fieldError(errors.tenderType?.message)}
          </label>

          <label className="block">
            {fieldLabel("Location")}
            <input
              className={inputClass(Boolean(errors.location?.message))}
              placeholder="Kathmandu"
              {...registerField("location", { required: "Location is required" })}
            />
            {fieldError(errors.location?.message)}
          </label>

          {allowStatusChange ? (
            <label className="block">
              {fieldLabel("Tender Status")}
              <select className={inputClass(Boolean(errors.status?.message))} {...registerField("status")}>
                <option value="open">Active</option>
                <option value="closed">Closed</option>
              </select>
              {fieldError(errors.status?.message)}
            </label>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Initial status</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                New tenders publish as active after payment verification.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="space-y-5">
          <label className="block">
            {fieldLabel("Description")}
            <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-wrap gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
                {["B", "I", "List", "Link"].map((tool) => (
                  <button
                    className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    key={tool}
                    type="button"
                    title={`${tool} formatting`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
              <textarea
                className="min-h-36 w-full resize-y border-none bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                placeholder="Describe the scope, milestones, evaluation method, and expected outcome."
                {...registerField("description", { required: "Description is required" })}
              />
            </div>
            {fieldError(errors.description?.message)}
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              {fieldLabel("Budget")}
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

            <label className="block">
              {fieldLabel("Submission Deadline")}
              <input
                className={inputClass(Boolean(errors.deadline?.message))}
                type="date"
                {...registerField("deadline", { required: "Submission deadline is required" })}
              />
              {fieldError(errors.deadline?.message)}
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              {fieldLabel("Eligibility Criteria")}
              <textarea
                className={inputClass(Boolean(errors.eligibilityCriteria?.message))}
                rows={4}
                placeholder="Minimum registration, experience, certifications, or financial capacity."
                {...registerField("eligibilityCriteria", { required: "Eligibility criteria is required" })}
              />
              {fieldError(errors.eligibilityCriteria?.message)}
            </label>
            <label className="block">
              {fieldLabel("Required Documents")}
              <textarea
                className={inputClass(Boolean(errors.requiredDocuments?.message))}
                rows={4}
                placeholder="Tax clearance, company registration, technical proposal, financial proposal."
                {...registerField("requiredDocuments", { required: "Required documents are required" })}
              />
              {fieldError(errors.requiredDocuments?.message)}
            </label>
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="space-y-5">
          <label className="block">
            {fieldLabel("Contact Information")}
            <input
              className={inputClass(Boolean(errors.contactInformation?.message))}
              placeholder="Procurement Unit, procurement@example.gov, +977-01-5550000"
              {...registerField("contactInformation", { required: "Contact information is required" })}
            />
            {fieldError(errors.contactInformation?.message)}
          </label>

          <label className="block">
            {fieldLabel("File Upload Section")}
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-4 py-5 dark:border-slate-700 dark:bg-slate-950">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500">
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
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Upload up to 5 files. Supported formats: pdf, doc, docx.
              </p>
              {selectedFiles.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedFiles.map((file) => (
                    <span
                      className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-200"
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
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      key={document.url}
                    >
                      {document.originalname}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </label>

          <CardSurface className="p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <DashboardIcon className="h-5 w-5" name="check" />
              </div>
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">Ready for validation</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Preview the tender before publishing, or save a draft and continue later.
                </p>
              </div>
            </div>
          </CardSurface>
        </div>
      ) : null}

      {previewOpen ? (
        <CardSurface className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">Tender Preview</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{watchedValues.title || "Untitled tender"}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {watchedValues.category || "No category"} | {watchedValues.tenderType || "Tender type"} | {watchedValues.location || "No location"}
              </p>
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300" type="button" onClick={() => setPreviewOpen(false)}>
              Hide
            </button>
          </div>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <p><span className="font-semibold text-slate-900 dark:text-white">Budget:</span> {watchedValues.budget || "Not set"}</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Deadline:</span> {watchedValues.deadline || "Not set"}</p>
            <p className="md:col-span-2"><span className="font-semibold text-slate-900 dark:text-white">Description:</span> {watchedValues.description || "Not set"}</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Eligibility:</span> {watchedValues.eligibilityCriteria || "Not set"}</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Required documents:</span> {watchedValues.requiredDocuments || "Not set"}</p>
          </div>
        </CardSurface>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            type="button"
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
              type="button"
              onClick={() => void goToNextStep()}
            >
              Next
            </button>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}

        {onSaveDraft ? (
          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            type="button"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
        ) : null}

        <button
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          type="button"
          onClick={() => setPreviewOpen((current) => !current)}
        >
          Preview
        </button>

        <button
          className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-wait disabled:bg-sky-400"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        </div>
      </div>
    </form>
  );
}

export default TenderForm;
