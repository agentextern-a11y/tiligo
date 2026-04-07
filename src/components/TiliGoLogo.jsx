export default function TiliGoLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-7",
    md: "h-9",
    lg: "h-14",
    xl: "h-20",
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png"
        alt="TiliGo"
        className={`${sizes[size]} w-auto object-contain`}
      />
      <span className="sr-only">TiliGo</span>
    </div>
  );
}