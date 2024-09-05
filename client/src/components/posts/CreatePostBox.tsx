// CreatePost.tsx
import React, { useState, useEffect } from 'react';
import PostModal from './CreatePostModal';

const CreatePostBox: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const accountData = localStorage.getItem("account");
        if (accountData) {
            setData(JSON.parse(accountData));
        }
    }, []);

    const handlePostSubmit = (title: string, about: string, images: string[]) => {
        // Handle post submission logic here
        console.log('Title:', title);
        console.log('About:', about);
        console.log('Images:', images);
        setIsModalOpen(false);
        alert("Post created successfully");
    };

    return (
        <div className='relative'>
            {/* Main Interface */}
            <div className='flex p-4 items-start gap-4 border-b border-gray-300'>
                <div className='avatar'>
                    <div className='w-8 rounded-full'>
                        <img src={data?.avatar || "/avatar-placeholder.png"} alt="Profile" />
                    </div>
                </div>
                <textarea
                    className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-300 cursor-pointer'
                    placeholder='What is happening?!'
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            {/* Modal */}
            <PostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handlePostSubmit}
            />
        </div>
    );
};

export default CreatePostBox;
