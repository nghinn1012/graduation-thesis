import React, { useState, useRef } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

interface ServingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (servings: number) => void;
}

const ServingsModal: React.FC<ServingsModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validationSchema = Yup.object({
    servings: Yup.number()
      .min(1, 'Must be at least 1')
      .required('Required')
      .typeError('Must be a number'),
  });

  const formik = useFormik({
    initialValues: { servings: '1' }, 
    validationSchema,
    onSubmit: (values) => {
      onConfirm(Number(values.servings));
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.selectionStart = inputRef.current.value.length;
      inputRef.current.selectionEnd = inputRef.current.value.length;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-10">
      <div className="modal-overlay fixed inset-0 bg-black opacity-50"></div>
      <div className="modal-content bg-white p-6 rounded-lg max-w-sm z-50">
        <h2 className="text-lg font-semibold mb-4">Select Servings</h2>
        <form onSubmit={formik.handleSubmit}>
          <input
            type="number"
            name="servings"
            value={formik.values.servings}
            min="1"
            onChange={formik.handleChange}
            onFocus={handleFocus}
            className={`border rounded p-2 mb-4 w-full ${formik.errors.servings ? 'border-red-500' : ''}`}
            ref={inputRef}
          />
          {formik.errors.servings && (
            <div className="text-red-500 mb-2">{formik.errors.servings}</div>
          )}
          <div className="flex justify-between">
            <button type="button" onClick={onClose} className="btn btn-secondary mr-2">Cancel</button>
            <button type="submit" className="btn btn-primary">Add to Shopping List</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServingsModal;
