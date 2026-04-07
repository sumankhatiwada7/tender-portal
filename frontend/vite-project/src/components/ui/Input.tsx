import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-green-main focus:bg-white outline-none transition-colors ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-green-main focus:bg-white outline-none transition-colors ${props.className ?? ""}`}
    />
  );
}
