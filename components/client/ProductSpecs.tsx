'use client';

interface Specification {
  key: string;
  value: string;
}

interface SpecGroup {
  category: string;
  specs: Specification[];
}

interface ProductSpecsProps {
  specifications: SpecGroup[];
}

export default function ProductSpecs({ specifications }: ProductSpecsProps) {
  if (!specifications?.length) return null;

  return (
    <div className="mt-12 border rounded-lg overflow-hidden bg-gray-50">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specifications.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                {group.category || 'General'}
              </h3>
              <dl className="space-y-3">
                {group.specs?.map((spec, specIndex) => spec && (
                  <div key={specIndex} className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">{spec.key}</dt>
                    <dd className="text-sm text-gray-900 mt-1">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
