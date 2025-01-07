export const StatCard = ({ title, total, today, className = "" }) => (
  <div
    className={`bg-white px-6 py-4 rounded-xl shadow-lg h-full ${className}`}
  >
    <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>
    <div className="flex justify-between items-end">
      <div className="flex flex-col">
        <p className="text-gray-900 text-4xl font-bold mb-3">{total}</p>
        <p className="text-sm text-gray-600">Total {title}</p>
      </div>
      <p className="text-green-400">+{today} today</p>
    </div>
  </div>
);
