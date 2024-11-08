import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePostContext } from '../../context/PostContext';
import { PostInfo } from '../../api/post';
import { IoMdHeart } from 'react-icons/io';
import { TbMessageCircleFilled } from "react-icons/tb";
import { ExploreSkeleton } from '../../components/skeleton/ExploreSkeleton';


const Explore: React.FC = () => {
  const { posts, isLoading, loadMorePosts } = usePostContext();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPostRef = (node: HTMLElement | null) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMorePosts();
      }
    });

    if (node) observerRef.current.observe(node);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-4 my-10">
      {posts.map((post: PostInfo, index: number) => (
        <Link key={post._id} to={`/posts/${post._id}`} state={{ post, postAuthor: post.author }}>
          <div className="relative group">
            <img
              src={post.images[0]}
              alt={post.about}
              className="w-full aspect-square object-cover rounded"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded">
              <div className="flex items-center text-white">
                <span className="flex items-center mr-4">
                  <IoMdHeart className="text-white"/>
                  <span className="ml-1">{post.likeCount}</span>
                </span>
                <span className="flex items-center">
                  <TbMessageCircleFilled className="text-white"/>
                  <span className="ml-1">{post.commentCount}</span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {isLoading && <ExploreSkeleton />}
      {posts.length > 0 && <div ref={lastPostRef} />}
    </div>
  );
};

export default Explore;
