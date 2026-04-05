import { Link, useOutletContext } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../features/auth/auth.config";
import { CardSurface, DashboardIcon } from "../../features/dashboard/components/DashboardUi";
import type { GovernmentOutletContext } from "../../features/dashboard/dashboard.types";

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
    <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
      <CardSurface className="p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Account profile</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Government user details</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This profile is sourced from the authenticated session stored after login.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile image</p>
            {uploadedImageUrl ? (
              <img
                className="mt-3 h-20 w-20 rounded-full border border-slate-200 object-cover"
                src={uploadedImageUrl}
                alt="Profile"
              />
            ) : null}
            <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-500">
              {uploading ? "Uploading..." : "Upload image"}
              <input
                className="hidden"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(event) => void handleProfileImageUpload(event)}
                disabled={uploading}
              />
            </label>
            {uploadError ? <p className="mt-2 text-xs text-rose-600">{uploadError}</p> : null}
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Full name</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{session.user.name}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
            <p className="mt-2 text-lg font-semibold capitalize text-slate-950">{session.user.role}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email address</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{session.user.email}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            to="/government/manage"
          >
            Manage tenders
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            type="button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </CardSurface>

      <div className="space-y-6">
        <CardSurface className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-700">
            <DashboardIcon className="h-6 w-6" name="shield" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-slate-950">Session summary</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Government accounts are redirected into the dashboard automatically after login so procurement work starts in the right place.
          </p>
        </CardSurface>

        <CardSurface className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Quick links</p>
          <div className="mt-4 grid gap-3">
            <Link className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950" to="/government/create">
              Create a new tender
            </Link>
            <Link className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:text-slate-950" to="/government/bids">
              Review bids received
            </Link>
          </div>
        </CardSurface>
      </div>
    </div>
  );
}

export default ProfilePage;
