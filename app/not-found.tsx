export default function NotFound() {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-xl text-slate-600">This page could not be found.</p>
        <a href="/" className="mt-6 text-blue-600 hover:underline">
          Return Home
        </a>
      </div>
    );
  }