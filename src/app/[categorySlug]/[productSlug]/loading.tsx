export default function ProductDetailLoading() {
  return (
    <div className="py-8 md:py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
