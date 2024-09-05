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
        setImages((prevImages) => {
            const newImages = prevImages.filter((_, i) => i !== index);

            // Clear input file if no images are left
            if (newImages.length === 0 && imgRef.current) {
                imgRef.current.value = ''; // Clear the file input
            }

            return newImages;
        });
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

    const handleClick = () => {
      if (imgRef.current) {
          imgRef.current.click();
      }
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

            {/* Modal with close button */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="modal-overlay fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
                    <div className="modal-content relative bg-white p-6 rounded-lg max-w-3xl w-full">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <IoCloseSharp className="w-6 h-6" />
                        </button>
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
                                      <div className="flex flex-row gap-4">
                                        {/* <input
                                            type="file"
                                            className="file-input file-input-bordered w-full"
                                            onChange={handleImgChange}
                                            multiple
                                            ref={imgRef}
                                        /> */}
                                         <div>
                                            <button
                                                type="button"
                                                className="btn btn-primary justify-center align-center"
                                                onClick={handleClick}
                                            >
                                              Add Photos
                                            </button>
                                          </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleImgChange}
                                                multiple
                                                ref={imgRef}
                                            />
                                        </div>
                                        <div className='flex justify-center items-center mt-4'>
                                          <div className={`carousel rounded-box w-full ${images.length > 0 ? "h-[400px]" : ""}`}>
                                                {images.map((img, index) => (
                                                    <div key={index} className='carousel-item relative w-full'>
                                                        <IoCloseSharp
                                                            className='absolute top-2 right-3 z-50 text-white bg-gray-300 rounded-full w-5 h-5 cursor-pointer'
                                                            onClick={() => removeImage(index)}
                                                        />
                                                        <img src={img} alt={`Selected ${index}`} className='w-full h-[400px] object-contain' />
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
                                    {/* Content for Recipe tab */}
                                </div>
                            )}
                            <div className='flex ml-[90%] justify-between py-2 border-t-gray-300'>
                                <button className='btn btn-primary rounded-full btn-sm text-white px-4' type='submit'>
                                    {isPending ? "Posting..." : "Post"}
                                </button>
                            </div>
                            {isError && <div className='text-red-500'>Something went wrong</div>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
