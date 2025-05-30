import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LikeButton({ 
  itemId, 
  isLiked, 
  likes, 
  onLikeToggle,
  isLoading = false 
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onLikeToggle(itemId);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        disabled={isLoading}
      >
        <motion.div
          key={`${itemId}-${isLiked}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`h-5 w-5 ${
              isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </motion.div>
      </Button>
      <span className="text-sm text-muted-foreground">{likes} likes</span>
    </div>
  );
}


// import { React, useEffect, useState } from "react";
// import { Button } from "./ui/button";
// import { Heart } from "lucide-react";
// import { motion } from "framer-motion";
// import { useAuth } from "./AuthContext";
// import axios from "axios";

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
// const axiosConfig = {
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true
// };

// export default function LikeButton({ itemId, itemCategory, initialLikes }) {
//   const [likes, setLikes] = useState(initialLikes);
//   const [isLiked, setIsLiked] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [animateKey, setAnimateKey] = useState(0);
//   const { user } = useAuth();

//   const getUserFavorites = async () => {
//     if (!user || !user.user_id) return;

//     try {
//       const response = await axios.get(
//         `${BACKEND_URL}/favorites?category=${itemCategory}`,
//         axiosConfig
//       );

//       if (response.data.getSuccess) {
//         const favorites = response.data.userFavorites;
//         const liked = favorites.includes(itemId);
//         setIsLiked(liked);
//       }
//     } catch (error) {
//       console.error("Failed to fetch user favorites:", error);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       getUserFavorites();
//     }
//   }, [user]);

//   const handleLike = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!user || isLoading) return;

//     setIsLoading(true);

//     try {
//       const res = await axios.post(
//         `${BACKEND_URL}/favorites/toggle`,
//         { itemId },
//         axiosConfig
//       );

//       if (res.data.toggleSuccess) {
//         setIsLiked(res.data.isLiked);
//         setLikes(res.data.newLikeCount);
//         setAnimateKey((prev) => prev + 1);
//       }
//     } catch (error) {
//       console.error("Error toggling like:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center gap-1">
//       <Button
//         variant="ghost"
//         size="icon"
//         className="h-8 w-8"
//         onMouseDown={(e) => e.stopPropagation()}
//         onClick={handleLike}
//         disabled={isLoading}
//       >
//         <motion.div
//           key={animateKey}
//           initial={{ scale: 1 }}
//           animate={{ scale: [1, 1.2, 1] }}
//           transition={{ duration: 0.3 }}
//         >
//           <Heart
//             className={`h-5 w-5 ${
//               isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
//             }`}
//           />
//         </motion.div>
//       </Button>
//       <span className="text-sm text-muted-foreground">{likes} likes</span>
//     </div>
//   );
// }
