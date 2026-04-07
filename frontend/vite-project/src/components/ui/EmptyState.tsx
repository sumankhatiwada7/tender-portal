import type { ReactNode } from "react";

export default function EmptyState({ title, subtitle, icon }: { title: string; subtitle: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-10 text-center">
      <div className="mx-auto mb-3 w-fit text-green-main">{icon ?? <span className="text-2xl">○</span>}</div>
      <h3 className="font-syne text-xl font-extrabold tracking-tight text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
