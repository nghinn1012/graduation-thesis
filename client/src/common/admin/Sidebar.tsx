import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RiDashboardLine } from 'react-icons/ri';
import { FiUsers } from 'react-icons/fi';
import { MdOutlineReport } from 'react-icons/md';
import { useI18nContext } from '../../hooks/useI18nContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const language = useI18nContext();
  const lang = language.of("AdminSection");

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <aside
      ref={sidebar}
      className={`absolute border-r border-gray-200 bg-white left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden shadow-sm lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5 lg:py-6 border-b border-gray-200">
        <NavLink to="/" className="text-gray-800 text-xl font-bold">
          {lang('admin-dashboard')}
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block text-gray-600 hover:text-gray-800 lg:hidden"
        >
          <RiDashboardLine size={24} />
        </button>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 bg-white">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-600 uppercase">
              {lang("menu")}
            </h3>

            <ul className="mb-6 flex flex-col gap-2">
              {/* <!-- Dashboard --> */}
              <li>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-lg py-2 pr-4 font-medium duration-300 ease-in-out hover:bg-gray-50 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border border-blue-100'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <RiDashboardLine size={20} />
                  {lang('dashboard')}
                </NavLink>
              </li>

              {/* <!-- Users --> */}
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-lg py-2 pr-4 font-medium duration-300 ease-in-out hover:bg-gray-50 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border border-blue-100'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <FiUsers size={20} />
                  {lang('users')}
                </NavLink>
              </li>

              {/* <!-- Complaints --> */}
              <li>
                <NavLink
                  to="/admin/complaints"
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-lg py-2 pr-4 font-medium duration-300 ease-in-out hover:bg-gray-50 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border border-blue-100'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <MdOutlineReport size={20} />
                  {lang('complaints')}
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
