import XSvg from "../svgs/X";

import { GoHome } from "react-icons/go";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { BiShoppingBag } from "react-icons/bi";
import { AiOutlineUser } from "react-icons/ai";
import { PiShoppingCartLight } from "react-icons/pi";
import { HiOutlineUser } from "react-icons/hi";
const Sidebar = () => {
	const [data, setData] = useState<any>(null);
	const auth = useAuthContext();

	const logout = () => {
    sessionStorage.clear();
    auth.logout();
  };
	useEffect(() => {
		const accountData = localStorage.getItem("account");
		if (accountData) {
			setData(JSON.parse(accountData));
		}
	}, []);


	return (
		<div className='md:flex-[2_2_0] w-18 max-w-60'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-300 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
					<XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
				</Link>
				<ul className='flex flex-col gap-4 mt-6'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<GoHome className='w-8 h-8' />
							<span className='text-lg hidden md:block mt-1'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotificationsOutline className='w-6 h-6' />
							<span className='text-lg hidden md:block mt-1 ml-1'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${data?.u}`}
							className='flex gap-4 items-cente hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaRegUser className='w-6 h-6' />
							<span className='text-lg hidden md:block mt-1 ml-1'>Profile</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to='users/shoppingList'
							className='flex gap-4 items-center hover:bg-stone-200 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<PiShoppingCartLight className="w-6 h-6"/>
							<span className='text-lg hidden md:block mt-1'>Shopping List</span>
						</Link>
					</li>
				</ul>
				{data && (
					<div className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 py-2 px-4 rounded-full'>
						<Link
							to={`/profile/${data.username}`}
							className='flex gap-2 items-start flex-1'
						>
							<div className='avatar hidden md:inline-flex'>
								<div className='w-8 rounded-full'>
									<img src={data?.avatar || "/avatar-placeholder.png"} alt="Profile" />
								</div>
							</div>
							<div className='flex justify-between flex-1'>
								<div className='hidden md:block'>
									<p className='font-bold text-sm w-max-[50%] truncate'>{data?.name}</p>
									<p className='text-slate-500 text-sm'>@{data?.username}</p>
								</div>
							</div>
						</Link>
						<BiLogOut
							className='w-5 h-5 cursor-pointer ml-1'
							onClick={() => logout()}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
export default Sidebar;
