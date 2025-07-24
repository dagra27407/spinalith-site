/**
 * NotFound
 *
 * Fallback route for unknown or invalid paths.
 * Displays a simple 404 error message to the user.
 *
 * @returns {JSX.Element} 404 fallback page.
 */

export default function NotFound() {
  return <div className="text-red-600 text-xl">404 — Page Not Found</div>;
}
