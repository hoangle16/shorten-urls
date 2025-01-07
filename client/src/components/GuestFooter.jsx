const GuestFooter = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4">htl.com</h4>
            <p className="text-gray-400">Professional, secure, and reliable URL shortening service</p>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Email: support@htl.com</li>
              <li className="text-gray-400">Phone: (84) 123-456-789</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 htl.com All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default GuestFooter;