const StatOverviewCard = ({ title, value, todayValue }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-[215px] flex flex-col justify-between">
    <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
    <p className="text-gray-600">
      <span className="text-green-400">+{todayValue}</span> Today
    </p>
  </div>
);

export default StatOverviewCard;
