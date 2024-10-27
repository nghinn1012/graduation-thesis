// import React, { useState, useRef, useEffect } from "react";
// import { FiMoreVertical } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// interface DropdownMenuProps {
//   orderId: string;
// }

// const DropdownMenu: React.FC<DropdownMenuProps> = ({ orderId }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLTableCellElement>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();
//     setIsOpen(!isOpen);
//   };

//   const handleOptionClick = () => {
//     navigate(`/orders/${orderId}`, { state: { orderId } });
//     setIsOpen(false);
//   };

//   return (
//     <td className="relative" ref={dropdownRef}>
//       <button
//         onClick={toggleDropdown}
//         className="hover:bg-gray-100 rounded-full"
//       >
//         <FiMoreVertical className="h-5 w-5 text-gray-600" />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
//           <ul className="py-1">
//             <li>
//               <button
//                 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                 onClick={handleOptionClick}
//               >
//                 Xem chi tiết
//               </button>
//             </li>
//           </ul>
//         </div>
//       )}
//     </td>
//   );
// };

// export default DropdownMenu;
