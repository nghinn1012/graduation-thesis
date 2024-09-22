const ShoppingListSkeleton = () => {
  return (
    <div className="card bg-base-100 shadow-md my-4">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-6 w-48 skeleton"></div>
            <button className="p-2">
              <div className="h-6 w-6 skeleton"></div>{" "}
            </button>
          </div>
          <div className="h-6 w-6 skeleton"></div>
        </div>

        <div className="mt-4">
          <div className="card bg-base-100 shadow-md my-2 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 skeleton"></div>{" "}
                  <div className="h-6 w-32 skeleton"></div>{" "}
                  <div className="h-6 w-16 skeleton ml-4"></div>{" "}
                </div>
              </div>
              <div className="h-6 w-6 skeleton"></div>{" "}
            </div>
          </div>

          <div className="card bg-base-100 shadow-md my-2 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 skeleton"></div>{" "}
                  <div className="h-6 w-32 skeleton"></div>{" "}
                  <div className="h-6 w-16 skeleton ml-4"></div>{" "}
                </div>
              </div>
              <div className="h-6 w-6 skeleton"></div>{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShoppingListSkeleton;
