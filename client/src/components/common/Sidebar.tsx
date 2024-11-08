import XSvg from "../svgs/X";

import { GoHome } from "react-icons/go";
import { IoNotificationsOutline, IoSearchOutline } from "react-icons/io5";
import { FaCartArrowDown, FaRegUser } from "react-icons/fa6";
import { Link, NavLink } from "react-router-dom";
import { BiDish, BiLogOut } from "react-icons/bi";
import { useAuthContext } from "../../hooks/useAuthContext";
import { PiPackageFill, PiShoppingCartLight } from "react-icons/pi";
import { LuCalendarDays, LuMail } from "react-icons/lu";
import { MdOutlineExplore } from "react-icons/md";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useNotificationContext } from "../../context/NotificationContext";
import { useI18nContext } from "../../hooks/useI18nContext";
const Sidebar = () => {
  const auth = useAuthContext();
  const { account } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const language = useI18nContext();
  const lang = language.of("Sidebar");

  const logout = () => {
    sessionStorage.clear();
    auth.logout();
  };

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-60">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-300 w-20 md:w-full">
        <NavLink to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white" />
        </NavLink>
        <ul className="flex flex-col gap-3 mt-6">
          <li className="flex justify-center md:justify-start">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <GoHome className="w-8 h-8" />
              <span className="text-lg hidden md:block mt-1">
                {lang("home")}
              </span>
            </NavLink>
          </li>
          <li className="flex justify-center md:justify-start">
            <NavLink
              to="/posts/explore"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <MdOutlineExplore className="w-8 h-8" />
              <span className="text-lg hidden md:block mt-1">
                {lang("explore")}
              </span>
            </NavLink>
          </li>
          <li className="flex justify-center md:justify-start">
            <NavLink
              to="/users/search"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <IoSearchOutline className="w-8 h-8" />
              <span className="text-lg hidden md:block mt-1">
                {lang("search")}
              </span>
            </NavLink>
          </li>
          <li className="flex justify-center md:justify-start">
            <NavLink
              to="/users/notifications"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <div className="relative">
                <IoNotificationsOutline className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-lg hidden md:block mt-1 ml-1">
                {lang("notifications")}
              </span>
            </NavLink>
          </li>

          <li className="flex juLinkstify-center md:justify-start">
            <NavLink
              to="/message"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <LuMail className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1 ml-1">
                {lang("messages")}
              </span>
            </NavLink>
          </li>

          <li className="flex justify-center md:justify-start">
            <NavLink
              to={`/users/profile/${account?._id}`}
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <FaRegUser className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1 ml-1">
                {lang("profile")}
              </span>
            </NavLink>
          </li>
          <li className="flex justify-center md:justify-start">
            <NavLink
              to="users/shoppingList"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <HiOutlineShoppingBag className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1">
                {lang("shopping-list")}
              </span>
            </NavLink>
          </li>

          <li className="flex justify-center md:justify-start">
            <NavLink
              to="users/mealPlanner"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <LuCalendarDays className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1">
                {lang("plan")}
              </span>
            </NavLink>
          </li>

          <li className="flex justify-center md:justify-start">
            <NavLink
              to="products"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <BiDish className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1">
                {lang("product")}
              </span>
            </NavLink>
          </li>

          <li className="flex justify-center md:justify-start">
            <NavLink
              to="cart"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <PiShoppingCartLight className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1">
                {lang("cart")}
              </span>
            </NavLink>
          </li>

          <li className="flex justify-center md:justify-start">
            <NavLink
              to="orders"
              className={({ isActive }) =>
                `flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                  isActive ? "bg-stone-300" : ""
                }`
              }
            >
              <PiPackageFill className="w-6 h-6" />
              <span className="text-lg hidden md:block mt-1">
                {lang("orders")}
              </span>
            </NavLink>
          </li>
        </ul>
        {account && (
          <div className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 py-2 px-4 rounded-full">
            <NavLink
              to={`/users/profile/${account._id}`}
              className="flex gap-2 items-start flex-1"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full">
                  <img
                    src={account?.avatar || "/avatar-placeholder.png"}
                    alt="Profile"
                  />
                </div>
              </div>
              <div className="flex justify-between flex-1">
                <div className="hidden md:block">
                  <p className="font-bold text-sm w-max-[50%] truncate">
                    {account?.name}
                  </p>
                  <p className="text-slate-500 text-sm">@{account?.username}</p>
                </div>
              </div>
            </NavLink>
            <BiLogOut
              className="w-5 h-5 cursor-pointer ml-1"
              onClick={() => logout()}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
