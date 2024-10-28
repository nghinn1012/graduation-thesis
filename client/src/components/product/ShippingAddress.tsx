import React, { useState } from 'react';
import { BsGeoAlt } from 'react-icons/bs';

const ShippingAddressSection = ({
  formData,
  setFormData,
  errors
}: {
  formData: {
    recipientName: string;
    phoneNumber: string;
    address: string;
  };
  setFormData: (data: any) => void;
  errors: any;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFormData, setTempFormData] = useState(formData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData((prev: any) => ({
      ...prev,
      ...tempFormData
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-base font-medium">Shipping Address</span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-pink-500 text-sm font-medium"
        >
          Edit
        </button>
      </div>

      {/* Address Display */}
      <div className="flex items-start">
        <BsGeoAlt className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="font-medium">{formData.recipientName}</span>
          <span className="text-gray-600 text-sm">{formData.phoneNumber}</span>
          <span className="text-gray-600 text-sm">{formData.address}</span>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Edit Shipping Address</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                {/* Recipient Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={tempFormData.recipientName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.recipientName ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.recipientName && (
                    <p className="text-red-500 text-xs mt-1">{errors.recipientName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={tempFormData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    name="address"
                    value={tempFormData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
