import type { JSX } from "preact";

export default function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
      class={`px-3 py-2 bg-white rounded border-2 border-gray-500 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        props.class ?? ""
      }`}
    />
  );
}
