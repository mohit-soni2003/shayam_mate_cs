import { useReveal } from "../../hooks/useReveal";

// Wraps any block in fade+rise-on-scroll. `delay` staggers siblings (ms).
const Reveal = ({ as: Tag = "div", delay = 0, className = "", children, ...rest }) => {
  const [ref, isVisible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal${isVisible ? " reveal--visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
