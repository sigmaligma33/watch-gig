export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Application Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The application you're looking for doesn't exist.
        </p>
      </div>
    </div>
  )
}
