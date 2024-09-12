import React from 'react';

const PostDetailsSkeleton = () => {
  return (
    <div className="relative p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Image Placeholder */}
      <div className="relative">
        <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
        <button className="absolute top-4 left-4 w-10 h-10 bg-gray-300 rounded-full animate-pulse"></button>
        <div className="absolute top-4 right-4 space-x-2 flex">
          <button className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></button>
        </div>
      </div>

      {/* Text Content */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-lg font-bold bg-gray-200 animate-pulse w-1/4 h-4 block"></span>
          <span className="text-sm bg-gray-200 animate-pulse w-1/6 h-4 block"></span>
        </div>

        {/* Tags */}
        <div className="flex mt-2 gap-2">
          <span className="bg-gray-200 animate-pulse py-2 px-4 rounded-full font-bold text-white w-24 h-8 block"></span>
        </div>

        <div className="flex mt-2 gap-2">
          <span className="bg-gray-200 animate-pulse py-2 px-4 rounded-full w-48 h-6 block"></span>
        </div>

        {/* Social Interaction Section */}
        <div className="flex items-center justify-between mt-4 text-gray-600 w-full">
          <div className="flex space-x-4 items-center justify-center flex-grow">
            <div className="flex gap-8 items-center">
              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse w-12 h-4 rounded"></div>
              </button>

              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse w-12 h-4 rounded"></div>
              </button>

              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse w-12 h-4 rounded"></div>
              </button>

              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="bg-gray-200 animate-pulse w-12 h-4 rounded"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Author Info */}
      <div className="relative z-10 p-4 bg-gray-200 rounded-t-lg">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="ml-3">
            <h2 className="font-semibold bg-gray-200 animate-pulse w-1/4 h-4"></h2>
            <p className="text-sm bg-gray-200 animate-pulse w-1/4 h-4"></p>
          </div>
          <button className="ml-auto w-24 h-8 bg-gray-300 rounded-full animate-pulse"></button>
        </div>

        <div className="tabs tabs-boxed" role="tablist">
          <a className="tab bg-gray-200 animate-pulse w-1/4 h-8"></a>
          <a className="tab bg-gray-200 animate-pulse w-1/4 h-8"></a>
          <a className="tab bg-gray-200 animate-pulse w-1/4 h-8"></a>
        </div>

        {/* Recipe Instructions */}
        <div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase bg-gray-200 animate-pulse w-1/4 h-4"></span>
              <div className="flex items-center border border-gray-300 rounded-full">
                <button className="px-3 py-1 bg-gray-300 border-r border-gray-300"></button>
                <span className="px-4 py-1 bg-gray-200 animate-pulse w-1/4 h-4"></span>
                <button className="px-3 py-1 bg-gray-300 border-l border-gray-300"></button>
              </div>
            </div>

            <ul className="mt-2 mx-4">
              {[...Array(3)].map((_, index) => (
                <li
                  key={index}
                  className="flex justify-between py-4 border-b border-gray-300 last:border-b-0"
                >
                  <span className="bg-gray-200 animate-pulse w-1/2 h-4"></span>
                  <span className="bg-gray-200 animate-pulse w-1/4 h-4"></span>
                </li>
              ))}
            </ul>

            <div className="flex flex-row gap-10 mt-4 justify-center">
              <button className="btn btn-md bg-gray-300 rounded-full animate-pulse w-24 h-8"></button>
              <button className="btn btn-md bg-gray-300 rounded-full animate-pulse w-24 h-8"></button>
            </div>
          </div>

          <div className="mt-6 ml-4">
            <h2 className="text-lg font-semibold uppercase bg-gray-200 animate-pulse w-1/3 h-4"></h2>
            <div className="instructions-container mt-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="card w-full bg-gray-200 animate-pulse shadow-md my-4"
                >
                  <div className="card-body flex items-start gap-4">
                    <div className="flex flex-col w-full">
                      <figure className="w-full h-[300px] bg-gray-300 animate-pulse"></figure>
                      <div className="flex flex-row gap-4 mt-2 w-full">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        <h2 className="font-bold w-full mt-1 bg-gray-200 animate-pulse w-3/4 h-4"></h2>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsSkeleton;
