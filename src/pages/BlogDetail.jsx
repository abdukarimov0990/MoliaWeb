import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchBlogs } from "../../bot/firebase";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBlog = async () => {
      try {
        const blogs = await fetchBlogs();
        const found = blogs.find((b) => b.id === id);
        setBlog(found || null);
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    getBlog();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10">⏳ Yuklanmoqda...</p>;
  }

  if (!blog) {
    return <p className="text-center py-10 text-red-500">Blog topilmadi ❌</p>;
  }

  // 🔑 Block rendering
  const renderBlock = (block, idx) => {
    switch (block.type) {
      case "h1":
        return (
          <h1 key={idx} className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            {block.text}
          </h1>
        );
      case "h2":
        return (
          <h2 key={idx} className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
            {block.text}
          </h2>
        );
      case "p":
        return (
          <p key={idx} className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
            {block.text}
          </p>
        );
      case "quote":
        return (
          <blockquote
            key={idx}
            className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-4"
          >
            {block.text}
          </blockquote>
        );
      case "img":
        return (
          <figure key={idx} className="my-6">
            <img
              src={block.url || "https://via.placeholder.com/800x400?text=No+Image"}
              alt={block.caption || "Blog image"}
              className="w-full rounded-2xl shadow-lg"
            />
            {block.caption && (
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-main">
      {/* Blog category and date */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
        <span>📂 {blog.category || "Umumiy"}</span>
        <span>
          📅{" "}
          {blog.createdAt
            ? new Date(blog.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Render all blocks */}
      <div className="prose max-w-none dark:prose-invert">
        {blog.blocks && blog.blocks.map((block, idx) => renderBlock(block, idx))}
      </div>
    </div>
  );
};

export default BlogDetail;
