export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-primary-900">
          Invoice Builder
        </h1>
        <p className="text-xl text-primary-700 max-w-md">
          Complete solution for managing invoices, inventory, and business analytics
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
