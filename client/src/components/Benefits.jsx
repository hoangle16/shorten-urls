import { Link as LinkIcon } from "lucide-react";

const Benefits = () => {
  return (
    <>
      <h2 className="text-3xl font-bold text-center mb-12">
        Why use our URL shortening service?
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Short Links</h3>
          <p className="text-gray-600">
            Transform long URLs into short, memorable links that are easy to
            share
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
          <p className="text-gray-600">
            Protect your links with passwords and track visitor statistics
          </p>
        </div>
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Customizable</h3>
          <p className="text-gray-600">
            Customize your URLs, add descriptions, and set expiration dates
          </p>
        </div>
      </div>
    </>
  );
};

export default Benefits;
