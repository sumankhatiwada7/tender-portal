import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { create } from "../../api/tender.api";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";

const categories = ["Construction", "IT & Software", "Healthcare", "Education", "Energy", "Supply", "Transport", "Other"];
const provinces = ["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim", "Nationwide"];

export default function TenderCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    category: categories[0],
    province: provinces[0],
  });

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const nextErrors: Record<string, string> = {};

    if (!form.title) nextErrors.title = "Title is required";
    if (!form.description) nextErrors.description = "Description is required";
    if (!form.budget || Number(form.budget) <= 0) nextErrors.budget = "Budget must be greater than 0";
    if (!form.deadline) nextErrors.deadline = "Deadline is required";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("budget", form.budget);
      payload.append("deadline", form.deadline);
      payload.append("category", form.category);
      payload.append("location", form.province);
      files.forEach((file) => payload.append("documents", file));
      await create(payload);
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message || "Unable to create tender");
    } finally {
      setLoading(false);
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, current) => current !== index));
  }

  return (
    <main className="min-h-screen bg-bg">
      <PageHeader eyebrow="Create tender" title="Publish a new tender" />
      <section className="mx-auto max-w-3xl px-12 py-8">
        <form onSubmit={onSubmit} className="rounded-xl border-[1.5px] border-gray-200 bg-white p-8">
          {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Tender title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {fieldErrors.title ? <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Description</label>
              <Textarea className="min-h-30" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {fieldErrors.description ? <p className="mt-1 text-xs text-red-500">{fieldErrors.description}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Budget</label>
              <div className="flex rounded-lg border-[1.5px] border-gray-200 bg-gray-50">
                <span className="px-3 py-2.5 text-sm text-gray-500">NPR</span>
                <input
                  type="number"
                  className="w-full bg-transparent py-2.5 pr-3.5 text-sm outline-none"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              {fieldErrors.budget ? <p className="mt-1 text-xs text-red-500">{fieldErrors.budget}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Deadline</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              {fieldErrors.deadline ? <p className="mt-1 text-xs text-red-500">{fieldErrors.deadline}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Category</label>
              <select
                className="w-full rounded-lg border-[1.5px] border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-green-main"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Province</label>
              <select
                className="w-full rounded-lg border-[1.5px] border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-green-main"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              >
                {provinces.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <label className="block cursor-pointer rounded-xl border-[1.5px] border-dashed border-gray-300 p-4 hover:bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">Upload documents</p>
              <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX · Max 5 files</p>
              <input
                className="hidden"
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))}
              />
            </label>

            {files.length > 0 ? (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={file.name} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                    <span>{file.name}</span>
                    <button type="button" className="text-red-600" onClick={() => removeFile(index)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" className="px-6" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button className="px-6" disabled={loading}>
              {loading ? "Publishing..." : "Publish tender →"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
