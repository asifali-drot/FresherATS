import { getGuides } from '@/lib/sanity.client';

export default async function SanityTest() {
  const guides = await getGuides();

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Sanity Guides</h2>
      {guides.length === 0 ? (
        <p>No guides found. Add some in Sanity Studio!</p>
      ) : (
        <ul className="space-y-4">
          {guides.map((guide: any) => (
            <li key={guide._id} className="border p-4 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold">{guide.title}</h3>
              <p className="text-gray-600">{guide.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
