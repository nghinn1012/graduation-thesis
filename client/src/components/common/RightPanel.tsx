import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeleton/RightPanelSkeleton";


const USERS_FOR_RIGHT_PANEL = [
  {
    _id: "1",
    username: "user1",
    name: "John Doe",
    avatar: "https://random.imagecdn.app/500/150"
  },
  {
    _id: "2",
    username: "user2",
    name: "VnExpress",
    avatar: "https://random.imagecdn.app/500/150"
  },
  {
    _id: "3",
    username: "user3",
    name: "Neil deGrasse Tyson",
    avatar: "https://random.imagecdn.app/500/150"
  },
  {
    _id: "4",
    username: "user4",
    name: "Elon Musk",
    avatar: "https://random.imagecdn.app/500/150"
  },
];

interface User {
	_id: string;
	username: string;
	name: string;
	avatar?: string;
}

const RightPanel = () => {
	const isLoading = false;

	return (
		<div className='hidden lg:block mt-12 mx-2'>
			<div className='p-4 rounded-md border border-gray-300 top-2'>
				<p className='font-bold my-4'>Who to follow</p>
				<div className='flex flex-col gap-6'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						USERS_FOR_RIGHT_PANEL?.map((user: User) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.avatar || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-40'>
											{user.name}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn btn-neutral text-white hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => e.preventDefault()}
									>
										Follow
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};

export default RightPanel;
