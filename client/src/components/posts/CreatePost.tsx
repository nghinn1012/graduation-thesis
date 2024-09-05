import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

const CreatePost: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [images, setImages] = useState<string[]>([]); // Array to store multiple images
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility
    const [activeTab, setActiveTab] = useState<number>(0); // State to control active tab
    const [title, setTitle] = useState<string>(""); // State to handle title
    const [about, setAbout] = useState<string>(""); // State to handle about section

    const imgRef = useRef<HTMLInputElement | null>(null);

    const isPending = false;
    const isError = false;

    useEffect(() => {
        const accountData = localStorage.getItem("account");
        if (accountData) {
            setData(JSON.parse(accountData));
        }
    }, []);

    const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []); // Convert FileList to array
        const imageUrls: string[] = [];

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                imageUrls.push(reader.result as string);
                if (imageUrls.length === files.length) {
                    setImages((prevImages) => [...prevImages, ...imageUrls]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        // e.preventDefault();
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        if (images.length === 1 && imgRef.current) {
            imgRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTitle("");
        setAbout("");
        setImages([]);
        if (imgRef.current) {
          imgRef.current.value = '';
        }
        alert("Post created successfully");
        setIsModalOpen(false);
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
                {/* Clickable text area */}
                <textarea
                    className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-300 cursor-pointer'
                    placeholder='What is happening?!'
                    onClick={() => setIsModalOpen(true)} // Open modal on click
                />
            </div>

            {/* DaisyUI Multi-Tab Modal */}
            <input type="checkbox" id="create-post-modal" className="modal-toggle" checked={isModalOpen} onChange={() => setIsModalOpen(prev => !prev)} />
            <label htmlFor="create-post-modal" className="modal cursor-pointer">
                <label className="modal-box relative w-full max-w-3xl" htmlFor="">
                    <div className='tabs'>
                        <a
                            className={`tab tab-lifted ${activeTab === 0 ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(0)}
                        >
                            The basics
                        </a>
                        <a
                            className={`tab tab-lifted ${activeTab === 1 ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(1)}
                        >
                            Recipe
                        </a>
                    </div>
                    <form className='flex flex-col gap-4 w-full mt-4' onSubmit={handleSubmit}>
                        {activeTab === 0 && (
                            <div>
                              <div className="mt-4">
                                <label className="block mb-2 text-sm">Upload Photos</label>
                                <input
                                    type="file"
                                    className="file-input file-input-bordered w-full"
                                    onChange={handleImgChange}
                                    multiple
                                    ref={imgRef}
                                />
                                <div className='flex justify-center items-center mt-4 '>
                                    <div className={`carousel rounded-box w {images.length? > 0 ! "h-[400px]" : ""}`}>
                                        {images.map((img, index) => (
                                            <div key={index} className='carousel-item relative w-full'>
                                                <IoCloseSharp
                                                    className='absolute top-2 right-3 z-50 text-white bg-gray-300 rounded-full w-5 h-5 cursor-pointer'
                                                    onClick={() => removeImage(index)}
                                                />
                                                <img src={img} alt={`Selected ${index}`} className='w-full mx-auto h-[400px] object-contain' />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              </div>
                                <div className="mt-4">
                                    <label className="block mb-2 text-sm">Title</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="Enter post title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block mb-2 text-sm">About</label>
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Tell us about your post"
                                        value={about}
                                        onChange={(e) => setAbout(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 1 && (
                            <div className='flex flex-wrap gap-4'>
                            {/* //     {images.map((img, index) => (
                            //         <div key={index} className='relative w-72 mx-auto'>
                            //             <IoCloseSharp
                            //                 className='absolute top-0 right-0 text-white bg-gray-300 rounded-full w-5 h-5 cursor-pointer'
                            //                 onClick={() => removeImage(index)}
                            //             />
                            //             <img src={img} alt={`Selected ${index}`} className='w-full mx-auto h-72 object-contain rounded' />
                            //         </div>
                            //     ))} */}
                            </div>
                        )}
                        <div className='flex justify-between border-t py-2 border-t-gray-300'>
                            <button className='ml-[90%] btn btn-primary rounded-full btn-sm text-white px-4' type='submit'>
                                {isPending ? "Posting..." : "Post"}
                            </button>
                        </div>
                        {isError && <div className='text-red-500'>Something went wrong</div>}
                    </form>
                </label>
            </label>
        </div>
    );
};

export default CreatePost;
