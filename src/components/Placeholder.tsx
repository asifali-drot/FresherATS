export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-4xl font-extrabold text-zinc-900">{title}</h1>
      <p className="mt-4 text-zinc-600">This page is coming soon.</p>
    </div>
  );
}
