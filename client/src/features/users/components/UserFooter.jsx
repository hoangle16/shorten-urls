import { Link } from "react-router-dom";

const UserFooter = () => {
  return (
    <footer className="bg-white border-t h-16 p-4 mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p className="text-gray-600 mb-4 sm:mb-0">
          &copy; 2024 htl.com All rights reserved.
        </p>

        <nav>
          <ul className="flex gap-4 list-none text-gray-600">
            <li>
              <Link to="/report">Report</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default UserFooter;
