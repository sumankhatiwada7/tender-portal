import { Link, useOutletContext } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../features/auth/auth.config";
import { CardSurface, DashboardIcon, SectionHeader } from "../../features/dashboard/components/DashboardUi";
import type { GovernmentOutletContext } from "../../features/dashboard/dashboard.types";

function SettingToggle({ label, description, enabled = true }: { label: string; description: string; enabled?: boolean }) {
  const [checked, setChecked] = useState(enabled);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div>
        <p className="font-semibold text-slate-950 dark:text-white">{label}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        aria-pressed={checked}
        className={["relative h-6 w-11 rounded-full transition", checked ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-700"].join(" ")}
        type="button"
        onClick={() => setChecked((current) => !current)}
      >
        <span className={["absolute top-1 h-4 w-4 rounded-full bg-white transition", checked ? "left-6" : "left-1"].join(" ")} />
      </button>
    </div>
  );
}

function ProfilePage() {
  const { session, onLogout } = useOutletContext<GovernmentOutletContext>();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  async function handleProfileImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post<{ url?: string }>(`${API_BASE_URL}/api/v1/upload/profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      setUploadedImageUrl(response.data.url ?? null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUploadError(String(error.response?.data?.message ?? "Unable to upload profile image."));
      } else {
        setUploadError("Unable to upload profile image.");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <CardSurface className="overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-lg bg-white/10">
                {uploadedImageUrl ? (
                  <img className="h-full w-full object-cover" src={uploadedImageUrl} alt="Profile" />
                ) : (
                  <DashboardIcon className="h-9 w-9 text-sky-200" name="building" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">Government profile</p>
                <h2 className="mt-2 text-3xl font-semibold">{session.user.name}</h2>
                <p className="mt-1 text-sm text-slate-300">{session.user.email}</p>
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              <DashboardIcon className="h-4 w-4" name="upload" />
              {uploading ? "Uploading..." : "Upload logo"}
              <input className="hidden" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(event) => void handleProfileImageUpload(event)} disabled={uploading} />
            </label>
          </div>
          {uploadError ? <p className="mt-4 text-sm text-rose-200">{uploadError}</p> : null}
        </div>
      </CardSurface>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <CardSurface className="p-6">
            <SectionHeader eyebrow="Organization information" title="Agency profile" description="Core organization details associated with this government account." />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["Organization", session.user.name],
                ["Account role", session.user.role],
                ["Registration status", "Verified agency"],
                ["Portal access", "Tender publisher"],
              ].map(([label, value]) => (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950" key={label}>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 font-semibold capitalize text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </CardSurface>

          <CardSurface className="p-6">
            <SectionHeader eyebrow="Contact details" title="Primary contact" description="Keep official contact channels visible for tender communications." />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Official email</span>
                <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" readOnly value={session.user.email} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</span>
                <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" defaultValue="+977-01-5550000" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</span>
                <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" defaultValue="Government Procurement Office, Kathmandu" />
              </label>
            </div>
          </CardSurface>

          <CardSurface className="p-6">
            <SectionHeader eyebrow="Department information" title="Procurement department" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Department", "Procurement"],
                ["Region", "Central"],
                ["Approval level", "Publisher"],
              ].map(([label, value]) => (
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800" key={label}>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </CardSurface>
        </div>

        <div className="space-y-6">
          <CardSurface className="p-6">
            <SectionHeader eyebrow="Security settings" title="Account protection" />
            <div className="mt-5 space-y-3">
              <SettingToggle label="Two-factor authentication" description="Require a second verification step for sensitive account actions." />
              <SettingToggle label="Tender change alerts" description="Notify the agency when tenders are edited, closed, or awarded." />
            </div>
          </CardSurface>

          <CardSurface className="p-6">
            <SectionHeader eyebrow="Password change" title="Update credentials" />
            <div className="mt-5 space-y-4">
              {["Current password", "New password", "Confirm new password"].map((label) => (
                <label className="block" key={label}>
                  <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                  <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" type="password" placeholder="••••••••" />
                </label>
              ))}
              <button className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500" type="button">
                Update password
              </button>
            </div>
          </CardSurface>

          <CardSurface className="p-6">
            <SectionHeader eyebrow="Notification preferences" title="Portal notifications" />
            <div className="mt-5 space-y-3">
              <SettingToggle label="New bid submissions" description="Receive an alert when a company submits a bid." />
              <SettingToggle label="Upcoming deadlines" description="Send reminders before tender submission deadlines." />
              <SettingToggle label="Weekly analytics digest" description="Summarize tender and bid performance every week." enabled={false} />
            </div>
          </CardSurface>

          <CardSurface className="p-6">
            <SectionHeader eyebrow="Activity logs" title="Recent account activity" />
            <div className="mt-5 space-y-3">
              {[
                "Profile settings viewed",
                "Tender dashboard opened",
                "Authenticated government session active",
              ].map((item) => (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800" key={item}>
                  <DashboardIcon className="h-5 w-5 text-sky-600 dark:text-sky-300" name="clock" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </CardSurface>

          <CardSurface className="p-6">
            <SectionHeader eyebrow="Account settings" title="Quick actions" />
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-sky-500" to="/government/manage">
                Edit tenders
              </Link>
              <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" type="button" onClick={onLogout}>
                Logout
              </button>
            </div>
          </CardSurface>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
