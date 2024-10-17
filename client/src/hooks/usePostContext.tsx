import { useContext } from "react";
import PostContext from "../context/PostContext";

const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};

export default usePostContext;
